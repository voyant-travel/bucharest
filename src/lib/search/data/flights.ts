/**
 * Bare flights, where the rail behaves differently from every other vertical.
 *
 * A stops filter with counts beside it tells the traveller nothing they can act
 * on — "38 flights with one stop" is noise. What decides the click is what the
 * compromise costs, so that facet carries a price hint instead of a total, and
 * the contract allows a `null` count precisely for this case.
 *
 * Prices are per party rather than per person: a fare is quoted for the seats
 * you asked for, and dividing it back out is how a site ends up advertising a
 * number nobody can buy.
 *
 * The rows are demo content, written in English, the theme's base language, and
 * they carry only what a fare feed carries: airports, cities, carriers, times.
 * The cabin, the baggage allowance and the word for a stop are the theme's own
 * and are looked up per locale.
 */
import type { ResultItem, SearchQuery } from "../contract"
import type { Copy } from "../copy"
import {
  CURRENCY,
  type Catalog,
  type FacetValueSpec,
  counted,
  countedRange,
  fill,
  inBand,
  labelFor,
  matchesPlace,
  money,
} from "./catalog"

export interface FlightRow {
  id: string
  origin: string
  originCity: string
  destination: string
  destinationCity: string
  airline: string
  stops: number
  departDate: string
  departTime: string
  arriveTime: string
  /** Total travel time in minutes, escales included. */
  durationMin: number
  returnDate?: string
  cabin: string
  baggage: string
  /** Total for the party the search asked for. */
  price: number
  seatsLeft?: number
}

export const AIRLINES: FacetValueSpec[] = [
  { value: "tarom", name: "Tarom" },
  { value: "wizz", name: "Wizz Air" },
  { value: "ryanair", name: "Ryanair" },
  { value: "hisky", name: "HiSky" },
  { value: "animawings", name: "AnimaWings" },
  { value: "lufthansa", name: "Lufthansa" },
  { value: "austrian", name: "Austrian Airlines" },
  { value: "klm", name: "KLM" },
  { value: "airfrance", name: "Air France" },
  { value: "lot", name: "LOT Polish Airlines" },
  { value: "turkish", name: "Turkish Airlines" },
  { value: "qatar", name: "Qatar Airways" },
  { value: "emirates", name: "Emirates" },
  { value: "swiss", name: "Swiss" },
]

export const CABINS: FacetValueSpec[] = [
  { value: "economy", label: (copy) => copy.cabins.economy },
  { value: "premium", label: (copy) => copy.cabins.premium },
  { value: "business", label: (copy) => copy.cabins.business },
]

const STOPS: FacetValueSpec[] = [
  { value: "0", label: (copy) => copy.stops.direct },
  { value: "1", label: (copy) => copy.stops.one },
  { value: "2", label: (copy) => copy.stops.twoPlus },
]

/**
 * What a fare includes in the hold, which is the single line that separates two
 * otherwise identical fares on this vertical. The row carries the operator's
 * code and the sentence is the theme's.
 */
const BAGGAGE: FacetValueSpec[] = [
  { value: "underseat", label: (copy) => copy.baggage.underseat },
  { value: "cabin", label: (copy) => copy.baggage.cabin },
  { value: "checked23", label: (copy) => copy.baggage.checked23 },
  { value: "checked30", label: (copy) => copy.baggage.checked30 },
  { value: "twochecked", label: (copy) => copy.baggage.twochecked },
]

/**
 * Bands in minutes, cut so no itinerary can land in two of them at once.
 *
 * The token stays in minutes because that is what `durationMin` measures and
 * what `inBand` compares; the label speaks hours, because nobody shops for a
 * flight under 179 minutes.
 */
const DURATIONS: FacetValueSpec[] = [
  {
    value: "0-179",
    label: (copy, locale) =>
      fill(copy.bands.under, { value: counted(locale, copy.plurals.hours, 3) }),
  },
  { value: "180-359", label: (copy, locale) => countedRange(locale, copy.plurals.hours, 3, 6) },
  { value: "360-719", label: (copy, locale) => countedRange(locale, copy.plurals.hours, 6, 12) },
  {
    value: "720-",
    label: (copy, locale) =>
      fill(copy.bands.over, { value: counted(locale, copy.plurals.hours, 12) }),
  },
]

export const FLIGHT_ROWS: FlightRow[] = [
  {
    id: "fl-otp-cdg-af",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "CDG",
    destinationCity: "Paris",
    airline: "airfrance",
    stops: 0,
    departDate: "2026-09-14",
    departTime: "07:10",
    arriveTime: "09:35",
    durationMin: 205,
    returnDate: "2026-09-21",
    cabin: "economy",
    baggage: "cabin",
    price: 268,
  },
  {
    id: "fl-otp-cdg-w6",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "BVA",
    destinationCity: "Paris",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-14",
    departTime: "13:45",
    arriveTime: "16:05",
    durationMin: 200,
    returnDate: "2026-09-21",
    cabin: "economy",
    baggage: "underseat",
    price: 189,
    seatsLeft: 4,
  },
  {
    id: "fl-otp-lhr-ba",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "LHR",
    destinationCity: "London",
    airline: "tarom",
    stops: 0,
    departDate: "2026-09-14",
    departTime: "06:20",
    arriveTime: "07:55",
    durationMin: 215,
    returnDate: "2026-09-20",
    cabin: "economy",
    baggage: "checked23",
    price: 312,
  },
  {
    id: "fl-otp-stn-fr",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "STN",
    destinationCity: "London",
    airline: "ryanair",
    stops: 0,
    departDate: "2026-09-15",
    departTime: "20:30",
    arriveTime: "22:15",
    durationMin: 225,
    returnDate: "2026-09-22",
    cabin: "economy",
    baggage: "underseat",
    price: 148,
    seatsLeft: 2,
  },
  {
    id: "fl-otp-bcn-w6",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "BCN",
    destinationCity: "Barcelona",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-17",
    departTime: "09:05",
    arriveTime: "11:40",
    durationMin: 215,
    returnDate: "2026-09-24",
    cabin: "economy",
    baggage: "cabin",
    price: 176,
  },
  {
    id: "fl-otp-mad-lh",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "MAD",
    destinationCity: "Madrid",
    airline: "lufthansa",
    stops: 1,
    departDate: "2026-09-17",
    departTime: "06:00",
    arriveTime: "12:25",
    durationMin: 445,
    returnDate: "2026-09-24",
    cabin: "economy",
    baggage: "checked23",
    price: 341,
  },
  {
    id: "fl-otp-fco-tarom",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "FCO",
    destinationCity: "Rome",
    airline: "tarom",
    stops: 0,
    departDate: "2026-09-12",
    departTime: "08:15",
    arriveTime: "09:20",
    durationMin: 125,
    returnDate: "2026-09-16",
    cabin: "economy",
    baggage: "checked23",
    price: 214,
  },
  {
    id: "fl-otp-fco-w6",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "FCO",
    destinationCity: "Rome",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-12",
    departTime: "16:40",
    arriveTime: "17:45",
    durationMin: 125,
    returnDate: "2026-09-16",
    cabin: "economy",
    baggage: "underseat",
    price: 118,
    seatsLeft: 6,
  },
  {
    id: "fl-otp-vie-os",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "VIE",
    destinationCity: "Vienna",
    airline: "austrian",
    stops: 0,
    departDate: "2026-09-10",
    departTime: "07:05",
    arriveTime: "07:45",
    durationMin: 100,
    returnDate: "2026-09-13",
    cabin: "economy",
    baggage: "cabin",
    price: 196,
  },
  {
    id: "fl-otp-vie-business",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "VIE",
    destinationCity: "Vienna",
    airline: "austrian",
    stops: 0,
    departDate: "2026-09-10",
    departTime: "17:20",
    arriveTime: "18:00",
    durationMin: 100,
    returnDate: "2026-09-13",
    cabin: "business",
    baggage: "twochecked",
    price: 642,
  },
  {
    id: "fl-otp-ams-klm",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "AMS",
    destinationCity: "Amsterdam",
    airline: "klm",
    stops: 0,
    departDate: "2026-09-18",
    departTime: "12:10",
    arriveTime: "14:20",
    durationMin: 190,
    returnDate: "2026-09-22",
    cabin: "economy",
    baggage: "checked23",
    price: 289,
  },
  {
    id: "fl-otp-ist-tk",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "IST",
    destinationCity: "Istanbul",
    airline: "turkish",
    stops: 0,
    departDate: "2026-10-02",
    departTime: "05:55",
    arriveTime: "07:40",
    durationMin: 105,
    returnDate: "2026-10-06",
    cabin: "economy",
    baggage: "checked23",
    price: 178,
  },
  {
    id: "fl-otp-dxb-ek",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "DXB",
    destinationCity: "Dubai",
    airline: "emirates",
    stops: 1,
    departDate: "2026-11-21",
    departTime: "14:35",
    arriveTime: "01:10",
    durationMin: 515,
    returnDate: "2026-11-26",
    cabin: "economy",
    baggage: "checked30",
    price: 486,
  },
  {
    id: "fl-otp-dxb-fz",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "DXB",
    destinationCity: "Dubai",
    airline: "turkish",
    stops: 1,
    departDate: "2026-11-21",
    departTime: "06:10",
    arriveTime: "18:05",
    durationMin: 595,
    returnDate: "2026-11-26",
    cabin: "economy",
    baggage: "checked23",
    price: 412,
    seatsLeft: 3,
  },
  {
    id: "fl-otp-doh-qr",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "DOH",
    destinationCity: "Doha",
    airline: "qatar",
    stops: 0,
    departDate: "2026-12-04",
    departTime: "16:25",
    arriveTime: "23:15",
    durationMin: 350,
    returnDate: "2026-12-11",
    cabin: "economy",
    baggage: "checked30",
    price: 528,
  },
  {
    id: "fl-otp-bkk-qr",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "BKK",
    destinationCity: "Bangkok",
    airline: "qatar",
    stops: 1,
    departDate: "2027-01-09",
    departTime: "16:25",
    arriveTime: "13:40",
    durationMin: 940,
    returnDate: "2027-01-23",
    cabin: "economy",
    baggage: "checked30",
    price: 742,
  },
  {
    id: "fl-otp-jfk-lh",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "JFK",
    destinationCity: "New York",
    airline: "lufthansa",
    stops: 1,
    departDate: "2026-10-15",
    departTime: "06:00",
    arriveTime: "15:45",
    durationMin: 825,
    returnDate: "2026-10-25",
    cabin: "economy",
    baggage: "checked23",
    price: 689,
  },
  {
    id: "fl-otp-jfk-hisky",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "JFK",
    destinationCity: "New York",
    airline: "hisky",
    stops: 1,
    departDate: "2026-10-15",
    departTime: "10:20",
    arriveTime: "20:55",
    durationMin: 875,
    returnDate: "2026-10-25",
    cabin: "premium",
    baggage: "checked23",
    price: 918,
  },
  {
    id: "fl-otp-nrt-tk",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "NRT",
    destinationCity: "Tokyo",
    airline: "turkish",
    stops: 1,
    departDate: "2027-04-01",
    departTime: "05:55",
    arriveTime: "16:35",
    durationMin: 1130,
    returnDate: "2027-04-14",
    cabin: "economy",
    baggage: "checked23",
    price: 964,
  },
  {
    id: "fl-otp-gru-af",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "GRU",
    destinationCity: "Sao Paulo",
    airline: "airfrance",
    stops: 2,
    departDate: "2027-02-06",
    departTime: "07:10",
    arriveTime: "06:20",
    durationMin: 1390,
    returnDate: "2027-02-20",
    cabin: "economy",
    baggage: "checked23",
    price: 1148,
  },
  {
    id: "fl-otp-ath-a3",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "ATH",
    destinationCity: "Athens",
    airline: "tarom",
    stops: 0,
    departDate: "2026-09-26",
    departTime: "10:45",
    arriveTime: "12:20",
    durationMin: 95,
    cabin: "economy",
    baggage: "cabin",
    price: 132,
  },
  {
    id: "fl-otp-mxp-w6-oneway",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "MXP",
    destinationCity: "Milan",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-19",
    departTime: "21:15",
    arriveTime: "22:30",
    durationMin: 135,
    cabin: "economy",
    baggage: "underseat",
    price: 74,
    seatsLeft: 9,
  },
  {
    id: "fl-otp-otp-lis-tp",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "LIS",
    destinationCity: "Lisbon",
    airline: "lufthansa",
    stops: 1,
    departDate: "2026-10-08",
    departTime: "06:00",
    arriveTime: "13:10",
    durationMin: 490,
    returnDate: "2026-10-14",
    cabin: "economy",
    baggage: "checked23",
    price: 358,
  },
  {
    id: "fl-cluj-bcn-w6",
    origin: "CLJ",
    originCity: "Cluj-Napoca",
    destination: "BCN",
    destinationCity: "Barcelona",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-17",
    departTime: "14:20",
    arriveTime: "16:45",
    durationMin: 205,
    returnDate: "2026-09-24",
    cabin: "economy",
    baggage: "cabin",
    price: 164,
  },
  {
    id: "fl-cluj-muc-lh",
    origin: "CLJ",
    originCity: "Cluj-Napoca",
    destination: "MUC",
    destinationCity: "Munich",
    airline: "lufthansa",
    stops: 0,
    departDate: "2026-09-11",
    departTime: "13:05",
    arriveTime: "14:20",
    durationMin: 135,
    returnDate: "2026-09-15",
    cabin: "economy",
    baggage: "cabin",
    price: 228,
  },
  {
    id: "fl-cluj-lhr-lot",
    origin: "CLJ",
    originCity: "Cluj-Napoca",
    destination: "LHR",
    destinationCity: "London",
    airline: "lot",
    stops: 1,
    departDate: "2026-09-14",
    departTime: "06:35",
    arriveTime: "11:50",
    durationMin: 375,
    returnDate: "2026-09-20",
    cabin: "economy",
    baggage: "checked23",
    price: 246,
  },
  {
    id: "fl-timisoara-vie-os",
    origin: "TSR",
    originCity: "Timisoara",
    destination: "VIE",
    destinationCity: "Vienna",
    airline: "austrian",
    stops: 0,
    departDate: "2026-09-10",
    departTime: "15:40",
    arriveTime: "16:20",
    durationMin: 100,
    returnDate: "2026-09-13",
    cabin: "economy",
    baggage: "cabin",
    price: 184,
  },
  {
    id: "fl-timisoara-fco-w6",
    origin: "TSR",
    originCity: "Timisoara",
    destination: "FCO",
    destinationCity: "Rome",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-12",
    departTime: "11:30",
    arriveTime: "12:25",
    durationMin: 115,
    returnDate: "2026-09-16",
    cabin: "economy",
    baggage: "underseat",
    price: 106,
  },
  {
    id: "fl-iasi-ist-tk",
    origin: "IAS",
    originCity: "Iasi",
    destination: "IST",
    destinationCity: "Istanbul",
    airline: "turkish",
    stops: 0,
    departDate: "2026-10-02",
    departTime: "12:40",
    arriveTime: "14:15",
    durationMin: 115,
    returnDate: "2026-10-06",
    cabin: "economy",
    baggage: "checked23",
    price: 198,
  },
  {
    id: "fl-iasi-cdg-anima",
    origin: "IAS",
    originCity: "Iasi",
    destination: "CDG",
    destinationCity: "Paris",
    airline: "animawings",
    stops: 1,
    departDate: "2026-09-14",
    departTime: "08:50",
    arriveTime: "14:35",
    durationMin: 405,
    returnDate: "2026-09-21",
    cabin: "economy",
    baggage: "cabin",
    price: 254,
  },
  {
    id: "fl-otp-zrh-lx",
    origin: "OTP",
    originCity: "Bucharest",
    destination: "ZRH",
    destinationCity: "Zurich",
    airline: "swiss",
    stops: 0,
    departDate: "2026-09-24",
    departTime: "10:05",
    arriveTime: "11:40",
    durationMin: 155,
    returnDate: "2026-09-28",
    cabin: "business",
    baggage: "twochecked",
    price: 724,
  },
]

/** Both airports of every itinerary, by code and by city. */
const PLACES = FLIGHT_ROWS.flatMap((row) => [
  row.origin,
  row.originCity,
  row.destination,
  row.destinationCity,
])

function hoursAndMinutes(total: number): string {
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

function stopsLabel(stops: number, copy: Copy, locale: string): string {
  return stops === 0 ? copy.stops.direct : counted(locale, copy.plurals.stops, stops)
}

function result(row: FlightRow, copy: Copy, locale: string): ResultItem {
  const roundTrip = row.returnDate !== undefined
  const baggage = labelFor(BAGGAGE, row.baggage, copy, locale)
  return {
    id: row.id,
    title: `${row.originCity} → ${row.destinationCity}`,
    href: `/zboruri/${row.id}`,
    ...(row.seatsLeft !== undefined && row.seatsLeft <= 4
      ? { badge: counted(locale, copy.plurals.seatsLeft, row.seatsLeft) }
      : {}),
    eyebrow: `${labelFor(AIRLINES, row.airline, copy, locale)} · ${labelFor(CABINS, row.cabin, copy, locale)}`,
    place: `${row.origin} ${row.departTime} → ${row.destination} ${row.arriveTime}`,
    inclusions: [baggage, roundTrip ? copy.inclusions.roundTrip : copy.inclusions.oneWay],
    chips: [hoursAndMinutes(row.durationMin), stopsLabel(row.stops, copy, locale), baggage],
    price: {
      amount: row.price,
      currency: CURRENCY,
      basis: "per_party",
      footnote: roundTrip ? copy.footnotes.flightRoundTrip : copy.footnotes.flightOneWay,
    },
  }
}

function base(row: FlightRow, query: SearchQuery): boolean {
  const filters = query.filters
  const origin = filters.origin
  if (typeof origin === "string" && origin !== "") {
    if (!matchesPlace(origin, [row.origin, row.originCity], PLACES)) return false
  }
  const destination = filters.destination
  if (typeof destination === "string" && destination !== "") {
    if (!matchesPlace(destination, [row.destination, row.destinationCity], PLACES)) return false
  }
  const tripType = filters.tripType
  if (tripType === "oneway" && row.returnDate !== undefined) return false
  if (tripType === "round" && row.returnDate === undefined) return false
  const depart = filters.depart
  if (typeof depart === "string" && depart !== "" && row.departDate !== depart) return false
  const back = filters.return
  if (typeof back === "string" && back !== "" && row.returnDate !== back) return false
  const cabin = filters.cabin
  if (typeof cabin === "string" && cabin !== "" && cabin !== "any" && row.cabin !== cabin) {
    return false
  }
  /** The toggle is the same constraint as selecting "Direct" in the rail. */
  if (filters.direct === true && row.stops !== 0) return false
  return true
}

export const flightsCatalog: Catalog<FlightRow> = {
  vertical: "flights",
  items: FLIGHT_ROWS,
  base,
  facets: [
    {
      key: "stops",
      name: (copy) => copy.facets.stops,
      type: "array",
      values: STOPS,
      match: (row, value) => (value === "2" ? row.stops >= 2 : row.stops === Number(value)),
      hint: (matching, copy) =>
        matching.length === 0
          ? copy.unavailable
          : fill(copy.from, { price: money(Math.min(...matching.map((row) => row.price))) }),
      expanded: true,
    },
    {
      key: "airlines",
      name: (copy) => copy.facets.airlines,
      type: "array",
      values: AIRLINES,
      match: (row, value) => row.airline === value,
      expanded: true,
      truncateAt: 6,
    },
    {
      key: "price",
      name: (copy) => copy.facets.price,
      type: "range",
      measure: (row) => row.price,
      expanded: true,
    },
    {
      key: "duration",
      name: (copy) => copy.facets.duration,
      type: "array",
      values: DURATIONS,
      match: (row, value) => inBand(row.durationMin, value),
    },
  ],
  compare: {
    /**
     * "Best overall" is the industry's only honest compromise sort: price and
     * time weighted together, because the cheapest fare on this route leaves at
     * 05:55 and the fastest costs three hundred euro more.
     */
    best: (a, b) => a.price + a.durationMin - (b.price + b.durationMin),
    price_asc: (a, b) => a.price - b.price,
    duration_asc: (a, b) => a.durationMin - b.durationMin,
    departure_asc: (a, b) =>
      `${a.departDate}T${a.departTime}`.localeCompare(`${b.departDate}T${b.departTime}`),
  },
  price: (row) => row.price,
  result,
}
