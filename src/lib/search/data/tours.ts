/**
 * Escorted circuits, which are dated products rather than searchable stock.
 *
 * A circuit has a fixed departure and a fixed itinerary, so the traveller's
 * first question is "when does it leave", not "which nights". That is why the
 * form asks for a month and the rail offers a departure-date sort, and why
 * there is no review score anywhere on this vertical: the thing being rated
 * would be a coach, a guide and eleven hotels at once, and a single number for
 * that is worse than no number.
 *
 * The rows are demo content, written in English, the theme's base language: a
 * circuit title, the countries it crosses, the sights it stops at. The board,
 * the ribbon and what is included are the theme's own words and are looked up
 * per locale.
 */
import type { ResultItem, SearchQuery } from "../contract"
import type { Copy } from "../copy"
import {
  CURRENCY,
  type Catalog,
  type FacetValueSpec,
  bandLabel,
  contains,
  counted,
  fill,
  fold,
  longDate,
  inBand,
  labelFor,
  matchesPlace,
  monthOf,
  monthLabel,
  photo,
} from "./catalog"
import { DEPARTURE_CITIES, TRANSPORT_TYPES } from "./packages"

export interface TourRow {
  id: string
  title: string
  countries: string[]
  departure: string
  date: string
  days: number
  transport: "plane" | "coach"
  highlights: string[]
  tags: string[]
  /** Per person, in a double room — the only basis a circuit is ever quoted on. */
  price: number
  was?: number
  otherDates: number
  image: string
}

/** The months the operator has dated departures in, plus the "any" escape. */
export const TOUR_MONTHS: FacetValueSpec[] = [
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
  "2027-01",
  "2027-02",
  "2027-03",
  "2027-04",
  "2027-05",
  "2027-06",
].map((key) => ({ value: key, label: (_copy, locale) => monthLabel(key, locale) }))

export const TOUR_DURATIONS: FacetValueSpec[] = [
  { value: "4-6", label: (copy, locale) => bandLabel("4-6", "days", copy, locale) },
  { value: "7-9", label: (copy, locale) => bandLabel("7-9", "days", copy, locale) },
  { value: "10-14", label: (copy, locale) => bandLabel("10-14", "days", copy, locale) },
  { value: "14-", label: (copy, locale) => bandLabel("14-", "days", copy, locale) },
  { value: "any", label: (copy) => copy.choices.anyDuration },
]

const COUNTRIES: FacetValueSpec[] = [
  "Italy",
  "Spain",
  "Portugal",
  "France",
  "Greece",
  "Czechia",
  "Austria",
  "Hungary",
  "Switzerland",
  "Iceland",
  "Norway",
  "United Kingdom",
  "Ireland",
  "Albania",
  "Montenegro",
  "Morocco",
  "Egypt",
  "Jordan",
  "Israel",
  "Turkey",
  "Georgia",
  "Armenia",
  "United Arab Emirates",
  "India",
  "Japan",
  "Thailand",
  "Vietnam",
  "Peru",
  "South Africa",
].map((name) => ({ value: fold(name).replace(/\s+/g, "-"), name }))

const TAGS: FacetValueSpec[] = [
  { value: "bestseller", label: (copy) => copy.tags.bestseller },
  { value: "guaranteed", label: (copy) => copy.tags.guaranteed },
  { value: "smallgroup", label: (copy) => copy.tags.smallgroup },
  { value: "tourmanager", label: (copy) => copy.tags.tourmanager },
  { value: "exotic", label: (copy) => copy.tags.exotic },
  { value: "lastplaces", label: (copy) => copy.tags.lastplaces },
]

function country(name: string): string {
  return fold(name).replace(/\s+/g, "-")
}

export const TOUR_ROWS: TourRow[] = [
  {
    id: "tr-italia-sud",
    title: "Southern Italy and Sicily",
    countries: ["Italy"],
    departure: "bucharest",
    date: "2026-09-14",
    days: 10,
    transport: "plane",
    highlights: ["Naples", "Pompeii", "Palermo", "Taormina"],
    tags: ["bestseller", "tourmanager"],
    price: 1290,
    was: 1440,
    otherDates: 4,
    image: "photo-1445019980597-93fa8acb246c",
  },
  {
    id: "tr-toscana-cinque",
    title: "Tuscany and Cinque Terre",
    countries: ["Italy"],
    departure: "bucharest",
    date: "2026-09-21",
    days: 8,
    transport: "plane",
    highlights: ["Florence", "Siena", "Pisa", "Manarola"],
    tags: ["guaranteed", "tourmanager"],
    price: 1090,
    otherDates: 5,
    image: "photo-1493246507139-91e8fad9978e",
  },
  {
    id: "tr-spania-mare",
    title: "The Grand Tour of Spain",
    countries: ["Spain"],
    departure: "bucharest",
    date: "2026-10-05",
    days: 12,
    transport: "plane",
    highlights: ["Madrid", "Toledo", "Sevilla", "Barcelona"],
    tags: ["bestseller", "tourmanager"],
    price: 1490,
    otherDates: 3,
    image: "photo-1501785888041-af3ef285b470",
  },
  {
    id: "tr-andaluzia-maroc",
    title: "Andalusia and Morocco",
    countries: ["Spain", "Morocco"],
    departure: "bucharest",
    date: "2026-10-12",
    days: 11,
    transport: "plane",
    highlights: ["Granada", "Tangier", "Fes", "Rabat"],
    tags: ["smallgroup"],
    price: 1390,
    was: 1520,
    otherDates: 2,
    image: "photo-1504609773096-104ff2c73ba4",
  },
  {
    id: "tr-portugalia",
    title: "Portugal from north to south",
    countries: ["Portugal"],
    departure: "cluj",
    date: "2026-09-28",
    days: 9,
    transport: "plane",
    highlights: ["Porto", "Coimbra", "Lisbon", "Sintra"],
    tags: ["tourmanager", "guaranteed"],
    price: 1240,
    otherDates: 4,
    image: "photo-1506905925346-21bda4d32df4",
  },
  {
    id: "tr-loara-paris",
    title: "The Loire Valley castles and Paris",
    countries: ["France"],
    departure: "bucharest",
    date: "2026-09-07",
    days: 8,
    transport: "plane",
    highlights: ["Paris", "Chambord", "Amboise", "Versailles"],
    tags: ["tourmanager"],
    price: 1180,
    otherDates: 3,
    image: "photo-1516426122078-c23e76319801",
  },
  {
    id: "tr-grecia-meteora",
    title: "Mainland Greece and Meteora",
    countries: ["Greece"],
    departure: "bucharest",
    date: "2026-10-19",
    days: 7,
    transport: "coach",
    highlights: ["Meteora", "Delphi", "Athens", "Thessaloniki"],
    tags: ["guaranteed"],
    price: 590,
    was: 660,
    otherDates: 6,
    image: "photo-1517824806704-9040b037703b",
  },
  {
    id: "tr-atena-cyclade",
    title: "Athens, Santorini and Mykonos",
    countries: ["Greece"],
    departure: "bucharest",
    date: "2026-09-12",
    days: 8,
    transport: "plane",
    highlights: ["The Acropolis", "Oia", "Fira", "Delos"],
    tags: ["bestseller"],
    price: 990,
    otherDates: 4,
    image: "photo-1523805009345-7448845a9e53",
  },
  {
    id: "tr-praga-viena-budapesta",
    title: "Prague, Vienna and Budapest",
    countries: ["Czechia", "Austria", "Hungary"],
    departure: "cluj",
    date: "2026-09-05",
    days: 6,
    transport: "coach",
    highlights: ["Charles Bridge", "Schönbrunn", "Fisherman's Bastion"],
    tags: ["guaranteed", "tourmanager"],
    price: 480,
    otherDates: 8,
    image: "photo-1528181304800-259b08848526",
  },
  {
    id: "tr-islanda",
    title: "Iceland: the Golden Circle",
    countries: ["Iceland"],
    departure: "bucharest",
    date: "2026-09-19",
    days: 8,
    transport: "plane",
    highlights: ["Reykjavik", "Gullfoss", "Jökulsárlón", "Blue Lagoon"],
    tags: ["smallgroup", "exotic"],
    price: 2190,
    otherDates: 2,
    image: "photo-1533105079780-92b9be482077",
  },
  {
    id: "tr-fiorduri",
    title: "The Norwegian Fjords",
    countries: ["Norway"],
    departure: "bucharest",
    date: "2026-09-26",
    days: 9,
    transport: "plane",
    highlights: ["Bergen", "Geiranger", "Flåm", "Oslo"],
    tags: ["smallgroup"],
    price: 1890,
    otherDates: 2,
    image: "photo-1535941339077-2dd1c7963098",
  },
  {
    id: "tr-maroc-imperial",
    title: "Morocco: the imperial cities",
    countries: ["Morocco"],
    departure: "bucharest",
    date: "2026-11-02",
    days: 8,
    transport: "plane",
    highlights: ["Marrakech", "Fes", "Meknes", "Casablanca"],
    tags: ["bestseller", "tourmanager"],
    price: 890,
    was: 990,
    otherDates: 5,
    image: "photo-1544735716-392fe2489ffa",
  },
  {
    id: "tr-egipt-nil",
    title: "Egypt: a Nile cruise and Cairo",
    countries: ["Egypt"],
    departure: "bucharest",
    date: "2026-11-16",
    days: 8,
    transport: "plane",
    highlights: ["The Pyramids of Giza", "Luxor", "The Valley of the Kings", "Aswan"],
    tags: ["bestseller", "tourmanager"],
    price: 1150,
    otherDates: 6,
    image: "photo-1547471080-7cc2caa01a7e",
  },
  {
    id: "tr-iordania",
    title: "Jordan: Petra and Wadi Rum",
    countries: ["Jordan"],
    departure: "bucharest",
    date: "2026-10-26",
    days: 7,
    transport: "plane",
    highlights: ["Petra", "Wadi Rum", "The Dead Sea", "Jerash"],
    tags: ["smallgroup", "tourmanager"],
    price: 1290,
    otherDates: 3,
    image: "photo-1552465011-b4e21bf6e79a",
  },
  {
    id: "tr-israel",
    title: "Israel: the Holy Land",
    countries: ["Israel"],
    departure: "iasi",
    date: "2026-11-09",
    days: 7,
    transport: "plane",
    highlights: ["Jerusalem", "Bethlehem", "Nazareth", "The Sea of Galilee"],
    tags: ["guaranteed", "tourmanager"],
    price: 1090,
    otherDates: 4,
    image: "photo-1554797589-7241bb691973",
  },
  {
    id: "tr-cappadocia",
    title: "Cappadocia and Istanbul",
    countries: ["Turkey"],
    departure: "bucharest",
    date: "2026-10-12",
    days: 6,
    transport: "plane",
    highlights: ["Göreme", "Pamukkale", "The Grand Bazaar", "Hagia Sofia"],
    tags: ["bestseller"],
    price: 790,
    otherDates: 7,
    image: "photo-1590523278191-995cbcda646b",
  },
  {
    id: "tr-georgia-armenia",
    title: "Georgia and Armenia",
    countries: ["Georgia", "Armenia"],
    departure: "bucharest",
    date: "2026-09-21",
    days: 9,
    transport: "plane",
    highlights: ["Tbilisi", "Kazbegi", "Yerevan", "Lake Sevan"],
    tags: ["smallgroup", "tourmanager"],
    price: 1090,
    otherDates: 3,
    image: "photo-1597834777623-acd73456aca1",
  },
  {
    id: "tr-japonia",
    title: "Japan in cherry blossom season",
    countries: ["Japan"],
    departure: "bucharest",
    date: "2027-04-03",
    days: 12,
    transport: "plane",
    highlights: ["Tokyo", "Kyoto", "Nara", "Hiroshima"],
    tags: ["exotic", "smallgroup"],
    price: 3890,
    otherDates: 2,
    image: "photo-1699521609597-6f0a2a0e9694",
  },
  {
    id: "tr-thailanda",
    title: "Thailand: Bangkok and Phuket",
    countries: ["Thailand"],
    departure: "bucharest",
    date: "2027-01-11",
    days: 12,
    transport: "plane",
    highlights: ["Bangkok", "Ayutthaya", "Phuket", "Phang Nga"],
    tags: ["exotic", "bestseller"],
    price: 2190,
    was: 2390,
    otherDates: 3,
    image: "photo-1700589448574-959c56eceb4c",
  },
  {
    id: "tr-vietnam",
    title: "Vietnam from north to south",
    countries: ["Vietnam"],
    departure: "bucharest",
    date: "2026-11-23",
    days: 15,
    transport: "plane",
    highlights: ["Hanoi", "Halong", "Hoi An", "The Mekong Delta"],
    tags: ["exotic", "smallgroup"],
    price: 2390,
    otherDates: 2,
    image: "photo-1707485318485-25e6b0e402cd",
  },
  {
    id: "tr-peru",
    title: "Peru: in the footsteps of the Incas",
    countries: ["Peru"],
    departure: "bucharest",
    date: "2027-03-08",
    days: 13,
    transport: "plane",
    highlights: ["Lima", "Cusco", "Machu Picchu", "Lake Titicaca"],
    tags: ["exotic"],
    price: 3490,
    otherDates: 2,
    image: "photo-1731336250970-dc942b5e0746",
  },
  {
    id: "tr-africa-sud",
    title: "South Africa and Cape Town",
    countries: ["South Africa"],
    departure: "bucharest",
    date: "2027-02-15",
    days: 12,
    transport: "plane",
    highlights: ["Cape Town", "Kruger", "The Garden Route", "Stellenbosch"],
    tags: ["exotic", "smallgroup"],
    price: 3190,
    otherDates: 2,
    image: "photo-1754836982329-92ff4ac13d77",
  },
  {
    id: "tr-dubai-abudhabi",
    title: "Dubai and Abu Dhabi",
    countries: ["United Arab Emirates"],
    departure: "bucharest",
    date: "2026-12-07",
    days: 6,
    transport: "plane",
    highlights: ["Burj Khalifa", "The Grand Mosque", "The Liwa Desert"],
    tags: ["bestseller"],
    price: 990,
    otherDates: 5,
    image: "photo-1761157845286-7663794fd91d",
  },
  {
    id: "tr-balcani",
    title: "Albania and Montenegro",
    countries: ["Albania", "Montenegro"],
    departure: "timisoara",
    date: "2026-09-14",
    days: 8,
    transport: "coach",
    highlights: ["Kotor", "Budva", "Berat", "The Albanian Riviera"],
    tags: ["guaranteed"],
    price: 690,
    otherDates: 4,
    image: "photo-1761953743924-a31e6159d465",
  },
  {
    id: "tr-toscana-autocar",
    title: "Tuscany by coach",
    countries: ["Italy"],
    departure: "cluj",
    date: "2026-10-05",
    days: 7,
    transport: "coach",
    highlights: ["Verona", "Florence", "San Gimignano", "Venice"],
    tags: ["guaranteed", "lastplaces"],
    price: 620,
    was: 690,
    otherDates: 5,
    image: "photo-1764488846358-d71c3cb9c909",
  },
  {
    id: "tr-provence",
    title: "Provence and the Côte d'Azur",
    countries: ["France"],
    departure: "bucharest",
    date: "2027-05-10",
    days: 9,
    transport: "plane",
    highlights: ["Nice", "Cannes", "Avignon", "Gorges du Verdon"],
    tags: ["tourmanager"],
    price: 1490,
    otherDates: 3,
    image: "photo-1773016976756-df949b42cba0",
  },
  {
    id: "tr-scotia",
    title: "Scotland and the Isle of Skye",
    countries: ["United Kingdom"],
    departure: "bucharest",
    date: "2027-06-07",
    days: 8,
    transport: "plane",
    highlights: ["Edinburgh", "Loch Ness", "Skye", "Glencoe"],
    tags: ["smallgroup"],
    price: 1690,
    otherDates: 2,
    image: "photo-1780134758196-8206dee53f6e",
  },
  {
    id: "tr-irlanda",
    title: "Ireland: the green heart",
    countries: ["Ireland"],
    departure: "bucharest",
    date: "2027-05-24",
    days: 7,
    transport: "plane",
    highlights: ["Dublin", "Cliffs of Moher", "Galway", "Killarney"],
    tags: ["tourmanager"],
    price: 1590,
    otherDates: 2,
    image: "photo-1445019980597-93fa8acb246c",
  },
  {
    id: "tr-india",
    title: "India: the Golden Triangle",
    countries: ["India"],
    departure: "bucharest",
    date: "2027-02-22",
    days: 10,
    transport: "plane",
    highlights: ["Delhi", "Agra", "Jaipur", "Fatehpur Sikri"],
    tags: ["exotic", "tourmanager"],
    price: 1890,
    otherDates: 3,
    image: "photo-1493246507139-91e8fad9978e",
  },
  {
    id: "tr-elvetia",
    title: "Switzerland by panoramic train",
    countries: ["Switzerland"],
    departure: "bucharest",
    date: "2027-06-21",
    days: 7,
    transport: "plane",
    highlights: ["Zermatt", "Glacier Express", "Lucerne", "Interlaken"],
    tags: ["smallgroup", "lastplaces"],
    price: 1790,
    otherDates: 2,
    image: "photo-1501785888041-af3ef285b470",
  },
]

/** Countries and stops, which is everything a circuit can be searched by. */
const PLACES = TOUR_ROWS.flatMap((row) => [...row.countries, ...row.highlights])

const BADGE_ORDER = ["bestseller", "lastplaces", "smallgroup", "exotic"]

function result(row: TourRow, copy: Copy, locale: string): ResultItem {
  const badge = BADGE_ORDER.find((candidate) => row.tags.includes(candidate))
  const transport = labelFor(TRANSPORT_TYPES, row.transport, copy, locale)
  return {
    id: row.id,
    title: row.title,
    href: `/circuite/${row.id}`,
    image: photo(row.image, row.title),
    ...(badge ? { badge: labelFor(TAGS, badge, copy, locale) } : {}),
    eyebrow: fill(copy.eyebrows.departingFrom, {
      date: longDate(row.date, locale),
      place: labelFor(DEPARTURE_CITIES, row.departure, copy, locale),
    }),
    place: row.countries.join(" · "),
    inclusions: [
      fill(copy.inclusions.travelBy, { mode: transport.toLowerCase() }),
      copy.inclusions.bedAndBreakfast,
      copy.inclusions.tourManager,
      fill(copy.inclusions.visits, { places: row.highlights.slice(0, 3).join(", ") }),
    ],
    chips: [
      counted(locale, copy.plurals.days, row.days),
      transport,
      counted(locale, copy.plurals.sights, row.highlights.length),
    ],
    price: {
      amount: row.price,
      currency: CURRENCY,
      basis: "per_person",
      ...(row.was ? { was: row.was, discountPct: Math.round((1 - row.price / row.was) * 100) } : {}),
      footnote: copy.footnotes.perPersonDouble,
    },
    otherDates: row.otherDates,
  }
}

/**
 * Every field on this form is optional, including the destination.
 *
 * Circuit shoppers browse far more than they search — "show me what leaves in
 * October" is a real query, and a required destination would turn it into an
 * empty page.
 */
function base(row: TourRow, query: SearchQuery): boolean {
  const filters = query.filters
  const destination = filters.destination
  if (typeof destination === "string" && destination !== "") {
    const names = [...row.countries, ...row.highlights, row.title]
    if (!matchesPlace(destination, names, PLACES)) return false
  }
  const month = filters.month
  if (typeof month === "string" && month !== "" && month !== "any") {
    if (monthOf(row.date) !== month) return false
  }
  const departure = filters.departure
  if (typeof departure === "string" && departure !== "" && departure !== "any") {
    if (row.departure !== departure) return false
  }
  const transport = filters.transport
  if (typeof transport === "string" && transport !== "" && transport !== "any") {
    if (row.transport !== transport) return false
  }
  const duration = filters.duration
  if (typeof duration === "string" && !inBand(row.days, duration)) return false
  if (typeof query.q === "string" && query.q !== "") {
    if (!contains(`${row.title} ${row.countries.join(" ")}`, query.q)) return false
  }
  return true
}

export const toursCatalog: Catalog<TourRow> = {
  vertical: "tours",
  items: TOUR_ROWS,
  base,
  facets: [
    {
      key: "months",
      name: (copy) => copy.facets.month,
      type: "array",
      values: TOUR_MONTHS,
      match: (row, value) => monthOf(row.date) === value,
      expanded: true,
      truncateAt: 6,
    },
    {
      key: "durations",
      name: (copy) => copy.facets.duration,
      type: "array",
      values: TOUR_DURATIONS.filter((band) => band.value !== "any"),
      match: (row, value) => inBand(row.days, value),
      expanded: true,
    },
    {
      key: "departures",
      name: (copy) => copy.facets.departureCity,
      type: "array",
      values: DEPARTURE_CITIES,
      match: (row, value) => row.departure === value,
      expanded: true,
      truncateAt: 6,
    },
    {
      key: "transport_types",
      name: (copy) => copy.facets.transport,
      type: "array",
      values: TRANSPORT_TYPES.filter((entry) => entry.value !== "own"),
      match: (row, value) => row.transport === value,
      expanded: true,
    },
    {
      key: "countries",
      name: (copy) => copy.facets.country,
      type: "array",
      values: COUNTRIES,
      match: (row, value) => row.countries.some((name) => country(name) === value),
      truncateAt: 8,
    },
    {
      key: "tags",
      name: (copy) => copy.facets.tags,
      type: "array",
      values: TAGS,
      match: (row, value) => row.tags.includes(value),
    },
  ],
  compare: {
    recommended: (a, b) =>
      Number(b.tags.includes("bestseller")) - Number(a.tags.includes("bestseller")) ||
      a.date.localeCompare(b.date),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    departure_asc: (a, b) => a.date.localeCompare(b.date),
    duration_asc: (a, b) => a.days - b.days,
  },
  price: (row) => row.price,
  result,
}
