/**
 * What kind of thing a product is, and therefore how its page behaves.
 *
 * The contract already answers this. `bookingMode` is a required, closed enum
 * on every catalogue product, and it is the operator's own statement of how the
 * thing is sold — by a fixed departure, by a night, by a start time, or not by
 * a date at all. A theme that instead branches on the route it was reached
 * through, or on a category name, is guessing at something it was told.
 *
 * `productType.code` is deliberately *not* used for control flow. It is
 * optional, nullable, and typed as a free string, so an operator may write
 * "Sejur", "sejur" or "package" for the same thing. It is a label to show, and
 * nothing may depend on its value.
 */
/*
 * Relative, not aliased. `~/lib/search/*` resolves for tsc and for the client
 * bundle but not under the workerd SSR environment, which fails the render
 * rather than the build — so this module, which runs server-side, avoids the
 * alias entirely.
 */
import type { PriceBasis } from "../search/contract"

/** The contract's own enum, mirrored so callers need not import the schema. */
export type BookingMode =
  | "date"
  | "date_time"
  | "open"
  | "stay"
  | "transfer"
  | "itinerary"
  | "other"

/** The contract's supply model, which decides whether "book" is even offered. */
export type CapacityMode = "free_sale" | "limited" | "on_request"

/**
 * The one module a page is really built around.
 *
 * Every product page has an overview and a gallery; what distinguishes a hotel
 * from a circuit is the control that turns browsing into a choice. Naming it
 * lets the shell decide placement — on a phone this module moves above the
 * editorial, because nothing else on the page is permanently visible.
 */
export type DefiningModule =
  | "departures" /* a list of dated departures to choose between */
  | "rates" /* room types and their rate plans */
  | "slots" /* a date, then an option, then a start time */
  | "validity" /* an open ticket: participants and a validity window */
  | "route" /* a transfer: two points and a vehicle */
  | "none" /* nothing bookable is modelled; the page is editorial */

/**
 * How a price surface is doing.
 *
 * Commercial values are stripped from publication snapshots, so every price on
 * a product page is a live fetch that can be in flight, refused, or broken.
 * Rendering these as one state is what produces a page showing "0 €" or a fare
 * from last season. `unavailable` and `failed` are distinct on purpose: the
 * first is an answer, the second is the absence of one, and a reader deserves
 * to be told which.
 */
export type LiveState =
  | "idle"
  | "checking"
  | "priced"
  | "unavailable"
  | "failed"

/**
 * Whether a departure, rate or slot can be taken, and why not when it cannot.
 *
 * Absent from the contract, which models supply but not its presentation. The
 * values are the ones a travel page has to distinguish to stay honest: a grade
 * that is sold out for one date is not the same as a grade that ship never
 * offered, and a waitlist is not a refusal.
 */
export type AvailabilityState =
  | "available"
  | "guaranteed"
  | "few_left"
  | "on_request"
  | "waitlist"
  | "sold_out"
  | "not_offered"
  | "expired"

export interface Personality {
  mode: BookingMode
  /** The control the page is built around. */
  defining: DefiningModule
  /**
   * Whether the page may show a book-now CTA. An `on_request` product must not,
   * however complete its data looks — offering to book something the operator
   * has to confirm by hand is a promise the page cannot keep.
   */
  instantBook: boolean
  /**
   * What the headline price counts. Getting this wrong is the highest-risk
   * error on a travel page: a hotel priced per night beside a package priced
   * per stay beside a circuit priced per person look comparable and are not.
   */
  basis: PriceBasis
  /** Whether a date is required before any price can be quoted at all. */
  needsDate: boolean
}

const PERSONALITIES: Record<BookingMode, Omit<Personality, "mode" | "instantBook">> = {
  /* A circuit or escorted tour: fixed departures, quoted per person. */
  itinerary: { defining: "departures", basis: "per_person", needsDate: true },
  /* A hotel: room types priced by the stay, not by the night. The per-night
   * figure is a subtitle — see `PriceBasis` on why the two must never swap. */
  stay: { defining: "rates", basis: "per_stay", needsDate: true },
  /* A day trip on a fixed date, with no start time to pick. */
  date: { defining: "slots", basis: "per_person", needsDate: true },
  /* An experience with start times — the slot is part of the choice. */
  date_time: { defining: "slots", basis: "per_person", needsDate: true },
  /* An open-dated ticket: valid for a window, so no date is needed to price. */
  open: { defining: "validity", basis: "per_person", needsDate: false },
  /* A transfer is priced for the vehicle, not for the people in it. */
  transfer: { defining: "route", basis: "per_party", needsDate: true },
  /* Something the contract has no shape for. Show the editorial, sell nothing. */
  other: { defining: "none", basis: "per_person", needsDate: true },
}

/**
 * The personality of a product, from what the contract guarantees is present.
 *
 * Falls back to `other` rather than to a guess: an unrecognised mode means the
 * contract has grown a value this theme predates, and rendering such a product
 * as though it were a tour would invent a departures table for something that
 * may have no departures.
 */
export function personalityOf(product: {
  bookingMode: string
  capacityMode?: string | null | undefined
}): Personality {
  const mode: BookingMode = isBookingMode(product.bookingMode)
    ? product.bookingMode
    : "other"
  const shape = PERSONALITIES[mode]
  return {
    mode,
    ...shape,
    /*
     * `on_request` is the operator saying a human confirms this. `other` has no
     * modelled way to choose anything, so there is nothing to book either.
     */
    instantBook: product.capacityMode !== "on_request" && mode !== "other",
  }
}

function isBookingMode(value: string): value is BookingMode {
  return value in PERSONALITIES
}

/**
 * The label an operator gave this product type, when they gave one.
 *
 * Free text by contract, so it is shown and never compared. Trimmed because a
 * label that is only whitespace is not a label.
 */
export function typeLabelOf(product: {
  productType?: { name?: string | null | undefined } | null | undefined
}): string | undefined {
  const name = product.productType?.name?.trim()
  return name ? name : undefined
}
