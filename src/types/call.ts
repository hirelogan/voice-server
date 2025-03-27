import type { Database } from "../types/db"
import { ClientEvent } from "elevenlabs/api"
import { z } from "zod"

const CallResultSchema = z.enum([
  "no_reply",
  "wrong_number",
  "wrong_person",
  "redirect_to_human",
  "reschedule",
  "prior_payment_claim",
  "financial_hardship",
  "payment_dispute",
  "agreed_to_pay",
])
const BaseCallResultSchema = z.object({
  status: CallResultSchema,
})
const RescheduleCallResultSchema = BaseCallResultSchema.extend({
  status: z.literal(CallResultSchema.enum.reschedule),
  rescheduleDate: z.date(),
})
const AgreedToPayCallResultSchema = BaseCallResultSchema.extend({
  status: z.literal(CallResultSchema.enum.agreed_to_pay),
  paymentDate: z.date(),
})
export const CallResultWithDetailsSchema = z.discriminatedUnion("status", [
  BaseCallResultSchema.extend({ status: z.literal(CallResultSchema.enum.no_reply) }),
  BaseCallResultSchema.extend({ status: z.literal(CallResultSchema.enum.wrong_number) }),
  BaseCallResultSchema.extend({ status: z.literal(CallResultSchema.enum.wrong_person) }),
  BaseCallResultSchema.extend({ status: z.literal(CallResultSchema.enum.redirect_to_human) }),
  BaseCallResultSchema.extend({ status: z.literal(CallResultSchema.enum.prior_payment_claim) }),
  BaseCallResultSchema.extend({ status: z.literal(CallResultSchema.enum.financial_hardship) }),
  BaseCallResultSchema.extend({ status: z.literal(CallResultSchema.enum.payment_dispute) }),
  RescheduleCallResultSchema,
  AgreedToPayCallResultSchema,
])
export type CallResultWithDetails = z.infer<typeof CallResultWithDetailsSchema>

export interface OutboundCallRequest {
  call_event_id: string
}

export interface TwimlQueryParams {
  session_id: string
}

export interface CallParameters {
  prompt?: string
  first_message?: string
  person?: Database["public"]["Tables"]["person"]["Row"]
}

export interface ElevenLabsAudioMessage {
  user_audio_chunk: string
}

export interface ElevenLabsMessage {
  type: ClientEvent
  audio?: {
    chunk: string
  }
  audio_event?: {
    audio_base_64: string
  }
  ping_event?: {
    event_id: string
  }
  agent_response_event?: {
    agent_response: string
  }
  user_transcription_event?: {
    user_transcript: string
  }
  client_tool_call?: {
    tool_name: string
    tool_call_id: string
    parameters: Record<string, string>
  }
}
