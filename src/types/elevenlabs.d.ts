// Import the original type
import type { ConversationInitiationClientDataRequestInput } from "elevenlabs/api"

// Create a new type with the additional field
export type MyConversationInitiationClientDataRequestInput = ConversationInitiationClientDataRequestInput & {
  type: string
}
