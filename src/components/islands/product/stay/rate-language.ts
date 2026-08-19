/**
 * How a rate's facts become the sentences the table prints.
 *
 * The sentences themselves live in `copy.ts`; what stays here is the decision
 * about *which* one a state deserves, because that decision is a commitment the
 * operator has to honour at the desk — a board basis, a cancellation deadline,
 * a count of rooms left. Every function takes its words as a parameter rather
 * than holding them: a helper with a literal inside it is a helper that cannot
 * be published in a second language, and it is the one place a translated page
 * would still print Romanian.
 */
import type { AvailabilityState } from "~/lib/product/mode"

import { counted, type Copy } from "./copy"

/**
 * Board bases, said out loud.
 *
 * `BB` and `HB` are trade shorthand. A traveller reading "HB" either guesses or
 * calls, and both outcomes are the theme's fault; the code survives only as a
 * `title` on the words, for the reader who already knows it.
 */
export function boardWords(code: string, copy: Copy): string {
  const key = code.trim().toUpperCase()
  /*
   * An unrecognised code is shown verbatim rather than mapped to the nearest
   * guess. Rendering an operator's unknown "HB+" as "Half board" sells a meal
   * plan nobody agreed to serve.
   */
  return copy.board[key] ?? code.trim()
}

/**
 * The moment the free-cancellation window closes, written out in full.
 *
 * Formatted in UTC on purpose. The contract's dates are date-only, which parses
 * as UTC midnight; rendering that in a negative-offset timezone slides the
 * deadline a day earlier, and a cancellation date that is off by one is worse
 * than no date at all — it is the promise this line exists to keep.
 *
 * The month name follows the page's language rather than Romanian, because
 * "14 septembrie 2026" inside an English sentence is a deadline half this
 * table's readers cannot parse.
 */
export function cancelDate(iso: string, locale: string | undefined): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ""
  try {
    return parsed.toLocaleDateString(locale || "en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
  } catch {
    /* A locale tag ICU rejects must not throw away the date entirely — an
     * empty string here silently drops the cancellation promise. */
    return parsed.toLocaleDateString("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
  }
}

/**
 * The same formatter `PriceBlock` uses, deliberately.
 *
 * The per-night subtitle sits directly under the headline total. If one groups
 * thousands and the other does not, the two numbers read as coming from two
 * different systems, and the reader stops trusting both. It does not follow the
 * reader's language for the same reason: the theme prices in one shape
 * everywhere.
 */
export function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export interface RateStatus {
  /** Whether this row may be chosen at all. */
  bookable: boolean
  /** The one line of state, when the state has something to say. */
  note?: string
  /** What the action says. Absent when there is no action. */
  cta?: string
  /** Present for honesty rather than for sale: render it recessive. */
  muted: boolean
}

/**
 * What a rate's availability means for the reader.
 *
 * Every `AvailabilityState` is answered here, because the states this theme
 * would rather ignore are exactly the ones a traveller acts on: `on_request` is
 * not a booking, `expired` is not a price, and `not_offered` is not a sell-out.
 * Collapsing them into "unavailable" is how a page ends up taking money for a
 * room the operator has to ring somebody to confirm.
 */
export function statusOf(
  state: AvailabilityState,
  copy: Copy,
  locale: string | undefined,
  roomsLeft?: number,
): RateStatus {
  switch (state) {
    case "available":
      return { bookable: true, cta: copy.choose, muted: false }
    case "guaranteed":
      return { bookable: true, cta: copy.choose, note: copy.instantConfirmation, muted: false }
    case "few_left": {
      const note = scarcity(copy, locale, roomsLeft)
      return { bookable: true, cta: copy.choose, muted: false, ...(note ? { note } : {}) }
    }
    case "on_request":
      return {
        bookable: true,
        cta: copy.requestAvailability,
        note: copy.onRequestNote,
        muted: false,
      }
    case "waitlist":
      return {
        bookable: true,
        cta: copy.joinWaitlist,
        note: copy.waitlistNote,
        muted: false,
      }
    case "sold_out":
      return { bookable: false, note: copy.soldOutNote, muted: true }
    case "not_offered":
      /*
       * Distinct from sold out on purpose: this rate was never sold for these
       * dates, so "sold out" would suggest waiting or trying again shortly.
       */
      return { bookable: false, note: copy.notOfferedNote, muted: true }
    case "expired":
      return {
        bookable: false,
        note: copy.expiredNote,
        muted: true,
      }
  }
}

/**
 * Scarcity is reported only when the operator supplied a real count.
 *
 * No count, no claim — and no count above three, because "7 rooms left" is not
 * scarcity, it is decoration. Manufactured urgency (timers, "X people are
 * looking") is enforced against under the EU unfair-practices directive and
 * neither reference site in this market uses it.
 */
function scarcity(copy: Copy, locale: string | undefined, roomsLeft?: number): string | undefined {
  if (roomsLeft === undefined || roomsLeft < 1) return undefined
  if (roomsLeft <= 3) return counted(locale, copy.roomsLeft, roomsLeft)
  return undefined
}

/**
 * A room that cannot hold the party is shown, and shown as unavailable.
 *
 * Hiding it leaves the reader wondering whether the hotel has a family room at
 * all; saying "Maximum 2 guests" answers the question and sends them to the
 * apartment two rows down.
 */
export function tooSmall(
  maxOccupancy: number,
  copy: Copy,
  locale: string | undefined,
): RateStatus {
  return { bookable: false, note: counted(locale, copy.maxGuests, maxOccupancy), muted: true }
}

/** Same shape as `PriceBlock` builds, so a number reaches the same dialler. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`
}
