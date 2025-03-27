// eslint-disable-next-line
import type { ConversationInitiationClientData } from "elevenlabs/api"

declare module "elevenlabs/api" {
  interface ConversationInitiationClientData {
    type: string
  }
}
