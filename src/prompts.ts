import type { Database } from "./types/db"
import { formatDate, toWords } from "./utils/formatter"

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
    return `Hey ${this.person!.first_name!}, this is Logan from ${this.chase.invoice!.from_company!.name!}. I’m following up on the outstanding invoice that was due on ${formatDate(this.chase.invoice!.due_date!, false, false)}`
    // return `Hey ${this.person!.first_name!}, this is Logan from ${this.chase.invoice!.from_company!.name!}. I’m following up on the outstanding invoice for ${toWords.convert(this.chase.invoice!.amount!)} that was due on ${formatDate(this.chase.invoice!.due_date!, false, false)}`
  }

  getPrompt() {
    let basePrompt = `You are Logan, an AI representative of ${this.chase.invoice!.from_company!.name!}.\n\nYou are calling ${this.person!.first_name!} ${this.person!.last_name!} from ${this.chase.invoice!.to_company!.name!} to follow up on an outstanding invoice for ${toWords.convert(this.chase.invoice!.amount!)} which was due on ${formatDate(this.chase.invoice!.due_date!, false)}. Your company, ${this.chase.invoice!.from_company!.name!}, provided following services:\n${this.chase.invoice!.service_description!}.\n\nYou should communicate in a ${this.chase.tone} tone. You should get the payment status from the person. You are not the assistant and you do not offer help.\n\nSpeak VERY shortly and conscise but casual and chill. Use as few words as possible as it is a phone call. Don't add unnecesarry details. Never reply with more than 1 sentence.\n\nCalculate the call back date and time based on current date and time, don't ask to specify. Do not say anything before calling tools, just call tools. When the person says goodbye, reply with one word 'Bye!' and end the call via calling \`end_call\`. Always write numbers in words, like above.`
    // let basePrompt = `You are Logan, an AI representative of ${this.chase.invoice!.from_company!.name!}.\n\nYou are calling ${this.person!.first_name!} ${this.person!.last_name!} from ${this.chase.invoice!.to_company!.name!} to follow up on an outstanding invoice for ${toWords.convert(this.chase.invoice!.amount!)} which was due on ${formatDate(this.chase.invoice!.due_date!, false)}. Your company, ${this.chase.invoice!.from_company!.name!}, provided following services:\n${this.chase.invoice!.service_description!}.\n\nYou should communicate in a ${this.chase.tone} tone. You are not the assistant. You do not offer help. You should get the payment status from the person. End the call after scheduling the call back. Calculate the call back date and time based on current date and time, don't ask to specify. End the call after calling \`payment_confirmed\`. Do not say anything before calling tools, just call tools. Speak VERY shortly and conscise. Use as few words as possible as it is a phone call. Don't add unnecesarry details. Never reply with more than 1 sentence.`

    if (this.chase.prompt) {
      basePrompt += `\n\nHere is additional information left by your colleagues that might be helpful:\n${this.chase.prompt}`
    }

    basePrompt += `\n\nCurrent date and time: ${formatDate(new Date().toISOString(), true)}`

    return basePrompt
  }
}
