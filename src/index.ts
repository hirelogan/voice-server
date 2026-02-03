import { Prompts } from "./prompts"
import { supabase } from "./supabase/client"
import type {
  CallParameters,
  CallResultWithDetails,
  ElevenLabsAudioMessage,
  ElevenLabsMessage,
  OutboundCallRequest,
  TwimlQueryParams,
} from "./types/call"
import type { MyConversationInitiationClientDataRequestInput } from "./types/elevenlabs"
import { formatDate } from "./utils/formatter"
import logger from "./utils/logger"
import fastifyFormBody from "@fastify/formbody"
import fastifyWs from "@fastify/websocket"
import { parse } from "date-fns"
import { fromZonedTime } from "date-fns-tz"
import dotenv from "dotenv"
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify"
import Twilio from "twilio"
import WebSocket from "ws"

dotenv.config()

const { ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
  process.env

if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("Missing required environment variables")
  throw new Error("Missing required environment variables")
}

const callSessions: Map<string, CallParameters> = new Map()

const fastify: FastifyInstance = Fastify()
fastify.register(fastifyFormBody)
fastify.register(fastifyWs)

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000

fastify.get("/", async (_: FastifyRequest, reply: FastifyReply) => {
  reply.send({ message: "Server is running" })
})

const twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

async function getSignedUrl(): Promise<string> {
  try {
    const apiKey = ELEVENLABS_API_KEY as string

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`)
    }

    const data = await response.json()
    return data.signed_url
  } catch (error) {
    console.error("Error getting signed URL:", error)
    throw error
  }
}

fastify.post<{ Body: OutboundCallRequest }>("/outbound-call", async (request, reply: FastifyReply) => {
  const { call_event_id } = request.body

  logger.info(`[Server] Received outbound call request with event ID: ${call_event_id}`)

  if (!call_event_id) {
    return reply.code(400).send({ error: "Call event ID is required" })
  }

  const { data: callData, error: callError } = await supabase
    .from("event_call")
    .select("*")
    .eq("id", call_event_id)
    .single()
  if (callError) {
    return reply.code(500).send({ error: `Failed to fetch call data: ${callError.message}` })
  }
  if (!callData) {
    return reply.code(404).send({ error: `Call event with ID ${call_event_id} not found` })
  }

  const { data: personData, error: personError } = await supabase
    .from("person")
    .select("*")
    .eq("id", callData.to_person)
    .single()
  if (personError) {
    return reply.code(500).send({ error: `Failed to fetch person data: ${personError.message}` })
  }
  if (!personData) {
    return reply.code(404).send({ error: `Person with ID ${callData.to_person} not found` })
  }

  const { data: chaseData, error: chaseError } = await supabase
    .rpc("get_chases_with_events", {
      chase_id_param: callData.chase_id,
    })
    .single()
  if (chaseError) {
    return reply.code(500).send({ error: `Failed to fetch chase data: ${chaseError.message}` })
  }
  if (!chaseData) {
    return reply.code(404).send({ error: `Chase with ID ${callData.chase_id} not found` })
  }

  const prompts = new Prompts(chaseData, callData, personData)

  const firstMessage = prompts.getFirstMessage()
  const systemPrompt = prompts.getPrompt()

  callSessions.set(call_event_id, {
    prompt: systemPrompt || "",
    first_message: firstMessage || "",
    person: personData,
  })

  logger.info(
    `[Server] Initiating outbound call to ${personData.first_name} ${personData.last_name} from ${chaseData.invoice?.to_company?.name} via ${personData.phone}`,
  )

  try {
    const call = await twilioClient.calls.create({
      from: TWILIO_PHONE_NUMBER,
      to: personData.phone.replace(/\s/g, ""),
      url: `https://${request.headers.host}/outbound-call-twiml?session_id=${call_event_id}`,
    })

    reply.send({
      success: true,
      message: "Call initiated",
      callSid: call.sid,
    })
  } catch (error) {
    console.error("Error initiating outbound call:", error)
    reply.code(500).send({
      success: false,
      error: "Failed to initiate call",
    })
  }
})

// TwiML route for outbound calls
fastify.all<{ Querystring: TwimlQueryParams }>("/outbound-call-twiml", async (request, reply: FastifyReply) => {
  const { session_id } = request.query

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Connect>
        <Stream url="wss://${request.headers.host}/outbound-media-stream">
            <Parameter name="session_id" value="${session_id}" />
        </Stream>
        </Connect>
    </Response>`

  reply.type("text/xml").send(twimlResponse)
})

// WebSocket route for handling media streams
fastify.register(async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.get("/outbound-media-stream", { websocket: true }, (ws: WebSocket) => {
    console.info("[Server] Twilio connected to outbound media stream")

    // Variables to track the call
    let streamSid: string | null = null
    let callSid: string | null = null
    let elevenLabsWs: WebSocket | null = null
    let customParameters: CallParameters | null = null

    let callResult: CallResultWithDetails = { status: "no_reply" }

    // Handle WebSocket errors
    ws.on("error", console.error)

    // Set up ElevenLabs connection
    const setupElevenLabs = async (): Promise<void> => {
      try {
        const signedUrl = await getSignedUrl()
        elevenLabsWs = new WebSocket(signedUrl)

        elevenLabsWs.on("open", () => {
          logger.info("[ElevenLabs] Connected to Conversational AI")

          if (!elevenLabsWs) return

          // Send initial configuration with prompt and first message
          const initialConfig: MyConversationInitiationClientDataRequestInput = {
            type: "conversation_initiation_client_data",
            // dynamic_variables: {
            //   user_name: "Angelo",
            //   user_id: 1234,
            // },
            conversation_config_override: {
              agent: {
                prompt: {
                  prompt: customParameters?.prompt || "you are a gary from the phone store",
                },
                first_message: customParameters?.first_message || "hey there! how can I help you today?",
              },
            },
          }

          logger.info(
            `[ElevenLabs] Sending initial config with prompt: ${initialConfig.conversation_config_override!.agent!.prompt!.prompt}`,
          )

          // Send the configuration to ElevenLabs
          elevenLabsWs.send(JSON.stringify(initialConfig))
        })

        elevenLabsWs.on("message", (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString()) as ElevenLabsMessage

            switch (message.type) {
              case "conversation_initiation_metadata":
                logger.info("[ElevenLabs] Received initiation metadata")
                break

              case "audio":
                if (streamSid) {
                  if (message.audio?.chunk) {
                    const audioData = {
                      event: "media",
                      streamSid,
                      media: {
                        payload: message.audio.chunk,
                      },
                    }
                    ws.send(JSON.stringify(audioData))
                  } else if (message.audio_event?.audio_base_64) {
                    const audioData = {
                      event: "media",
                      streamSid,
                      media: {
                        payload: message.audio_event.audio_base_64,
                      },
                    }
                    ws.send(JSON.stringify(audioData))
                  }
                } else {
                  logger.info("[ElevenLabs] Received audio but no StreamSid yet")
                }
                break

              case "interruption":
                if (streamSid) {
                  ws.send(
                    JSON.stringify({
                      event: "clear",
                      streamSid,
                    }),
                  )
                }
                break

              case "ping":
                if (message.ping_event?.event_id && elevenLabsWs) {
                  elevenLabsWs.send(
                    JSON.stringify({
                      type: "pong",
                      event_id: message.ping_event.event_id,
                    }),
                  )
                }
                break

              case "agent_response":
                logger.info(`[Twilio] Agent response: ${message.agent_response_event?.agent_response}`)
                break

              case "user_transcript":
                logger.info(`[Twilio] User transcript: ${message.user_transcription_event?.user_transcript}`)
                break

              case "client_tool_call": {
                const { client_tool_call } = message
                const { tool_name, tool_call_id, parameters } = client_tool_call!
                logger.info(`[ElevenLabs] Received client tool call: ${tool_name} with parameters:`)
                console.log(parameters)

                if (!elevenLabsWs) {
                  console.error("[ElevenLabs] WebSocket not connected")
                  return
                }

                try {
                  if (tool_name === "schedule_call_back") {
                    const { datetime_str } = parameters
                    if (!datetime_str) {
                      throw new Error("Datetime is required")
                    }

                    const parsedDate = parse(datetime_str, "yyyy-MM-dd h:mm a", new Date())
                    const utcDate = fromZonedTime(parsedDate, "UTC")

                    callResult = { status: "reschedule", rescheduleDate: utcDate }
                    elevenLabsWs.send(
                      JSON.stringify({
                        type: "client_tool_result",
                        tool_call_id,
                        result: `Reply exactly with phrase: 'No worries at all. Speak shortly!'`,
                        is_error: false,
                      }),
                    )
                  } else if (tool_name === "payment_confirmed") {
                    const { date } = parameters
                    if (!date) {
                      throw new Error("Date is required")
                    }

                    const parsedDate = parse(date, "yyyy-MM-dd", new Date())
                    const utcDate = fromZonedTime(parsedDate, "UTC")
                    callResult = { status: "agreed_to_pay", paymentDate: utcDate }
                    elevenLabsWs.send(
                      JSON.stringify({
                        type: "client_tool_result",
                        tool_call_id,
                        result: `Reply exactly with phrase: 'Thanks for confirming the payment until ${formatDate(utcDate.toISOString(), false, false)} ${customParameters?.person?.first_name}. Have a great day!'`,
                        // result: `Reply exactly with phrase: 'Thanks for confirming the payment until ${formatDate(utcDate.toISOString(), false, false)} ${customParameters?.person?.first_name}. Have a great day!' and end the call using \`end_call\` tool.`,
                        is_error: false,
                      }),
                    )
                  } else if (tool_name === "financial_hardship") {
                    callResult = { status: "financial_hardship" }
                    elevenLabsWs.send(
                      JSON.stringify({
                        type: "client_tool_result",
                        tool_call_id,
                        result: `Reply exactly with phrase: 'I understand ${customParameters?.person?.first_name}. I'll let my team know of the situation and will follow up on possible solutions. Have a great day!' and end the call using \`end_call\` tool.`,
                        is_error: false,
                      }),
                    )
                  } else {
                    throw new Error(`Unhandled client tool call: ${tool_name}`)
                  }
                } catch (error) {
                  console.error("[ElevenLabs] Error processing client tool call:", error)
                  elevenLabsWs.send(
                    JSON.stringify({
                      type: "client_tool_result",
                      tool_call_id,
                      result: JSON.stringify(error),
                      is_error: true,
                    }),
                  )
                }
                break
              }
              default:
                logger.info(`[ElevenLabs] Unhandled message type: ${message.type}`)
            }
          } catch (error) {
            console.error("[ElevenLabs] Error processing message:", error)
          }
        })

        elevenLabsWs.on("error", (error: Error) => {
          console.error("[ElevenLabs] WebSocket error:", error)
        })

        elevenLabsWs.on("close", () => {
          logger.info("[ElevenLabs] Disconnected")

          // End the Twilio call if we have a callSid
          if (callSid) {
            logger.info(`[Twilio] Ending call ${callSid} due to ElevenLabs disconnection`)

            // // sleep for 1 second
            setTimeout(() => {
              twilioClient
                .calls(callSid!)
                .update({ status: "completed" })
                .then(() => logger.info(`[Twilio] Successfully ended call ${callSid}`))
                .catch((error) => console.error(`[Twilio] Error ending call ${callSid}:`, error))
            }, 1000)

            logger.info(`[Server] Call result: ${JSON.stringify(callResult)}`)
          }
        })
      } catch (error) {
        logger.error("[ElevenLabs] Setup error:")
        console.error(error)
      }
    }

    // Set up ElevenLabs connection
    setupElevenLabs()

    // Handle messages from Twilio
    ws.on("message", (message: WebSocket.Data) => {
      try {
        const msg = JSON.parse(message.toString())
        if (msg.event !== "media") {
          logger.info(`[Twilio] Received event: ${msg.event}`)
        }

        switch (msg.event) {
          case "start": {
            streamSid = msg.start.streamSid
            callSid = msg.start.callSid
            customParameters = msg.start.customParameters
            const sessionId = msg.start.customParameters.session_id
            const sessionData = callSessions.get(sessionId)
            if (sessionData) {
              customParameters = sessionData
            } else {
              console.error("Session data not found for session ID:", sessionId)
            }
            logger.info(`[Twilio] Stream started - StreamSid: ${streamSid}, CallSid: ${callSid}`)
            console.log("[Twilio] Start parameters:", customParameters)
            callSessions.delete(sessionId)
            break
          }
          case "media":
            if (elevenLabsWs?.readyState === WebSocket.OPEN) {
              const audioMessage: ElevenLabsAudioMessage = {
                user_audio_chunk: Buffer.from(msg.media.payload, "base64").toString("base64"),
              }
              elevenLabsWs.send(JSON.stringify(audioMessage))
            }
            break

          case "stop":
            logger.info(`[Twilio] Stream ${streamSid} ended`)
            if (elevenLabsWs?.readyState === WebSocket.OPEN) {
              elevenLabsWs.close()
            }
            break

          default:
            logger.info(`[Twilio] Unhandled event: ${msg.event}`)
        }
      } catch (error) {
        logger.error("[Twilio] Error processing message:")
        console.error(error)
      }
    })

    // Handle WebSocket closure
    ws.on("close", () => {
      logger.info("[Twilio] Client disconnected")
      if (elevenLabsWs?.readyState === WebSocket.OPEN) {
        elevenLabsWs.close()
      }
    })
  })
})

// Start the Fastify server
fastify.listen({ host: "0.0.0.0", port: PORT }, (err) => {
  if (err) {
    logger.error("Error starting server:")
    console.error(err)
    process.exit(1)
  }
  logger.info(`[Server] Listening on port ${PORT}`)
})
