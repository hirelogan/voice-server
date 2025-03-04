import { Database } from "../db/types"
import { formatDate } from "./utils"

export class Prompts {
  chase: Database["public"]["CompositeTypes"]["chase_with_events"]
  callEvent: Database["public"]["Tables"]["event_call"]["Row"]
  person: Database["public"]["Tables"]["person"]["Row"]

  constructor(
    chase: Database["public"]["CompositeTypes"]["chase_with_events"],
    callEvent: Database["public"]["Tables"]["event_call"]["Row"],
    person: Database["public"]["Tables"]["person"]["Row"],
  ) {
    this.chase = chase
    this.callEvent = callEvent
    this.person = person
  }

  getFirstMessage() {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.chase.invoice?.currency! || "USD",
      maximumFractionDigits: 0,
    }).format(Math.floor(this.chase.invoice?.amount!) || 0)
    return `Hey ${this.person?.first_name!}, this is Logan from ${this.chase.invoice?.from_company?.name!}. I’m following up on the outstanding invoice for ${formattedAmount} which was due on ${formatDate(this.chase.invoice?.due_date!, false)}. I wanted to check if there’s anything holding up payment.`
  }

  getPrompt() {
    let basePrompt = `You are Logan, an AI representative of ${this.chase.invoice?.from_company?.name!}.\n\nYou are calling ${this.person?.first_name!} ${this.person?.last_name!} from ${this.chase.invoice?.to_company?.name!} to follow up on an outstanding invoice for ${this.chase.invoice?.amount!} ${this.chase.invoice?.currency!} which was due on ${formatDate(this.chase.invoice?.due_date!, false)}. Your company, ${this.chase.invoice?.from_company?.name!}, provided following services:\n${this.chase.invoice?.service_description!}.\n\nYou should communicate in a ${this.chase.tone} tone.`

    if (this.chase.prompt) {
      basePrompt += `\n\nHere is additional information left by your colleagues that might be helpful:\n${this.chase.prompt}`
    }

    basePrompt += `\n\nNow is ${new Date().toUTCString()}.`

    return basePrompt
  }
}
