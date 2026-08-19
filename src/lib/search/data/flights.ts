/**
 * Bare flights, where the rail behaves differently from every other vertical.
 *
 * A stops filter with counts beside it tells the traveller nothing they can act
 * on — "38 de zboruri cu o escală" is noise. What decides the click is what the
 * compromise costs, so that facet carries a price hint instead of a total, and
 * the contract allows a `null` count precisely for this case.
 *
 * Prices are per party rather than per person: a fare is quoted for the seats
 * you asked for, and dividing it back out is how a site ends up advertising a
 * number nobody can buy.
 */
import type { ResultItem, SearchQuery } from "../contract"
import {
  CURRENCY,
  type Catalog,
  type FacetValueSpec,
  inBand,
  matchesPlace,
  money,
  nameOf,
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
  { value: "economy", name: "Economy" },
  { value: "premium", name: "Premium Economy" },
  { value: "business", name: "Business" },
]

const STOPS: FacetValueSpec[] = [
  { value: "0", name: "Direct" },
  { value: "1", name: "O escală" },
  { value: "2", name: "Două sau mai multe escale" },
]

/** Bands in minutes, cut so no itinerary can land in two of them at once. */
const DURATIONS: FacetValueSpec[] = [
  { value: "0-179", name: "Sub 3 ore" },
  { value: "180-359", name: "3-6 ore" },
  { value: "360-719", name: "6-12 ore" },
  { value: "720-", name: "Peste 12 ore" },
]

export const FLIGHT_ROWS: FlightRow[] = [
  {
    id: "fl-otp-cdg-af",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de mână inclus",
    price: 268,
  },
  {
    id: "fl-otp-cdg-w6",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Doar bagaj mic de cabină",
    price: 189,
    seatsLeft: 4,
  },
  {
    id: "fl-otp-lhr-ba",
    origin: "OTP",
    originCity: "București",
    destination: "LHR",
    destinationCity: "Londra",
    airline: "tarom",
    stops: 0,
    departDate: "2026-09-14",
    departTime: "06:20",
    arriveTime: "07:55",
    durationMin: 215,
    returnDate: "2026-09-20",
    cabin: "economy",
    baggage: "Bagaj de cală 23 kg inclus",
    price: 312,
  },
  {
    id: "fl-otp-stn-fr",
    origin: "OTP",
    originCity: "București",
    destination: "STN",
    destinationCity: "Londra",
    airline: "ryanair",
    stops: 0,
    departDate: "2026-09-15",
    departTime: "20:30",
    arriveTime: "22:15",
    durationMin: 225,
    returnDate: "2026-09-22",
    cabin: "economy",
    baggage: "Doar bagaj mic de cabină",
    price: 148,
    seatsLeft: 2,
  },
  {
    id: "fl-otp-bcn-w6",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de mână inclus",
    price: 176,
  },
  {
    id: "fl-otp-mad-lh",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 23 kg inclus",
    price: 341,
  },
  {
    id: "fl-otp-fco-tarom",
    origin: "OTP",
    originCity: "București",
    destination: "FCO",
    destinationCity: "Roma",
    airline: "tarom",
    stops: 0,
    departDate: "2026-09-12",
    departTime: "08:15",
    arriveTime: "09:20",
    durationMin: 125,
    returnDate: "2026-09-16",
    cabin: "economy",
    baggage: "Bagaj de cală 23 kg inclus",
    price: 214,
  },
  {
    id: "fl-otp-fco-w6",
    origin: "OTP",
    originCity: "București",
    destination: "FCO",
    destinationCity: "Roma",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-12",
    departTime: "16:40",
    arriveTime: "17:45",
    durationMin: 125,
    returnDate: "2026-09-16",
    cabin: "economy",
    baggage: "Doar bagaj mic de cabină",
    price: 118,
    seatsLeft: 6,
  },
  {
    id: "fl-otp-vie-os",
    origin: "OTP",
    originCity: "București",
    destination: "VIE",
    destinationCity: "Viena",
    airline: "austrian",
    stops: 0,
    departDate: "2026-09-10",
    departTime: "07:05",
    arriveTime: "07:45",
    durationMin: 100,
    returnDate: "2026-09-13",
    cabin: "economy",
    baggage: "Bagaj de mână inclus",
    price: 196,
  },
  {
    id: "fl-otp-vie-business",
    origin: "OTP",
    originCity: "București",
    destination: "VIE",
    destinationCity: "Viena",
    airline: "austrian",
    stops: 0,
    departDate: "2026-09-10",
    departTime: "17:20",
    arriveTime: "18:00",
    durationMin: 100,
    returnDate: "2026-09-13",
    cabin: "business",
    baggage: "Două bagaje de cală incluse",
    price: 642,
  },
  {
    id: "fl-otp-ams-klm",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 23 kg inclus",
    price: 289,
  },
  {
    id: "fl-otp-ist-tk",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 23 kg inclus",
    price: 178,
  },
  {
    id: "fl-otp-dxb-ek",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 30 kg inclus",
    price: 486,
  },
  {
    id: "fl-otp-dxb-fz",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 23 kg inclus",
    price: 412,
    seatsLeft: 3,
  },
  {
    id: "fl-otp-doh-qr",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 30 kg inclus",
    price: 528,
  },
  {
    id: "fl-otp-bkk-qr",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 30 kg inclus",
    price: 742,
  },
  {
    id: "fl-otp-jfk-lh",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 23 kg inclus",
    price: 689,
  },
  {
    id: "fl-otp-jfk-hisky",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 23 kg inclus",
    price: 918,
  },
  {
    id: "fl-otp-nrt-tk",
    origin: "OTP",
    originCity: "București",
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
    baggage: "Bagaj de cală 23 kg inclus",
    price: 964,
  },
  {
    id: "fl-otp-gru-af",
    origin: "OTP",
    originCity: "București",
    destination: "GRU",
    destinationCity: "São Paulo",
    airline: "airfrance",
    stops: 2,
    departDate: "2027-02-06",
    departTime: "07:10",
    arriveTime: "06:20",
    durationMin: 1390,
    returnDate: "2027-02-20",
    cabin: "economy",
    baggage: "Bagaj de cală 23 kg inclus",
    price: 1148,
  },
  {
    id: "fl-otp-ath-a3",
    origin: "OTP",
    originCity: "București",
    destination: "ATH",
    destinationCity: "Atena",
    airline: "tarom",
    stops: 0,
    departDate: "2026-09-26",
    departTime: "10:45",
    arriveTime: "12:20",
    durationMin: 95,
    cabin: "economy",
    baggage: "Bagaj de mână inclus",
    price: 132,
  },
  {
    id: "fl-otp-mxp-w6-oneway",
    origin: "OTP",
    originCity: "București",
    destination: "MXP",
    destinationCity: "Milano",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-19",
    departTime: "21:15",
    arriveTime: "22:30",
    durationMin: 135,
    cabin: "economy",
    baggage: "Doar bagaj mic de cabină",
    price: 74,
    seatsLeft: 9,
  },
  {
    id: "fl-otp-otp-lis-tp",
    origin: "OTP",
    originCity: "București",
    destination: "LIS",
    destinationCity: "Lisabona",
    airline: "lufthansa",
    stops: 1,
    departDate: "2026-10-08",
    departTime: "06:00",
    arriveTime: "13:10",
    durationMin: 490,
    returnDate: "2026-10-14",
    cabin: "economy",
    baggage: "Bagaj de cală 23 kg inclus",
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
    baggage: "Bagaj de mână inclus",
    price: 164,
  },
  {
    id: "fl-cluj-muc-lh",
    origin: "CLJ",
    originCity: "Cluj-Napoca",
    destination: "MUC",
    destinationCity: "München",
    airline: "lufthansa",
    stops: 0,
    departDate: "2026-09-11",
    departTime: "13:05",
    arriveTime: "14:20",
    durationMin: 135,
    returnDate: "2026-09-15",
    cabin: "economy",
    baggage: "Bagaj de mână inclus",
    price: 228,
  },
  {
    id: "fl-cluj-lhr-lot",
    origin: "CLJ",
    originCity: "Cluj-Napoca",
    destination: "LHR",
    destinationCity: "Londra",
    airline: "lot",
    stops: 1,
    departDate: "2026-09-14",
    departTime: "06:35",
    arriveTime: "11:50",
    durationMin: 375,
    returnDate: "2026-09-20",
    cabin: "economy",
    baggage: "Bagaj de cală 23 kg inclus",
    price: 246,
  },
  {
    id: "fl-timisoara-vie-os",
    origin: "TSR",
    originCity: "Timișoara",
    destination: "VIE",
    destinationCity: "Viena",
    airline: "austrian",
    stops: 0,
    departDate: "2026-09-10",
    departTime: "15:40",
    arriveTime: "16:20",
    durationMin: 100,
    returnDate: "2026-09-13",
    cabin: "economy",
    baggage: "Bagaj de mână inclus",
    price: 184,
  },
  {
    id: "fl-timisoara-fco-w6",
    origin: "TSR",
    originCity: "Timișoara",
    destination: "FCO",
    destinationCity: "Roma",
    airline: "wizz",
    stops: 0,
    departDate: "2026-09-12",
    departTime: "11:30",
    arriveTime: "12:25",
    durationMin: 115,
    returnDate: "2026-09-16",
    cabin: "economy",
    baggage: "Doar bagaj mic de cabină",
    price: 106,
  },
  {
    id: "fl-iasi-ist-tk",
    origin: "IAS",
    originCity: "Iași",
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
    baggage: "Bagaj de cală 23 kg inclus",
    price: 198,
  },
  {
    id: "fl-iasi-cdg-anima",
    origin: "IAS",
    originCity: "Iași",
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
    baggage: "Bagaj de mână inclus",
    price: 254,
  },
  {
    id: "fl-otp-zrh-lx",
    origin: "OTP",
    originCity: "București",
    destination: "ZRH",
    destinationCity: "Zürich",
    airline: "swiss",
    stops: 0,
    departDate: "2026-09-24",
    departTime: "10:05",
    arriveTime: "11:40",
    durationMin: 155,
    returnDate: "2026-09-28",
    cabin: "business",
    baggage: "Două bagaje de cală incluse",
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

function stopsLabel(stops: number): string {
  if (stops === 0) return "Direct"
  return stops === 1 ? "1 escală" : `${stops} escale`
}

function result(row: FlightRow): ResultItem {
  const roundTrip = row.returnDate !== undefined
  return {
    id: row.id,
    title: `${row.originCity} → ${row.destinationCity}`,
    href: `/zboruri/${row.id}`,
    ...(row.seatsLeft !== undefined && row.seatsLeft <= 4
      ? { badge: `Ultimele ${row.seatsLeft} locuri` }
      : {}),
    eyebrow: `${nameOf(AIRLINES, row.airline)} · ${nameOf(CABINS, row.cabin)}`,
    place: `${row.origin} ${row.departTime} → ${row.destination} ${row.arriveTime}`,
    inclusions: [row.baggage, roundTrip ? "Dus-întors" : "Doar dus"],
    chips: [hoursAndMinutes(row.durationMin), stopsLabel(row.stops), row.baggage],
    price: {
      amount: row.price,
      currency: CURRENCY,
      basis: "per_party",
      footnote: roundTrip
        ? "preț total dus-întors, taxe incluse"
        : "preț total pentru un segment, taxe incluse",
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
      name: "Escale",
      type: "array",
      values: STOPS,
      match: (row, value) => (value === "2" ? row.stops >= 2 : row.stops === Number(value)),
      hint: (matching) =>
        matching.length === 0
          ? "indisponibil"
          : `de la ${money(Math.min(...matching.map((row) => row.price)))}`,
      expanded: true,
    },
    {
      key: "airlines",
      name: "Linii aeriene",
      type: "array",
      values: AIRLINES,
      match: (row, value) => row.airline === value,
      expanded: true,
      truncateAt: 6,
    },
    {
      key: "price",
      name: "Pret",
      type: "range",
      measure: (row) => row.price,
      expanded: true,
    },
    {
      key: "duration",
      name: "Durata",
      type: "array",
      values: DURATIONS,
      match: (row, value) => inBand(row.durationMin, value),
    },
  ],
  compare: {
    /**
     * "Cele mai bune" is the industry's only honest compromise sort: price and
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
