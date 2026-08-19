import type { Departure } from "~/lib/product/adapter"
import type { AvailabilityState } from "~/lib/product/mode"
import { bookingHref, type BookingTarget } from "~/lib/product/booking"

import { counted, type Copy } from "./copy"

/**
 * What each availability state looks like, and what it lets the reader do.
 *
 * One table rather than eight branches scattered through the row, the card and
 * the barometer, because the three surfaces have to agree: a date that is sold
 * out in the table and bookable on the phone is the failure this whole module
 * exists to avoid.
 */
export type Tone = "neutral" | "positive" | "warn" | "muted"

export interface DeparturePresentation {
  /** The one phrase that explains this row's state, when it needs one. */
  badge?: string
  tone: Tone
  cta: string
  disabled: boolean
  /** Whether the price is struck through — a fare nobody can buy any more. */
  strike: boolean
  /**
   * Whether a human, not the site, holds the answer for this date.
   *
   * Also the flag that keeps such a date away from the booking engine: the
   * operator has said somebody confirms it, and a link that reads "Book"
   * would be the page contradicting them in the one place it costs money.
   */
  callInstead: boolean
}

/** The badge shape, shared so the table and the cards cannot drift apart. */
export const BADGE =
  "inline-flex items-center rounded-pill border px-2.5 py-1 text-[0.6875rem] leading-none"

/** Likewise the CTA, which is the same control in two layouts. */
export const CTA =
  "inline-flex h-10 items-center justify-center rounded-pill px-5 text-[0.8125rem] font-medium transition-colors duration-300"

export const TONE_BADGE: Record<Tone, string> = {
  neutral: "border-line text-ink-muted",
  positive: "border-accent/35 bg-accent-wash text-accent",
  /* `brass` is this palette's amber. A literal amber would survive one theme
   * switch and then sit outside every other colour on the page. */
  warn: "border-brass/40 bg-brass/10 text-brass",
  muted: "border-line bg-surface-sunk text-ink-subtle",
}

/**
 * How one departure presents.
 *
 * `instantBook` decides the verb and nothing else. An operator who confirms by
 * hand still sells every one of these dates; what they cannot do is promise the
 * seat at the moment of the click, so the button asks for an offer instead of
 * claiming a booking.
 *
 * The words arrive as a parameter rather than being reached for here: a table
 * that resolves its own copy resolves it per row, and a helper holding literals
 * is a helper that cannot be published in a second language at all.
 */
export function presentDeparture(
  departure: Departure,
  instantBook: boolean,
  copy: Copy,
  locale: string | undefined,
): DeparturePresentation {
  const book = instantBook ? copy.book : copy.requestQuote

  switch (departure.state) {
    case "guaranteed":
      return {
        badge: copy.guaranteedDeparture,
        tone: "positive",
        cta: book,
        disabled: false,
        strike: false,
        callInstead: false,
      }

    case "few_left":
      /*
       * No count, no scarcity claim. The contract makes `seatsLeft` optional
       * precisely because an operator cannot always give one, and a number
       * invented to fill the gap is the dark pattern this theme refuses.
       */
      return {
        ...(departure.seatsLeft === undefined
          ? {}
          : { badge: counted(locale, copy.placesLeft, departure.seatsLeft) }),
        tone: departure.seatsLeft === undefined ? "neutral" : "warn",
        cta: book,
        disabled: false,
        strike: false,
        callInstead: false,
      }

    case "on_request":
      return {
        badge: copy.onRequest,
        tone: "neutral",
        cta: copy.requestAvailability,
        disabled: false,
        strike: false,
        callInstead: true,
      }

    case "waitlist":
      /*
       * A waitlist is a promise to call back, not a sale. It carries
       * `callInstead` for the same reason `on_request` does — the engine has
       * nothing to sell here, and a reader sent to a checkout would either find
       * nothing or, worse, pay for a seat that does not exist yet.
       */
      return {
        badge: copy.waitlist,
        tone: "warn",
        cta: copy.joinWaitlist,
        disabled: false,
        strike: false,
        callInstead: true,
      }

    case "sold_out":
      return {
        badge: copy.soldOut,
        tone: "muted",
        cta: copy.chooseAnotherDate,
        disabled: true,
        strike: true,
        callInstead: false,
      }

    case "not_offered":
      return {
        badge: copy.notRunning,
        tone: "muted",
        cta: copy.unavailable,
        disabled: true,
        strike: false,
        callInstead: false,
      }

    case "expired":
      return {
        badge: copy.offerExpired,
        tone: "muted",
        cta: copy.chooseAnotherDate,
        disabled: true,
        strike: true,
        callInstead: false,
      }

    default:
      return {
        tone: "neutral",
        cta: book,
        disabled: false,
        strike: false,
        callInstead: false,
      }
  }
}

/** Whether choosing this date leads anywhere. */
export function isSellable(state: AvailabilityState): boolean {
  return state !== "sold_out" && state !== "not_offered" && state !== "expired"
}

/**
 * Where one row's call to action actually goes.
 *
 * Four outcomes rather than a boolean, because the reasons a row may not reach
 * the booking engine are different reasons and must not be shown as the same
 * one. A sold-out date keeps the disabled control it already had; a date a
 * human confirms goes to that human even when an engine is configured; and an
 * operator with neither an engine nor a telephone gets a sentence. What is
 * never produced is a link to nowhere — `bookingHref` returns `undefined`
 * precisely so this decision has to be made here rather than papered over with
 * `href="#"`, which looks live, gets clicked, and loses the reader.
 */
export type DepartureRoute =
  | { kind: "book"; href: string; label: string }
  | { kind: "enquire"; href: string; label: string }
  | { kind: "tell"; text: string }
  | { kind: "closed" }

export function routeFor(
  departure: Departure,
  shown: DeparturePresentation,
  target: BookingTarget,
  /** False when the operator confirms every booking by hand. */
  instantBook: boolean,
  /* The dead end is worded once, in `copy.noRoute`, so the table and the cards
   * cannot describe the same missing engine in two different ways. */
  copy: Copy,
  phone?: string,
): DepartureRoute {
  if (shown.disabled || !isSellable(departure.state)) return { kind: "closed" }

  /*
   * The engine is offered only for dates nobody has to ring about, and only
   * when the operator takes bookings online at all. Both tests are here rather
   * than at the call site so the table and the cards cannot drift into
   * disagreeing about which dates are for sale.
   */
  const byHand = shown.callInstead || !instantBook
  const href = byHand ? undefined : bookingHref(target, { departure: departure.id })
  if (href) return { kind: "book", href, label: shown.cta }

  /*
   * An enquiry keeps the state's own words where the state has better ones —
   * "Join the waiting list" describes a waitlist more truthfully than the house
   * phrase does — and asks for a quote everywhere else.
   */
  const label = shown.callInstead ? shown.cta : copy.requestQuote
  return phone
    ? { kind: "enquire", href: telHref(phone), label }
    : { kind: "tell", text: copy.noRoute }
}

/** The dialler shape both layouts already used, kept in one place. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`
}
