/**
 * Cruises, which are shopped by region and month rather than by date.
 *
 * Nobody sails on the fourteenth because it is the fourteenth; they sail the
 * Western Mediterranean in October because that is when it is warm and cheap.
 * So the form takes a set of months and a region, and the rail carries the two
 * long tails this product has — ships and embarkation ports — as searchable
 * facets, with each ship declared under its line so a traveller loyal to MSC
 * can collapse the rest.
 *
 * Every price on this vertical is per person on double occupancy. That is not
 * a disclaimer, it is the unit: a solo traveller pays a supplement that would
 * make the headline number a lie, so the footnote travels with the price.
 *
 * The rows are demo content, written in English, the theme's base language. They
 * name only what a supplier feed would name — a sailing, a ship, a port of call.
 * The words around them, from the board on board to the ribbon, are the theme's
 * own and are looked up per locale.
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
  longDate,
  inBand,
  labelFor,
  matchesPlace,
  monthLabel,
  monthOf,
  photo,
} from "./catalog"

export interface CruiseRow {
  id: string
  title: string
  region: string
  line: string
  ship: string
  port: string
  date: string
  nights: number
  /** The call list, in order, for the card's place line. */
  itinerary: string[]
  price: number
  was?: number
  badge?: string
  otherDates: number
  image: string
}

/**
 * Regions, not countries: a cruise crosses four borders before lunch.
 *
 * The value tokens are the operator's codes and stay as the feed writes them.
 * They are what `row.region`, the region facet and the form's own select all
 * compare against, so anglicising them here while the rows kept the old spelling
 * would filter every sailing out of a region that still exists — silently, with
 * an empty page rather than an error.
 */
export const CRUISE_REGIONS: FacetValueSpec[] = [
  { value: "mediterana", name: "Mediterranean" },
  { value: "caraibe", name: "Caribbean" },
  { value: "europa-nord", name: "Northern Europe" },
  { value: "canare", name: "Canary Islands" },
  { value: "asia", name: "Asia" },
  { value: "transatlantic", name: "Transatlantic" },
]

export const CRUISE_LINES: FacetValueSpec[] = [
  { value: "msc", name: "MSC Cruises" },
  { value: "costa", name: "Costa Crociere" },
  { value: "royal", name: "Royal Caribbean" },
  { value: "celebrity", name: "Celebrity Cruises" },
  { value: "azamara", name: "Azamara" },
]

export const CRUISE_SHIPS: FacetValueSpec[] = [
  { value: "msc-world-europa", name: "MSC World Europa", parent: "msc" },
  { value: "msc-seaside", name: "MSC Seaside", parent: "msc" },
  { value: "msc-grandiosa", name: "MSC Grandiosa", parent: "msc" },
  { value: "msc-fantasia", name: "MSC Fantasia", parent: "msc" },
  { value: "msc-musica", name: "MSC Musica", parent: "msc" },
  { value: "msc-lirica", name: "MSC Lirica", parent: "msc" },
  { value: "costa-smeralda", name: "Costa Smeralda", parent: "costa" },
  { value: "costa-toscana", name: "Costa Toscana", parent: "costa" },
  { value: "costa-fortuna", name: "Costa Fortuna", parent: "costa" },
  { value: "costa-deliziosa", name: "Costa Deliziosa", parent: "costa" },
  { value: "costa-pacifica", name: "Costa Pacifica", parent: "costa" },
  { value: "odyssey-of-the-seas", name: "Odyssey of the Seas", parent: "royal" },
  { value: "explorer-of-the-seas", name: "Explorer of the Seas", parent: "royal" },
  { value: "voyager-of-the-seas", name: "Voyager of the Seas", parent: "royal" },
  { value: "wonder-of-the-seas", name: "Wonder of the Seas", parent: "royal" },
  { value: "celebrity-apex", name: "Celebrity Apex", parent: "celebrity" },
  { value: "celebrity-reflection", name: "Celebrity Reflection", parent: "celebrity" },
  { value: "celebrity-constellation", name: "Celebrity Constellation", parent: "celebrity" },
  { value: "azamara-journey", name: "Azamara Journey", parent: "azamara" },
  { value: "azamara-quest", name: "Azamara Quest", parent: "azamara" },
  { value: "azamara-onward", name: "Azamara Onward", parent: "azamara" },
]

export const CRUISE_PORTS: FacetValueSpec[] = [
  { value: "barcelona", name: "Barcelona" },
  { value: "civitavecchia", name: "Civitavecchia (Rome)" },
  { value: "genova", name: "Genoa" },
  { value: "marsilia", name: "Marseille" },
  { value: "trieste", name: "Trieste" },
  { value: "pireu", name: "Piraeus (Athens)" },
  { value: "istanbul", name: "Istanbul" },
  { value: "dubai", name: "Dubai" },
  { value: "tenerife", name: "Santa Cruz de Tenerife" },
  { value: "laspalmas", name: "Las Palmas" },
  { value: "copenhaga", name: "Copenhagen" },
  { value: "kiel", name: "Kiel" },
  { value: "hamburg", name: "Hamburg" },
  { value: "southampton", name: "Southampton" },
  { value: "miami", name: "Miami" },
  { value: "fortlauderdale", name: "Fort Lauderdale" },
  { value: "portcanaveral", name: "Port Canaveral" },
  { value: "singapore", name: "Singapore" },
  { value: "yokohama", name: "Yokohama (Tokyo)" },
]

export const CRUISE_MONTHS: FacetValueSpec[] = [
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
  "2027-07",
  "2027-08",
].map((key) => ({ value: key, label: (_copy, locale) => monthLabel(key, locale) }))

export const CRUISE_DURATIONS: FacetValueSpec[] = [
  { value: "3-7", label: (copy, locale) => bandLabel("3-7", "days", copy, locale) },
  { value: "8-14", label: (copy, locale) => bandLabel("8-14", "days", copy, locale) },
  { value: "14-", label: (copy, locale) => bandLabel("14-", "days", copy, locale) },
]

/**
 * The ribbon a sailing carries. Merchandising, not catalogue: "Bestseller" is
 * the operator's claim about the offer and it has to read in the traveller's
 * language, so the row stores the key and the word is resolved at render.
 */
const BADGES: FacetValueSpec[] = [
  { value: "bestseller", label: (copy) => copy.tags.bestseller },
  { value: "limitedoffer", label: (copy) => copy.tags.limitedoffer },
  { value: "smallgroup", label: (copy) => copy.tags.smallgroup },
  { value: "shortbreak", label: (copy) => copy.tags.shortbreak },
  { value: "rareitinerary", label: (copy) => copy.tags.rareitinerary },
  { value: "repositioning", label: (copy) => copy.tags.repositioning },
]

export const CRUISE_ROWS: CruiseRow[] = [
  {
    id: "cr-med-vest-world-europa",
    title: "Western Mediterranean from Barcelona",
    region: "mediterana",
    line: "msc",
    ship: "msc-world-europa",
    port: "barcelona",
    date: "2026-09-13",
    nights: 7,
    itinerary: ["Barcelona", "Marseille", "Genoa", "Naples", "Palma de Mallorca"],
    price: 649,
    was: 749,
    badge: "bestseller",
    otherDates: 9,
    image: "photo-1445019980597-93fa8acb246c",
  },
  {
    id: "cr-med-est-musica",
    title: "Greek Islands and Kusadasi",
    region: "mediterana",
    line: "msc",
    ship: "msc-musica",
    port: "pireu",
    date: "2026-09-20",
    nights: 7,
    itinerary: ["Piraeus", "Mykonos", "Santorini", "Kusadasi", "Rhodes"],
    price: 589,
    otherDates: 6,
    image: "photo-1493246507139-91e8fad9978e",
  },
  {
    id: "cr-med-smeralda",
    title: "Italy, Malta and Spain",
    region: "mediterana",
    line: "costa",
    ship: "costa-smeralda",
    port: "civitavecchia",
    date: "2026-10-04",
    nights: 7,
    itinerary: ["Civitavecchia", "Palermo", "Valletta", "Barcelona", "Marseille"],
    price: 549,
    was: 629,
    badge: "limitedoffer",
    otherDates: 8,
    image: "photo-1501785888041-af3ef285b470",
  },
  {
    id: "cr-adriatica-deliziosa",
    title: "The Pearl of the Adriatic",
    region: "mediterana",
    line: "costa",
    ship: "costa-deliziosa",
    port: "trieste",
    date: "2026-09-27",
    nights: 7,
    itinerary: ["Trieste", "Split", "Kotor", "Corfu", "Bari"],
    price: 499,
    otherDates: 5,
    image: "photo-1504609773096-104ff2c73ba4",
  },
  {
    id: "cr-med-apex",
    title: "Italian Riviera with Celebrity Apex",
    region: "mediterana",
    line: "celebrity",
    ship: "celebrity-apex",
    port: "civitavecchia",
    date: "2026-10-11",
    nights: 9,
    itinerary: ["Civitavecchia", "Florence", "Nice", "Ibiza", "Valencia"],
    price: 1290,
    otherDates: 3,
    image: "photo-1506905925346-21bda4d32df4",
  },
  {
    id: "cr-med-grandiosa",
    title: "Western Mediterranean from Genoa",
    region: "mediterana",
    line: "msc",
    ship: "msc-grandiosa",
    port: "genova",
    date: "2026-11-08",
    nights: 7,
    itinerary: ["Genoa", "Civitavecchia", "Palermo", "Valletta", "Barcelona"],
    price: 429,
    was: 489,
    otherDates: 7,
    image: "photo-1516426122078-c23e76319801",
  },
  {
    id: "cr-med-fantasia",
    title: "Marseille, Barcelona and the Balearics",
    region: "mediterana",
    line: "msc",
    ship: "msc-fantasia",
    port: "marsilia",
    date: "2027-05-16",
    nights: 7,
    itinerary: ["Marseille", "Barcelona", "Ibiza", "Palma de Mallorca", "Genoa"],
    price: 599,
    otherDates: 6,
    image: "photo-1517824806704-9040b037703b",
  },
  {
    id: "cr-med-toscana",
    title: "Summer Mediterranean with Costa Toscana",
    region: "mediterana",
    line: "costa",
    ship: "costa-toscana",
    port: "barcelona",
    date: "2027-07-11",
    nights: 7,
    itinerary: ["Barcelona", "Marseille", "Savona", "Civitavecchia", "Palermo"],
    price: 689,
    otherDates: 10,
    image: "photo-1523805009345-7448845a9e53",
  },
  {
    id: "cr-med-azamara-journey",
    title: "The Aegean and Turkey, the long way",
    region: "mediterana",
    line: "azamara",
    ship: "azamara-journey",
    port: "istanbul",
    date: "2027-04-18",
    nights: 12,
    itinerary: ["Istanbul", "Çanakkale", "Mykonos", "Patmos", "Piraeus"],
    price: 2490,
    badge: "smallgroup",
    otherDates: 2,
    image: "photo-1528181304800-259b08848526",
  },
  {
    id: "cr-caraibe-wonder",
    title: "Eastern Caribbean with Wonder of the Seas",
    region: "caraibe",
    line: "royal",
    ship: "wonder-of-the-seas",
    port: "portcanaveral",
    date: "2027-01-17",
    nights: 7,
    itinerary: ["Port Canaveral", "Nassau", "Charlotte Amalie", "Philipsburg"],
    price: 1190,
    was: 1340,
    badge: "bestseller",
    otherDates: 12,
    image: "photo-1533105079780-92b9be482077",
  },
  {
    id: "cr-caraibe-odyssey",
    title: "Southern Caribbean from Fort Lauderdale",
    region: "caraibe",
    line: "royal",
    ship: "odyssey-of-the-seas",
    port: "fortlauderdale",
    date: "2027-02-07",
    nights: 8,
    itinerary: ["Fort Lauderdale", "Aruba", "Curaçao", "Bonaire"],
    price: 1290,
    otherDates: 6,
    image: "photo-1535941339077-2dd1c7963098",
  },
  {
    id: "cr-caraibe-seaside",
    title: "Western Caribbean with MSC Seaside",
    region: "caraibe",
    line: "msc",
    ship: "msc-seaside",
    port: "miami",
    date: "2027-01-31",
    nights: 7,
    itinerary: ["Miami", "Ocho Rios", "George Town", "Cozumel", "Ocean Cay"],
    price: 890,
    was: 990,
    otherDates: 9,
    image: "photo-1544735716-392fe2489ffa",
  },
  {
    id: "cr-caraibe-reflection",
    title: "The Caribbean with Celebrity Reflection",
    region: "caraibe",
    line: "celebrity",
    ship: "celebrity-reflection",
    port: "fortlauderdale",
    date: "2027-03-07",
    nights: 10,
    itinerary: ["Fort Lauderdale", "San Juan", "St. Kitts", "Barbados", "St. Lucia"],
    price: 1690,
    otherDates: 4,
    image: "photo-1547471080-7cc2caa01a7e",
  },
  {
    id: "cr-caraibe-explorer",
    title: "The Bahamas, fast",
    region: "caraibe",
    line: "royal",
    ship: "explorer-of-the-seas",
    port: "miami",
    date: "2027-02-21",
    nights: 4,
    itinerary: ["Miami", "Nassau", "CocoCay"],
    price: 549,
    badge: "shortbreak",
    otherDates: 14,
    image: "photo-1552465011-b4e21bf6e79a",
  },
  {
    id: "cr-nord-fiorduri-costa",
    title: "Norwegian Fjords from Kiel",
    region: "europa-nord",
    line: "costa",
    ship: "costa-fortuna",
    port: "kiel",
    date: "2027-06-13",
    nights: 7,
    itinerary: ["Kiel", "Stavanger", "Flåm", "Bergen", "Haugesund"],
    price: 799,
    otherDates: 8,
    image: "photo-1554797589-7241bb691973",
  },
  {
    id: "cr-nord-baltica-msc",
    title: "Capitals of the Baltic",
    region: "europa-nord",
    line: "msc",
    ship: "msc-grandiosa",
    port: "copenhaga",
    date: "2027-07-04",
    nights: 7,
    itinerary: ["Copenhagen", "Stockholm", "Tallinn", "Helsinki", "Gdansk"],
    price: 899,
    was: 1020,
    otherDates: 5,
    image: "photo-1590523278191-995cbcda646b",
  },
  {
    id: "cr-nord-islanda-apex",
    title: "Iceland and the Faroe Islands",
    region: "europa-nord",
    line: "celebrity",
    ship: "celebrity-apex",
    port: "southampton",
    date: "2027-08-08",
    nights: 12,
    itinerary: ["Southampton", "Reykjavik", "Akureyri", "Tórshavn", "Belfast"],
    price: 2190,
    otherDates: 2,
    image: "photo-1597834777623-acd73456aca1",
  },
  {
    id: "cr-nord-capul-nord",
    title: "North Cape and the midnight sun",
    region: "europa-nord",
    line: "azamara",
    ship: "azamara-quest",
    port: "hamburg",
    date: "2027-06-27",
    nights: 15,
    itinerary: ["Hamburg", "Ålesund", "Tromsø", "Honningsvåg", "Bergen"],
    price: 3290,
    badge: "rareitinerary",
    otherDates: 1,
    image: "photo-1699521609597-6f0a2a0e9694",
  },
  {
    id: "cr-canare-lirica",
    title: "The Canary Islands in winter",
    region: "canare",
    line: "msc",
    ship: "msc-lirica",
    port: "tenerife",
    date: "2026-12-13",
    nights: 7,
    itinerary: ["Santa Cruz de Tenerife", "Funchal", "Lanzarote", "Las Palmas"],
    price: 539,
    was: 619,
    badge: "limitedoffer",
    otherDates: 7,
    image: "photo-1700589448574-959c56eceb4c",
  },
  {
    id: "cr-canare-pacifica",
    title: "The Canaries and Madeira",
    region: "canare",
    line: "costa",
    ship: "costa-pacifica",
    port: "laspalmas",
    date: "2027-01-10",
    nights: 8,
    itinerary: ["Las Palmas", "Tenerife", "La Palma", "Funchal", "Lanzarote"],
    price: 649,
    otherDates: 6,
    image: "photo-1707485318485-25e6b0e402cd",
  },
  {
    id: "cr-canare-constellation",
    title: "The Canaries with Celebrity Constellation",
    region: "canare",
    line: "celebrity",
    ship: "celebrity-constellation",
    port: "tenerife",
    date: "2027-02-14",
    nights: 10,
    itinerary: ["Tenerife", "La Gomera", "Agadir", "Casablanca", "Funchal"],
    price: 1390,
    otherDates: 3,
    image: "photo-1731336250970-dc942b5e0746",
  },
  {
    id: "cr-asia-emirate-msc",
    title: "The Emirates and Qatar",
    region: "asia",
    line: "msc",
    ship: "msc-world-europa",
    port: "dubai",
    date: "2026-12-06",
    nights: 7,
    itinerary: ["Dubai", "Abu Dhabi", "Sir Bani Yas", "Doha"],
    price: 749,
    was: 869,
    badge: "bestseller",
    otherDates: 11,
    image: "photo-1754836982329-92ff4ac13d77",
  },
  {
    id: "cr-asia-japonia",
    title: "Japan and South Korea",
    region: "asia",
    line: "royal",
    ship: "voyager-of-the-seas",
    port: "yokohama",
    date: "2027-04-11",
    nights: 9,
    itinerary: ["Yokohama", "Kobe", "Nagasaki", "Busan", "Jeju"],
    price: 1890,
    otherDates: 3,
    image: "photo-1761157845286-7663794fd91d",
  },
  {
    id: "cr-asia-sudest",
    title: "South-East Asia from Singapore",
    region: "asia",
    line: "azamara",
    ship: "azamara-onward",
    port: "singapore",
    date: "2027-03-21",
    nights: 14,
    itinerary: ["Singapore", "Kuala Lumpur", "Phuket", "Langkawi", "Bangkok"],
    price: 2890,
    badge: "smallgroup",
    otherDates: 2,
    image: "photo-1761953743924-a31e6159d465",
  },
  {
    id: "cr-transatlantic-msc",
    title: "Transatlantic: Barcelona to Miami",
    region: "transatlantic",
    line: "msc",
    ship: "msc-seaside",
    port: "barcelona",
    date: "2026-11-15",
    nights: 15,
    itinerary: ["Barcelona", "Malaga", "Funchal", "Nassau", "Miami"],
    price: 899,
    was: 1090,
    badge: "repositioning",
    otherDates: 1,
    image: "photo-1764488846358-d71c3cb9c909",
  },
  {
    id: "cr-transatlantic-costa",
    title: "Spring transatlantic: Fort Lauderdale to Civitavecchia",
    region: "transatlantic",
    line: "costa",
    ship: "costa-fortuna",
    port: "fortlauderdale",
    date: "2027-04-04",
    nights: 16,
    itinerary: ["Fort Lauderdale", "Bermuda", "Ponta Delgada", "Malaga", "Civitavecchia"],
    price: 1090,
    otherDates: 1,
    image: "photo-1773016976756-df949b42cba0",
  },
  {
    id: "cr-transatlantic-celebrity",
    title: "Transatlantic with Celebrity Reflection",
    region: "transatlantic",
    line: "celebrity",
    ship: "celebrity-reflection",
    port: "southampton",
    date: "2027-05-02",
    nights: 13,
    itinerary: ["Southampton", "Vigo", "Ponta Delgada", "Bermuda", "Fort Lauderdale"],
    price: 1590,
    otherDates: 1,
    image: "photo-1780134758196-8206dee53f6e",
  },
]

/** Ports of call, so a free-text "Santorini" still finds the sailings. */
const PLACES = CRUISE_ROWS.flatMap((row) => row.itinerary)

function result(row: CruiseRow, copy: Copy, locale: string): ResultItem {
  const ship = labelFor(CRUISE_SHIPS, row.ship, copy, locale)
  return {
    id: row.id,
    title: row.title,
    href: `/croaziere/${row.id}`,
    image: photo(row.image, `${row.title}, ${ship}`),
    ...(row.badge ? { badge: labelFor(BADGES, row.badge, copy, locale) } : {}),
    eyebrow: fill(copy.eyebrows.departingFrom, {
      date: longDate(row.date, locale),
      place: labelFor(CRUISE_PORTS, row.port, copy, locale),
    }),
    place: row.itinerary.join(" · "),
    inclusions: [
      copy.inclusions.chosenCabin,
      copy.inclusions.fullBoardOnBoard,
      copy.inclusions.entertainment,
      copy.inclusions.portTaxes,
    ],
    chips: [
      counted(locale, copy.plurals.nights, row.nights),
      ship,
      counted(locale, copy.plurals.ports, row.itinerary.length),
    ],
    price: {
      amount: row.price,
      currency: CURRENCY,
      basis: "per_person",
      ...(row.was ? { was: row.was, discountPct: Math.round((1 - row.price / row.was) * 100) } : {}),
      footnote: copy.footnotes.cruiseFare,
    },
    otherDates: row.otherDates,
  }
}

/**
 * A month set, not a date. The form hands back an array; a single month arrives
 * as a bare string when it comes off a URL, and both mean the same thing.
 */
function base(row: CruiseRow, query: SearchQuery): boolean {
  const filters = query.filters
  const destination = filters.destination
  if (typeof destination === "string" && destination !== "" && destination !== "any") {
    if (row.region !== destination && !matchesPlace(destination, row.itinerary, PLACES)) return false
  }
  const monthSet = filters.monthSet
  const wanted = Array.isArray(monthSet) ? monthSet : typeof monthSet === "string" ? [monthSet] : []
  if (wanted.length > 0 && !wanted.includes(monthOf(row.date))) return false
  const duration = filters.duration
  if (typeof duration === "string" && !inBand(row.nights, duration)) return false
  const line = filters.line
  if (typeof line === "string" && line !== "" && line !== "any" && row.line !== line) return false
  const port = filters.port
  if (typeof port === "string" && port !== "" && port !== "any" && row.port !== port) return false
  if (typeof query.q === "string" && query.q !== "") {
    if (!contains(`${row.title} ${row.itinerary.join(" ")}`, query.q)) return false
  }
  return true
}

export const cruisesCatalog: Catalog<CruiseRow> = {
  vertical: "cruises",
  items: CRUISE_ROWS,
  base,
  facets: [
    {
      key: "months",
      name: (copy) => copy.facets.month,
      type: "array",
      values: CRUISE_MONTHS,
      match: (row, value) => monthOf(row.date) === value,
      expanded: true,
      truncateAt: 6,
    },
    {
      key: "durations",
      name: (copy) => copy.facets.duration,
      type: "array",
      values: CRUISE_DURATIONS,
      match: (row, value) => inBand(row.nights, value),
      expanded: true,
    },
    {
      key: "destinations",
      name: (copy) => copy.facets.destination,
      type: "array",
      values: CRUISE_REGIONS,
      match: (row, value) => row.region === value,
      expanded: true,
    },
    {
      key: "cruise_lines",
      name: (copy) => copy.facets.cruiseLine,
      type: "array",
      values: CRUISE_LINES,
      match: (row, value) => row.line === value,
      expanded: true,
    },
    {
      key: "departure_ports",
      name: (copy) => copy.facets.departurePort,
      type: "array",
      values: CRUISE_PORTS,
      match: (row, value) => row.port === value,
      searchable: true,
      truncateAt: 8,
    },
    {
      key: "ships",
      name: (copy) => copy.facets.ship,
      type: "array",
      values: CRUISE_SHIPS,
      match: (row, value) => row.ship === value,
      searchable: true,
      truncateAt: 8,
    },
    {
      key: "prices",
      name: (copy) => copy.facets.price,
      type: "range",
      measure: (row) => row.price,
      expanded: true,
    },
  ],
  compare: {
    recommended: (a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)) || a.price - b.price,
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    departure_asc: (a, b) => a.date.localeCompare(b.date),
    duration_asc: (a, b) => a.nights - b.nights,
  },
  price: (row) => row.price,
  result,
}
