import { formatDate } from "~/lib/dates"

import { counted, type Copy } from "./copy"

/**
 * Every figure and date this module prints, formatted in one place.
 *
 * The picker shows the same date three times over — as a pill, as the line the
 * reader confirms, and as the cancellation deadline — and a panel that writes
 * "20 Aug" in one row and "20/08/2026" in the next reads as two different days.
 * One module, one set of words.
 *
 * Nothing here holds a locale of its own. Every function takes the resolved
 * `Copy`, which carries the tag `Intl` is handed, so the panel's words and its
 * dates cannot end up in different languages — the failure a module-level
 * `const LOCALE` guarantees the first time a second language is published.
 */

/**
 * An ISO day as an instant, read back in UTC.
 *
 * A date-only string carries no timezone, so parsing `2026-08-20` as a local
 * instant lands on 19 August for any reader west of Greenwich — the trap
 * `src/lib/dates.ts` documents. Pinning both ends to UTC cannot shift the day.
 */
function instant(iso: string): Date | undefined {
  const date = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function format(copy: Copy, iso: string, options: Intl.DateTimeFormatOptions): string {
  const date = instant(iso)
  if (!date) return iso
  try {
    return new Intl.DateTimeFormat(copy.locale, { ...options, timeZone: "UTC" }).format(date)
  } catch {
    return iso
  }
}

/**
 * Which day the calendar's week starts on.
 *
 * Monday, explicitly, for every language this theme ships in. Not derived from
 * the locale: `en` alone among them would come back Sunday-first, and this is a
 * European travel theme whose English readers are `en-GB` — a week that
 * silently reorders itself when the same operator publishes an English edition
 * is a calendar two readers cannot compare. If an operator ever needs a
 * Sunday-first edition, this is the one line that decides it.
 */
export const WEEK_STARTS_ON = 1

/**
 * The calendar's column headers, and the same two letters on every date pill.
 *
 * Derived from `Intl` rather than written out, because a hardcoded row of codes
 * is a row in one language: the Romanian "LU MA MI JO VI SA DU" is simply wrong
 * above an English calendar. Cut to two characters on purpose — the short form
 * is three letters in English and four glyphs in Romanian, and a seven-column
 * grid visibly breaks the moment one column is wider than the six beside it.
 * Cached per locale so a month of cells does not build 42 formatters.
 */
const CODES = new Map<string, readonly string[]>()

function weekdayCodes(copy: Copy): readonly string[] {
  const cached = CODES.get(copy.locale)
  if (cached) return cached

  let codes: readonly string[]
  try {
    const naming = new Intl.DateTimeFormat(copy.locale, { weekday: "short", timeZone: "UTC" })
    /* 7 January 2024 was a Sunday, so the offset is the index `Date` uses. */
    codes = Array.from({ length: 7 }, (_, day) =>
      naming
        .format(new Date(Date.UTC(2024, 0, 7 + day)))
        .replace(/[^\p{L}]/gu, "")
        .slice(0, 2)
        .toUpperCase(),
    )
  } catch {
    codes = ["", "", "", "", "", "", ""]
  }

  CODES.set(copy.locale, codes)
  return codes
}

/** The code for a weekday index, counted the way `Date` counts: Sunday is 0. */
export function weekdayCodeAt(copy: Copy, day: number): string {
  return weekdayCodes(copy)[day] ?? ""
}

/** The two-letter code for an ISO day, read in UTC for the reason above. */
export function weekdayCodeOf(copy: Copy, iso: string): string {
  const date = instant(iso)
  return date ? weekdayCodeAt(copy, date.getUTCDay()) : ""
}

/** The weekday spelled out — "Thursday" — for the next-availability line. */
export function weekdayOf(copy: Copy, iso: string): string {
  return format(copy, iso, { weekday: "long" })
}

/** "20 Aug" — the short form a strip of pills has room for. */
export function dayMonthOf(copy: Copy, iso: string): string {
  return format(copy, iso, { day: "numeric", month: "short" })
}

/** The day of the month alone, for the large figure on a pill. */
export function dayOf(copy: Copy, iso: string): string {
  return format(copy, iso, { day: "numeric" })
}

/** "Aug" — the third line of a pill. */
export function monthShortOf(copy: Copy, iso: string): string {
  return format(copy, iso, { month: "short" })
}

/**
 * "20 August 2026". Deliberately the whole date, wherever a deadline or a
 * confirmed choice is stated: an abbreviation is fine for browsing and wrong
 * for the line that tells someone when their money stops being refundable.
 */
export function fullDateOf(copy: Copy, iso: string): string {
  return formatDate(copy.locale, iso)
}

/** "AUG 2026" — the calendar caption, from the `Date` react-day-picker hands us. */
export function monthYearOf(copy: Copy, month: Date): string {
  try {
    const label = new Intl.DateTimeFormat(copy.locale, { month: "short" }).format(month)
    return `${label.replace(/\./g, "").toUpperCase()} ${month.getFullYear()}`
  } catch {
    return String(month.getFullYear())
  }
}

/**
 * A duration as a traveller reads it: "2.5 hours", never "150 min".
 *
 * Both halves of that phrase are language-dependent and neither is spelled out
 * here. The noun's form comes from `Intl.PluralRules` against the dictionary's
 * own forms — Romanian needs "45 de minute" but "15 minute", which is the tell
 * of a translated interface when it is wrong — and the number goes through
 * `Intl.NumberFormat`, because "2.5 ore" reads as a typo at best and as two and
 * a half thousand at worst to a reader whose decimal separator is a comma.
 */
export function durationOf(copy: Copy, minutes: number): string {
  if (minutes <= 0) return ""
  if (minutes < 60) return counted(copy, copy.minutes, minutes)

  const hours = minutes / 60
  return counted(copy, copy.hours, hours, decimal(copy, hours))
}

function decimal(copy: Copy, value: number): string {
  try {
    return new Intl.NumberFormat(copy.locale, { maximumFractionDigits: 1 }).format(value)
  } catch {
    return String(value)
  }
}

/**
 * Language codes as words. An operator publishes "RO"; a reader deciding
 * whether they will understand the guide should not have to. An unknown code is
 * printed as given rather than dropped — a guide language the theme has no word
 * for is still a fact about the tour.
 */
export function languagesOf(copy: Copy, codes: string[]): string {
  return codes
    .map((code) => copy.languages[code.toUpperCase()] ?? code.toUpperCase())
    .join(", ")
}

/**
 * Money, formatted exactly as `PriceBlock` formats it.
 *
 * That component keeps its formatter private, and the two figures sit inches
 * apart on this panel — the headline "from 24 €" above a card's "48 € total".
 * If one of them grouped or rounded differently the panel would look like it
 * was quoting from two systems. Deliberately not the reader's locale either:
 * the theme prints `1.290 €` on every surface, and consistency across the site
 * beats agreement with the reader's keyboard. Copied rather than imported so
 * the duplication is visible; if `PriceBlock` ever exports it, delete this.
 */
export function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
