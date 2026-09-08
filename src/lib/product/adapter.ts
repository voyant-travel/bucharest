/**
 * The commercial half of a product page.
 *
 * A publication snapshot carries no prices, no departures and no availability —
 * the contract strips them on purpose, so that a page can never serve a fare
 * from last season out of a cache. Everything commercial is therefore a live
 * fetch, and until an operator's endpoints are reachable there is nothing to
 * fetch from.
 *
 * This module owns the presentation shapes only. Until a live capability has
 * returned commercial data, its factories deliberately return empty values.
 * A missing endpoint must never turn into a plausible-looking fare, departure,
 * or scarcity claim on a published page.
 */
import type { PriceBasis } from "../search/contract"
import type { AvailabilityState } from "./mode"

export interface Money {
  amount: number
  currency: string
  basis: PriceBasis
}

/** One dated departure of a fixed-departure product. */
export interface Departure {
  id: string
  startsOn: string
  endsOn: string
  nights: number
  from: string
  price: Money
  /** The struck-through prior price, when there genuinely was one. */
  was?: number
  state: AvailabilityState
  /** Only ever a real count. An invented seat count is a dark pattern. */
  seatsLeft?: number
  singleSupplement?: number
}

/** One room type and the rate plans sold against it. */
export interface RoomType {
  id: string
  name: string
  sizeSqm?: number
  maxOccupancy: number
  beds: string
  rates: Rate[]
}

export interface Rate {
  id: string
  /** `RO | BB | HB | FB | AI | UAI` — shown as words, never as the code. */
  board: string
  refundable: boolean
  /** Present when refundable: the moment the free window closes. */
  cancelBy?: string
  payAtProperty: boolean
  price: Money
  perNight: number
  was?: number
  state: AvailabilityState
  roomsLeft?: number
}

/** One purchasable variant of an experience, and its start times. */
export interface ActivityOption {
  id: string
  name: string
  durationMinutes: number
  languages: string[]
  groupSizeMax?: number
  refundable: boolean
  cancelBy?: string
  price: Money
  badges: string[]
  slots: Slot[]
}

export interface Slot {
  time: string
  state: AvailabilityState
  seatsLeft?: number
}

export interface ProductCommerce {
  currency: string
  /** The lowest price the page may advertise, and what it counts. */
  from?: Money
  departures: Departure[]
  roomTypes: RoomType[]
  options: ActivityOption[]
  /** Dates the product can be taken at all, ISO, ascending. */
  availableDates: string[]
}

/**
 * The stay length the rates below are quoted for.
 *
 * Exported because the page has to say it out loud — a total for the whole stay
 * is meaningless without the number of nights beside it — and a second literal
 * in the template would be free to drift away from the one the prices were
 * actually computed from.
 */
export const STAY_NIGHTS = 3

/**
 * One cabin grade on a sailing, priced.
 *
 * The contract's `cruiseCabinCategory` carries a name, an occupancy and some
 * deck names — but no grade code and no floor area, which means there is
 * nothing in the publication to sort grades by. Cheapest-first is the ordering
 * every cruise page uses, so the price is what orders them here, and `code` is
 * inferred from the name only to pick an icon and a label. Nothing depends on
 * that inference being right.
 */
export interface CabinGrade {
  id: string
  name: string
  code: "interior" | "oceanview" | "balcony" | "suite" | "other"
  maxOccupancy: number
  deckNames: string[]
  price: Money
  state: AvailabilityState
  /** A solo traveller pays this much more. Shown, never buried. */
  singleSupplementPct?: number
}

export interface CruiseCommerce {
  currency: string
  from?: Money
  grades: CabinGrade[]
  /*
   * Unavoidable charges the headline fare excludes. They are separate values
   * rather than folded in because they are charged per person per day and per
   * person per sailing respectively, and a page that silently adds them to a
   * "from" price is quoting a number no one is charged.
   */
  portTax?: Money
  serviceChargePerDay?: Money
}

/**
 * Commercial data before a live capability has answered.
 *
 * Return a fresh value so an island cannot accidentally leak one request's
 * client-side state into another render. Currency is presentation fallback
 * only; without a price it is never shown as a commercial claim.
 */
export function unavailableProductCommerce(currency = "EUR"): ProductCommerce {
  return {
    currency,
    departures: [],
    roomTypes: [],
    options: [],
    availableDates: [],
  }
}

/** Commercial state for a sailing until live cabin pricing has answered. */
export function unavailableCruiseCommerce(currency = "EUR"): CruiseCommerce {
  return { currency, grades: [] }
}
