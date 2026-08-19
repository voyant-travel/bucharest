import type { CabinGrade } from "~/lib/product/adapter"
import { bookingHref, type BookingTarget } from "~/lib/product/booking"
import type { AvailabilityState } from "~/lib/product/mode"

import type { Copy } from "./copy"
import { occupancyPhrase } from "./format"

/**
 * What each availability state looks like, and what it lets the reader do.
 *
 * One table rather than eight branches scattered through the card, its badge
 * and its call to action, because those three have to agree: a grade that is
 * struck through as sold out and still carries a live "Book" link is the
 * failure this module exists to avoid, and it is invisible until someone clicks.
 *
 * Deliberately a sibling of `departures/availability.ts` rather than an import
 * from it. The two surfaces sell different things — a departure has a seat
 * count, a cabin grade has none — and a shared table would have to grow a
 * union of fields that half its callers must remember to ignore.
 */
export type Tone = "neutral" | "positive" | "warn" | "muted"

export interface GradePresentation {
  /** The one phrase that explains this card's state, when it needs one. */
  badge?: string
  tone: Tone
  /** A sentence under the price where a pill would be too small to say it. */
  reason?: string
  cta: string
  disabled: boolean
  /** Whether the price is struck through — a fare nobody can buy any more. */
  strike: boolean
  /**
   * Whether the whole card fades back. Reserved for `not_offered`: the grade is
   * not sold out for this sailing, the ship does not offer it at all, and it
   * stays on the page only so a reader who came looking for it stops looking.
   */
  dim: boolean
  /**
   * Whether a human, not the site, holds the answer for this grade.
   *
   * Also the flag that keeps such a grade away from the booking engine: the
   * operator has said somebody confirms it, and a checkout that takes money for
   * a berth nobody has held yet is the one failure that costs the traveller
   * rather than the page.
   */
  callInstead: boolean
}

/** The badge shape, shared so no two cards can word the same state differently. */
export const BADGE =
  "inline-flex items-center rounded-pill border px-2.5 py-1 text-[0.6875rem] leading-none"

/**
 * Likewise the call to action, which is a link on one card and a disabled
 * button on the next. Full width because it is the last row of a card in a row
 * of cards, and CTAs of different widths across that row read as different
 * kinds of control.
 */
export const CTA =
  "inline-flex h-10 w-full items-center justify-center rounded-pill px-5 text-center text-[0.8125rem] font-medium transition-colors duration-300"

export const TONE_BADGE: Record<Tone, string> = {
  neutral: "border-line text-ink-muted",
  positive: "border-accent/35 bg-accent-wash text-accent",
  /* `brass` is this palette's amber. A literal amber would survive one theme
   * switch and then sit outside every other color on the page. */
  warn: "border-brass/40 bg-brass/10 text-brass",
  muted: "border-line bg-surface-sunk text-ink-subtle",
}

function fromState(copy: Copy, state: AvailabilityState): GradePresentation {
  switch (state) {
    case "guaranteed":
      return {
        badge: copy.guaranteed,
        tone: "positive",
        cta: copy.book,
        disabled: false,
        strike: false,
        dim: false,
        callInstead: false,
      }

    case "few_left":
      /*
       * No count, ever. `CabinGrade` has no seat field at all — the contract
       * models cabin categories, not berths — so any number here would be one
       * this component made up, which is the dark pattern the theme refuses.
       * The phrase carries the urgency the state actually justifies and stops.
       */
      return {
        badge: copy.fewLeft,
        tone: "warn",
        cta: copy.book,
        disabled: false,
        strike: false,
        dim: false,
        callInstead: false,
      }

    case "on_request":
      return {
        badge: copy.onRequest,
        tone: "neutral",
        cta: copy.checkAvailability,
        disabled: false,
        strike: false,
        dim: false,
        callInstead: true,
      }

    case "waitlist":
      /* A waitlist is a promise to call back, not a sale — so it routes to a
       * person for the same reason `on_request` does. */
      return {
        badge: copy.waitlist,
        tone: "warn",
        cta: copy.joinWaitlist,
        disabled: false,
        strike: false,
        dim: false,
        callInstead: true,
      }

    case "sold_out":
      return {
        badge: copy.soldOut,
        tone: "muted",
        cta: copy.chooseAnother,
        disabled: true,
        strike: true,
        dim: false,
        callInstead: false,
      }

    case "not_offered":
      /*
       * Struck through would be a lie: nothing was withdrawn, this grade was
       * never on this sailing. The price is left standing and the whole card
       * fades instead, which is the difference between "gone" and "not a thing
       * here" — and the reader is told which in words rather than in opacity.
       */
      return {
        badge: copy.notOffered,
        tone: "muted",
        reason: copy.notOfferedReason,
        cta: copy.unavailable,
        disabled: true,
        strike: false,
        dim: true,
        callInstead: false,
      }

    case "expired":
      return {
        badge: copy.expired,
        tone: "muted",
        reason: copy.expiredReason,
        cta: copy.chooseAnother,
        disabled: true,
        strike: true,
        dim: false,
        callInstead: false,
      }

    default:
      return {
        tone: "neutral",
        cta: copy.book,
        disabled: false,
        strike: false,
        dim: false,
        callInstead: false,
      }
  }
}

/**
 * How one grade presents to a party of this size.
 *
 * Capacity is applied after the state and loses to it. A grade that is sold out
 * is sold out for a party of any size, and answering a family of four with
 * "Max. 2 people" would send them off to find a bigger cabin as though this one
 * were otherwise theirs.
 *
 * A grade too small for the party stays on the page, greyed, with the reason
 * printed. Hiding it would make the row silently shorter every time the stepper
 * moved, and a reader who cannot see what disappeared cannot tell whether the
 * page is filtering or broken.
 */
export function presentGrade(
  copy: Copy,
  grade: CabinGrade,
  adults: number,
): GradePresentation {
  const shown = fromState(copy, grade.state)
  if (shown.disabled || adults <= grade.maxOccupancy) return shown

  return {
    ...shown,
    tone: "muted",
    /* The same phrase the card already prints above the price, deliberately:
     * two different wordings for one capacity read as two different limits. */
    reason: occupancyPhrase(copy, grade.maxOccupancy),
    cta: copy.unavailable,
    disabled: true,
    strike: false,
    dim: false,
    callInstead: false,
  }
}

/** Whether choosing this grade leads anywhere. */
export function isSellable(state: AvailabilityState): boolean {
  return state !== "sold_out" && state !== "not_offered" && state !== "expired"
}

/**
 * Where one card's call to action actually goes.
 *
 * Four outcomes rather than a boolean, because the reasons a card may not reach
 * the booking engine are different reasons and must not look like the same one.
 * A sold-out grade keeps the disabled control it already had; a grade a human
 * confirms goes to that human even when an engine is configured; and an
 * operator with neither an engine nor a telephone gets a sentence. What is
 * never produced is a link to nowhere — `bookingHref` returns `undefined`
 * precisely so this decision has to be made here rather than papered over with
 * `href="#"`, which looks live, gets clicked, and loses the reader.
 */
export type GradeRoute =
  | { kind: "book"; href: string; label: string }
  | { kind: "enquire"; href: string; label: string }
  | { kind: "tell"; text: string }
  | { kind: "closed" }

export function routeFor(
  copy: Copy,
  grade: CabinGrade,
  adults: number,
  shown: GradePresentation,
  target: BookingTarget,
  phone?: string,
): GradeRoute {
  if (shown.disabled || !isSellable(grade.state)) return { kind: "closed" }

  /*
   * The party size travels with the grade. An engine handed a cabin id and no
   * headcount quotes the double-occupancy fare again, which is exactly the
   * number this card spent its whole height explaining is not the total.
   */
  const href = shown.callInstead ? undefined : bookingHref(target, { cabin: grade.id, adults })
  if (href) return { kind: "book", href, label: shown.cta }

  /*
   * An enquiry keeps the state's own words where the state has better ones —
   * "Join the waitlist" describes a waitlist more truthfully than the house
   * phrase does — and asks for a quote everywhere else. `noRoute` is said once
   * in the dictionary, so no two cards can word the dead end differently.
   */
  const label = shown.callInstead ? shown.cta : copy.requestQuote
  return phone
    ? { kind: "enquire", href: telHref(phone), label }
    : { kind: "tell", text: copy.noRoute }
}

/** The dialler shape, kept in one place so a stray space cannot break it. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`
}
