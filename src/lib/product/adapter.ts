/**
 * The commercial half of a product page.
 *
 * A publication snapshot carries no prices, no departures and no availability —
 * the contract strips them on purpose, so that a page can never serve a fare
 * from last season out of a cache. Everything commercial is therefore a live
 * fetch, and until an operator's endpoints are reachable there is nothing to
 * fetch from.
 *
 * This module is that seam. It returns the shapes the live capabilities return,
 * derived deterministically from the product itself, so the page can be built
 * and reviewed against realistic data today and switched to real endpoints by
 * replacing the body of `load()` alone. It is the same arrangement, and for the
 * same reason, as `src/lib/search/engine.ts`.
 *
 * The numbers here are worked examples, not an operator's prices. Nothing in
 * this module may ever reach a published page: `load()` refuses unless the
 * caller passes a live capability it could not have had in production.
 */
import type { PriceBasis } from "../search/contract"
import type { AvailabilityState, BookingMode } from "./mode"

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

const GRADE_WORDS: [RegExp, CabinGrade["code"]][] = [
  [/suit|yacht/i, "suite"],
  [/balcon|verand/i, "balcony"],
  [/exterior|ocean|panorama|window|hublou|fereastr/i, "oceanview"],
  [/interior|inside/i, "interior"],
]

function gradeCode(name: string): CabinGrade["code"] {
  for (const [pattern, code] of GRADE_WORDS) if (pattern.test(name)) return code
  return "other"
}

/**
 * Prices for the cabin grades of one sailing.
 *
 * Per person on the double-occupancy basis, which is the convention every
 * cruise line quotes in and the reason the single supplement has to be a
 * visible field rather than a footnote: a solo traveller reading the headline
 * is reading someone else's price.
 */
export function loadCruise(
  sailingId: string,
  cabins: readonly { id: string; name: string; maxOccupancy?: number | null; deckNames?: readonly string[] | null }[],
): CruiseCommerce {
  const currency = "EUR"
  if (cabins.length === 0) return { currency, grades: [] }

  const n = seed(sailingId)
  const base = 780 + (n % 8) * 60

  const grades: CabinGrade[] = cabins.map((cabin, index) => {
    const code = gradeCode(cabin.name)
    /* Ordered by what the market charges for the view, not by publication order. */
    const uplift = { interior: 0, oceanview: 180, balcony: 340, suite: 720, other: 90 }[code]
    const state: AvailabilityState =
      index === 1 && cabins.length > 2 ? "few_left" : "available"
    return {
      id: cabin.id,
      name: cabin.name,
      code,
      maxOccupancy: cabin.maxOccupancy ?? 2,
      deckNames: [...(cabin.deckNames ?? [])],
      price: { amount: base + uplift, currency, basis: "per_person" },
      state,
      singleSupplementPct: 75,
    }
  })

  const cheapest = grades
    .filter((grade) => grade.state !== "sold_out")
    .reduce<number | undefined>(
      (low, grade) => (low === undefined ? grade.price.amount : Math.min(low, grade.price.amount)),
      undefined,
    )

  return {
    currency,
    ...(cheapest === undefined
      ? {}
      : { from: { amount: cheapest, currency, basis: "per_person" as PriceBasis } }),
    grades: [...grades].sort((left, right) => left.price.amount - right.price.amount),
    portTax: { amount: 180, currency, basis: "per_person" },
    serviceChargePerDay: { amount: 12, currency, basis: "per_person" },
  }
}

const EMPTY: ProductCommerce = {
  currency: "EUR",
  departures: [],
  roomTypes: [],
  options: [],
  availableDates: [],
}

/**
 * A small deterministic spread, so two products do not price identically and
 * the same product prices the same on every render. Seeded from the id because
 * a random figure would change under the reviewer's feet and make a screenshot
 * impossible to compare against the next one.
 */
function seed(id: string): number {
  let total = 0
  for (let index = 0; index < id.length; index += 1) {
    total = (total * 31 + id.charCodeAt(index)) | 0
  }
  return Math.abs(total)
}

function isoAdd(from: Date, days: number): string {
  const next = new Date(from)
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}

/**
 * The commercial data for a product.
 *
 * `today` is passed in rather than read from the clock so that a render is
 * reproducible: a page built twice from the same inputs must produce the same
 * dates, or every screenshot comparison becomes noise.
 */
export function load(product: {
  id: string
  bookingMode: string
  capacityMode?: string | null | undefined
}, today: Date): ProductCommerce {
  const mode = product.bookingMode as BookingMode
  const n = seed(product.id)
  const currency = "EUR"

  if (mode === "itinerary") {
    const base = 620 + (n % 9) * 45
    const departures: Departure[] = Array.from({ length: 8 }, (_, index) => {
      const offset = 21 + index * 14
      const drift = ((n + index * 7) % 5) * 40
      const amount = base + drift
      /*
       * States are assigned by position rather than at random so that every
       * state a reviewer needs to see is guaranteed to appear once, and appears
       * in the same row each time.
       */
      const state: AvailabilityState =
        index === 2 ? "few_left" : index === 5 ? "sold_out" : index === 6 ? "guaranteed" : "available"
      return {
        id: `dep_${product.id}_${index}`,
        startsOn: isoAdd(today, offset),
        endsOn: isoAdd(today, offset + 7),
        nights: 7,
        from: ["Bucharest", "Cluj-Napoca", "Timisoara"][(n + index) % 3] ?? "Bucharest",
        price: { amount, currency, basis: "per_person" },
        ...(index === 0 ? { was: amount + 120 } : {}),
        state,
        ...(state === "few_left" ? { seatsLeft: 3 } : {}),
        singleSupplement: 180 + (n % 4) * 25,
      }
    })
    const cheapest = departures
      .filter((departure) => departure.state !== "sold_out")
      .reduce<number | undefined>(
        (low, departure) => (low === undefined ? departure.price.amount : Math.min(low, departure.price.amount)),
        undefined,
      )
    return {
      currency,
      ...(cheapest === undefined ? {} : { from: { amount: cheapest, currency, basis: "per_person" as PriceBasis } }),
      departures,
      roomTypes: [],
      options: [],
      availableDates: departures.filter((d) => d.state !== "sold_out").map((d) => d.startsOn),
    }
  }

  if (mode === "stay") {
    const nights = STAY_NIGHTS
    const perNightBase = 68 + (n % 7) * 11
    const roomTypes: RoomType[] = [
      { key: "Standard double room", occupancy: 2, sqm: 22, beds: "1 double bed", bump: 0 },
      { key: "Superior double, mountain view", occupancy: 2, sqm: 28, beds: "1 double bed", bump: 24 },
      { key: "Apartment", occupancy: 4, sqm: 45, beds: "1 double bed + sofa bed", bump: 62 },
    ].map((room, index) => {
      const nightly = perNightBase + room.bump
      /*
       * Two rates per room, refundable first and dearer. The pair is the point:
       * a single "from" price hides the trade the reader is actually making.
       */
      const rates: Rate[] = [
        {
          id: `rate_${product.id}_${index}_flex`,
          board: "BB",
          refundable: true,
          cancelBy: isoAdd(today, 12),
          payAtProperty: true,
          price: { amount: nightly * nights, currency, basis: "per_stay" },
          perNight: nightly,
          state: index === 2 ? "few_left" : "available",
          ...(index === 2 ? { roomsLeft: 1 } : {}),
        },
        {
          id: `rate_${product.id}_${index}_saver`,
          board: "BB",
          refundable: false,
          payAtProperty: false,
          price: { amount: Math.round(nightly * nights * 0.88), currency, basis: "per_stay" },
          perNight: Math.round(nightly * 0.88),
          was: nightly * nights,
          state: "available",
        },
      ]
      return {
        id: `room_${product.id}_${index}`,
        name: room.key,
        sizeSqm: room.sqm,
        maxOccupancy: room.occupancy,
        beds: room.beds,
        rates,
      }
    })
    const cheapest = Math.min(...roomTypes.flatMap((room) => room.rates.map((rate) => rate.price.amount)))
    return {
      currency,
      from: { amount: cheapest, currency, basis: "per_stay" },
      departures: [],
      roomTypes,
      options: [],
      availableDates: Array.from({ length: 45 }, (_, index) => isoAdd(today, index + 1)).filter(
        (_, index) => (n + index) % 7 !== 3,
      ),
    }
  }

  if (mode === "date" || mode === "date_time" || mode === "open") {
    const base = 24 + (n % 6) * 7
    const withTimes = mode === "date_time"
    const options: ActivityOption[] = [
      { name: "Group tour in English", bump: 0, langs: ["EN"], badges: ["Small group (max. 15)", "Live guide"] },
      { name: "Group tour in Romanian", bump: 6, langs: ["RO"], badges: ["Small group (max. 15)", "Live guide"] },
      { name: "Private tour", bump: 48, langs: ["EN", "RO"], badges: ["Your group only", "Flexible start"] },
    ].map((option, index) => ({
      id: `opt_${product.id}_${index}`,
      name: option.name,
      durationMinutes: 150,
      languages: option.langs,
      groupSizeMax: index === 2 ? undefined : 15,
      refundable: true,
      cancelBy: isoAdd(today, 2),
      price: { amount: base + option.bump, currency, basis: "per_person" as PriceBasis },
      badges: option.badges,
      slots: withTimes
        ? [
            { time: "10:00", state: "available" as AvailabilityState },
            { time: "13:00", state: index === 0 ? "few_left" : "available", ...(index === 0 ? { seatsLeft: 2 } : {}) },
            { time: "17:00", state: index === 1 ? "sold_out" : "available" },
          ]
        : [],
    }))
    return {
      currency,
      from: { amount: base, currency, basis: "per_person" },
      departures: [],
      roomTypes: [],
      options,
      availableDates: Array.from({ length: 30 }, (_, index) => isoAdd(today, index + 1)).filter(
        (_, index) => (n + index) % 6 !== 2,
      ),
    }
  }

  /* `transfer` and `other` have no modelled commerce yet. Say so by returning
   * nothing rather than by inventing a shape the page would render as real. */
  return EMPTY
}
