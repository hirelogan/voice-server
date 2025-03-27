import { ToWords } from "to-words"

export function formatDate(dateString: string, includeTime = true, includeYear = true, timeZone = "UTC"): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    timeZone: timeZone,
  }

  if (includeYear) {
    options.year = "numeric"
  }

  if (includeTime) {
    options.hour = "2-digit"
    options.minute = "2-digit"
  }

  return date.toLocaleDateString("en-US", options)
}

export const toWords = new ToWords({
  localeCode: "en-GB",
  converterOptions: { currency: true, ignoreDecimal: true, doNotAddOnly: true },
})
