/**
 * Escorted circuits, which are dated products rather than searchable stock.
 *
 * A circuit has a fixed departure and a fixed itinerary, so the traveller's
 * first question is "when does it leave", not "which nights". That is why the
 * form asks for a month and the rail offers a departure-date sort, and why
 * there is no review score anywhere on this vertical: the thing being rated
 * would be a coach, a guide and eleven hotels at once, and a single number for
 * that is worse than no number.
 */
import type { ResultItem, SearchQuery } from "../contract"
import {
  CURRENCY,
  type Catalog,
  type FacetValueSpec,
  contains,
  days,
  fold,
  longDate,
  inBand,
  matchesPlace,
  monthOf,
  monthLabel,
  nameOf,
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
  transport: "avion" | "autocar"
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
].map((key) => ({ value: key, name: monthLabel(key) }))

export const TOUR_DURATIONS: FacetValueSpec[] = [
  { value: "4-6", name: "4-6 zile" },
  { value: "7-9", name: "7-9 zile" },
  { value: "10-14", name: "10-14 zile" },
  { value: "14-", name: "peste 14 zile" },
  { value: "any", name: "Orice durată" },
]

const COUNTRIES: FacetValueSpec[] = [
  "Italia",
  "Spania",
  "Portugalia",
  "Franța",
  "Grecia",
  "Cehia",
  "Austria",
  "Ungaria",
  "Elveția",
  "Islanda",
  "Norvegia",
  "Marea Britanie",
  "Irlanda",
  "Albania",
  "Muntenegru",
  "Maroc",
  "Egipt",
  "Iordania",
  "Israel",
  "Turcia",
  "Georgia",
  "Armenia",
  "Emiratele Arabe Unite",
  "India",
  "Japonia",
  "Thailanda",
  "Vietnam",
  "Peru",
  "Africa de Sud",
].map((name) => ({ value: fold(name).replace(/\s+/g, "-"), name }))

const TAGS: FacetValueSpec[] = [
  { value: "bestseller", name: "Bestseller" },
  { value: "plecari-garantate", name: "Plecări garantate" },
  { value: "grup-mic", name: "Grup mic" },
  { value: "ghid-roman", name: "Ghid însoțitor român" },
  { value: "exotic", name: "Exotic" },
  { value: "ultimele-locuri", name: "Ultimele locuri" },
]

function country(name: string): string {
  return fold(name).replace(/\s+/g, "-")
}

export const TOUR_ROWS: TourRow[] = [
  {
    id: "tr-italia-sud",
    title: "Italia de Sud și Sicilia",
    countries: ["Italia"],
    departure: "bucuresti",
    date: "2026-09-14",
    days: 10,
    transport: "avion",
    highlights: ["Napoli", "Pompei", "Palermo", "Taormina"],
    tags: ["bestseller", "ghid-roman"],
    price: 1290,
    was: 1440,
    otherDates: 4,
    image: "photo-1445019980597-93fa8acb246c",
  },
  {
    id: "tr-toscana-cinque",
    title: "Toscana și Cinque Terre",
    countries: ["Italia"],
    departure: "bucuresti",
    date: "2026-09-21",
    days: 8,
    transport: "avion",
    highlights: ["Florența", "Siena", "Pisa", "Manarola"],
    tags: ["plecari-garantate", "ghid-roman"],
    price: 1090,
    otherDates: 5,
    image: "photo-1493246507139-91e8fad9978e",
  },
  {
    id: "tr-spania-mare",
    title: "Marele Tur al Spaniei",
    countries: ["Spania"],
    departure: "bucuresti",
    date: "2026-10-05",
    days: 12,
    transport: "avion",
    highlights: ["Madrid", "Toledo", "Sevilla", "Barcelona"],
    tags: ["bestseller", "ghid-roman"],
    price: 1490,
    otherDates: 3,
    image: "photo-1501785888041-af3ef285b470",
  },
  {
    id: "tr-andaluzia-maroc",
    title: "Andaluzia și Maroc",
    countries: ["Spania", "Maroc"],
    departure: "bucuresti",
    date: "2026-10-12",
    days: 11,
    transport: "avion",
    highlights: ["Granada", "Tanger", "Fes", "Rabat"],
    tags: ["grup-mic"],
    price: 1390,
    was: 1520,
    otherDates: 2,
    image: "photo-1504609773096-104ff2c73ba4",
  },
  {
    id: "tr-portugalia",
    title: "Portugalia de la nord la sud",
    countries: ["Portugalia"],
    departure: "cluj",
    date: "2026-09-28",
    days: 9,
    transport: "avion",
    highlights: ["Porto", "Coimbra", "Lisabona", "Sintra"],
    tags: ["ghid-roman", "plecari-garantate"],
    price: 1240,
    otherDates: 4,
    image: "photo-1506905925346-21bda4d32df4",
  },
  {
    id: "tr-loara-paris",
    title: "Castelele Loarei și Paris",
    countries: ["Franța"],
    departure: "bucuresti",
    date: "2026-09-07",
    days: 8,
    transport: "avion",
    highlights: ["Paris", "Chambord", "Amboise", "Versailles"],
    tags: ["ghid-roman"],
    price: 1180,
    otherDates: 3,
    image: "photo-1516426122078-c23e76319801",
  },
  {
    id: "tr-grecia-meteora",
    title: "Grecia continentală și Meteora",
    countries: ["Grecia"],
    departure: "bucuresti",
    date: "2026-10-19",
    days: 7,
    transport: "autocar",
    highlights: ["Meteora", "Delfi", "Atena", "Salonic"],
    tags: ["plecari-garantate"],
    price: 590,
    was: 660,
    otherDates: 6,
    image: "photo-1517824806704-9040b037703b",
  },
  {
    id: "tr-atena-cyclade",
    title: "Atena, Santorini și Mykonos",
    countries: ["Grecia"],
    departure: "bucuresti",
    date: "2026-09-12",
    days: 8,
    transport: "avion",
    highlights: ["Acropole", "Oia", "Fira", "Delos"],
    tags: ["bestseller"],
    price: 990,
    otherDates: 4,
    image: "photo-1523805009345-7448845a9e53",
  },
  {
    id: "tr-praga-viena-budapesta",
    title: "Praga, Viena și Budapesta",
    countries: ["Cehia", "Austria", "Ungaria"],
    departure: "cluj",
    date: "2026-09-05",
    days: 6,
    transport: "autocar",
    highlights: ["Podul Carol", "Schönbrunn", "Bastionul Pescarilor"],
    tags: ["plecari-garantate", "ghid-roman"],
    price: 480,
    otherDates: 8,
    image: "photo-1528181304800-259b08848526",
  },
  {
    id: "tr-islanda",
    title: "Islanda - Cercul de Aur",
    countries: ["Islanda"],
    departure: "bucuresti",
    date: "2026-09-19",
    days: 8,
    transport: "avion",
    highlights: ["Reykjavik", "Gullfoss", "Jökulsárlón", "Blue Lagoon"],
    tags: ["grup-mic", "exotic"],
    price: 2190,
    otherDates: 2,
    image: "photo-1533105079780-92b9be482077",
  },
  {
    id: "tr-fiorduri",
    title: "Fiordurile norvegiene",
    countries: ["Norvegia"],
    departure: "bucuresti",
    date: "2026-09-26",
    days: 9,
    transport: "avion",
    highlights: ["Bergen", "Geiranger", "Flåm", "Oslo"],
    tags: ["grup-mic"],
    price: 1890,
    otherDates: 2,
    image: "photo-1535941339077-2dd1c7963098",
  },
  {
    id: "tr-maroc-imperial",
    title: "Maroc - orașele imperiale",
    countries: ["Maroc"],
    departure: "bucuresti",
    date: "2026-11-02",
    days: 8,
    transport: "avion",
    highlights: ["Marrakech", "Fes", "Meknes", "Casablanca"],
    tags: ["bestseller", "ghid-roman"],
    price: 890,
    was: 990,
    otherDates: 5,
    image: "photo-1544735716-392fe2489ffa",
  },
  {
    id: "tr-egipt-nil",
    title: "Egipt - croazieră pe Nil și Cairo",
    countries: ["Egipt"],
    departure: "bucuresti",
    date: "2026-11-16",
    days: 8,
    transport: "avion",
    highlights: ["Piramidele din Giza", "Luxor", "Valea Regilor", "Aswan"],
    tags: ["bestseller", "ghid-roman"],
    price: 1150,
    otherDates: 6,
    image: "photo-1547471080-7cc2caa01a7e",
  },
  {
    id: "tr-iordania",
    title: "Iordania - Petra și Wadi Rum",
    countries: ["Iordania"],
    departure: "bucuresti",
    date: "2026-10-26",
    days: 7,
    transport: "avion",
    highlights: ["Petra", "Wadi Rum", "Marea Moartă", "Jerash"],
    tags: ["grup-mic", "ghid-roman"],
    price: 1290,
    otherDates: 3,
    image: "photo-1552465011-b4e21bf6e79a",
  },
  {
    id: "tr-israel",
    title: "Israel - Țara Sfântă",
    countries: ["Israel"],
    departure: "iasi",
    date: "2026-11-09",
    days: 7,
    transport: "avion",
    highlights: ["Ierusalim", "Betleem", "Nazaret", "Marea Galileii"],
    tags: ["plecari-garantate", "ghid-roman"],
    price: 1090,
    otherDates: 4,
    image: "photo-1554797589-7241bb691973",
  },
  {
    id: "tr-cappadocia",
    title: "Cappadocia și Istanbul",
    countries: ["Turcia"],
    departure: "bucuresti",
    date: "2026-10-12",
    days: 6,
    transport: "avion",
    highlights: ["Göreme", "Pamukkale", "Bazarul Mare", "Hagia Sofia"],
    tags: ["bestseller"],
    price: 790,
    otherDates: 7,
    image: "photo-1590523278191-995cbcda646b",
  },
  {
    id: "tr-georgia-armenia",
    title: "Georgia și Armenia",
    countries: ["Georgia", "Armenia"],
    departure: "bucuresti",
    date: "2026-09-21",
    days: 9,
    transport: "avion",
    highlights: ["Tbilisi", "Kazbegi", "Erevan", "Lacul Sevan"],
    tags: ["grup-mic", "ghid-roman"],
    price: 1090,
    otherDates: 3,
    image: "photo-1597834777623-acd73456aca1",
  },
  {
    id: "tr-japonia",
    title: "Japonia - în sezonul cireșilor",
    countries: ["Japonia"],
    departure: "bucuresti",
    date: "2027-04-03",
    days: 12,
    transport: "avion",
    highlights: ["Tokyo", "Kyoto", "Nara", "Hiroshima"],
    tags: ["exotic", "grup-mic"],
    price: 3890,
    otherDates: 2,
    image: "photo-1699521609597-6f0a2a0e9694",
  },
  {
    id: "tr-thailanda",
    title: "Thailanda - Bangkok și Phuket",
    countries: ["Thailanda"],
    departure: "bucuresti",
    date: "2027-01-11",
    days: 12,
    transport: "avion",
    highlights: ["Bangkok", "Ayutthaya", "Phuket", "Phang Nga"],
    tags: ["exotic", "bestseller"],
    price: 2190,
    was: 2390,
    otherDates: 3,
    image: "photo-1700589448574-959c56eceb4c",
  },
  {
    id: "tr-vietnam",
    title: "Vietnam de la nord la sud",
    countries: ["Vietnam"],
    departure: "bucuresti",
    date: "2026-11-23",
    days: 15,
    transport: "avion",
    highlights: ["Hanoi", "Halong", "Hoi An", "Delta Mekong"],
    tags: ["exotic", "grup-mic"],
    price: 2390,
    otherDates: 2,
    image: "photo-1707485318485-25e6b0e402cd",
  },
  {
    id: "tr-peru",
    title: "Peru - pe urmele incașilor",
    countries: ["Peru"],
    departure: "bucuresti",
    date: "2027-03-08",
    days: 13,
    transport: "avion",
    highlights: ["Lima", "Cusco", "Machu Picchu", "Lacul Titicaca"],
    tags: ["exotic"],
    price: 3490,
    otherDates: 2,
    image: "photo-1731336250970-dc942b5e0746",
  },
  {
    id: "tr-africa-sud",
    title: "Africa de Sud și Cape Town",
    countries: ["Africa de Sud"],
    departure: "bucuresti",
    date: "2027-02-15",
    days: 12,
    transport: "avion",
    highlights: ["Cape Town", "Kruger", "Ruta Grădinilor", "Stellenbosch"],
    tags: ["exotic", "grup-mic"],
    price: 3190,
    otherDates: 2,
    image: "photo-1754836982329-92ff4ac13d77",
  },
  {
    id: "tr-dubai-abudhabi",
    title: "Dubai și Abu Dhabi",
    countries: ["Emiratele Arabe Unite"],
    departure: "bucuresti",
    date: "2026-12-07",
    days: 6,
    transport: "avion",
    highlights: ["Burj Khalifa", "Marea Moschee", "Deșertul Liwa"],
    tags: ["bestseller"],
    price: 990,
    otherDates: 5,
    image: "photo-1761157845286-7663794fd91d",
  },
  {
    id: "tr-balcani",
    title: "Albania și Muntenegru",
    countries: ["Albania", "Muntenegru"],
    departure: "timisoara",
    date: "2026-09-14",
    days: 8,
    transport: "autocar",
    highlights: ["Kotor", "Budva", "Berat", "Riviera albaneză"],
    tags: ["plecari-garantate"],
    price: 690,
    otherDates: 4,
    image: "photo-1761953743924-a31e6159d465",
  },
  {
    id: "tr-toscana-autocar",
    title: "Toscana în autocar",
    countries: ["Italia"],
    departure: "cluj",
    date: "2026-10-05",
    days: 7,
    transport: "autocar",
    highlights: ["Verona", "Florența", "San Gimignano", "Veneția"],
    tags: ["plecari-garantate", "ultimele-locuri"],
    price: 620,
    was: 690,
    otherDates: 5,
    image: "photo-1764488846358-d71c3cb9c909",
  },
  {
    id: "tr-provence",
    title: "Provence și Coasta de Azur",
    countries: ["Franța"],
    departure: "bucuresti",
    date: "2027-05-10",
    days: 9,
    transport: "avion",
    highlights: ["Nisa", "Cannes", "Avignon", "Gorges du Verdon"],
    tags: ["ghid-roman"],
    price: 1490,
    otherDates: 3,
    image: "photo-1773016976756-df949b42cba0",
  },
  {
    id: "tr-scotia",
    title: "Scoția și Insula Skye",
    countries: ["Marea Britanie"],
    departure: "bucuresti",
    date: "2027-06-07",
    days: 8,
    transport: "avion",
    highlights: ["Edinburgh", "Loch Ness", "Skye", "Glencoe"],
    tags: ["grup-mic"],
    price: 1690,
    otherDates: 2,
    image: "photo-1780134758196-8206dee53f6e",
  },
  {
    id: "tr-irlanda",
    title: "Irlanda - inima verde",
    countries: ["Irlanda"],
    departure: "bucuresti",
    date: "2027-05-24",
    days: 7,
    transport: "avion",
    highlights: ["Dublin", "Cliffs of Moher", "Galway", "Killarney"],
    tags: ["ghid-roman"],
    price: 1590,
    otherDates: 2,
    image: "photo-1445019980597-93fa8acb246c",
  },
  {
    id: "tr-india",
    title: "India - Triunghiul de Aur",
    countries: ["India"],
    departure: "bucuresti",
    date: "2027-02-22",
    days: 10,
    transport: "avion",
    highlights: ["Delhi", "Agra", "Jaipur", "Fatehpur Sikri"],
    tags: ["exotic", "ghid-roman"],
    price: 1890,
    otherDates: 3,
    image: "photo-1493246507139-91e8fad9978e",
  },
  {
    id: "tr-elvetia",
    title: "Elveția cu trenuri panoramice",
    countries: ["Elveția"],
    departure: "bucuresti",
    date: "2027-06-21",
    days: 7,
    transport: "avion",
    highlights: ["Zermatt", "Glacier Express", "Lucerna", "Interlaken"],
    tags: ["grup-mic", "ultimele-locuri"],
    price: 1790,
    otherDates: 2,
    image: "photo-1501785888041-af3ef285b470",
  },
]

/** Countries and stops, which is everything a circuit can be searched by. */
const PLACES = TOUR_ROWS.flatMap((row) => [...row.countries, ...row.highlights])

const BADGE_ORDER = ["bestseller", "ultimele-locuri", "grup-mic", "exotic"]

function result(row: TourRow): ResultItem {
  const badge = BADGE_ORDER.find((candidate) => row.tags.includes(candidate))
  return {
    id: row.id,
    title: row.title,
    href: `/circuite/${row.id}`,
    image: photo(row.image, row.title),
    ...(badge ? { badge: nameOf(TAGS, badge) } : {}),
    eyebrow: `Plecare ${longDate(row.date)} din ${nameOf(DEPARTURE_CITIES, row.departure)}`,
    place: row.countries.join(" · "),
    inclusions: [
      `Transport ${nameOf(TRANSPORT_TYPES, row.transport).toLowerCase()}`,
      "Cazare cu mic dejun",
      "Ghid însoțitor român",
      `Vizite incluse: ${row.highlights.slice(0, 3).join(", ")}`,
    ],
    chips: [days(row.days), nameOf(TRANSPORT_TYPES, row.transport), `${row.highlights.length} obiective`],
    price: {
      amount: row.price,
      currency: CURRENCY,
      basis: "per_person",
      ...(row.was ? { was: row.was, discountPct: Math.round((1 - row.price / row.was) * 100) } : {}),
      footnote: "de persoană, în cameră dublă",
    },
    otherDates: row.otherDates,
  }
}

/**
 * Every field on this form is optional, including the destination.
 *
 * Circuit shoppers browse far more than they search — "arată-mi ce pleacă în
 * octombrie" is a real query, and a required destination would turn it into an
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
      name: "Luna",
      type: "array",
      values: TOUR_MONTHS,
      match: (row, value) => monthOf(row.date) === value,
      expanded: true,
      truncateAt: 6,
    },
    {
      key: "durations",
      name: "Durata",
      type: "array",
      values: TOUR_DURATIONS.filter((band) => band.value !== "any"),
      match: (row, value) => inBand(row.days, value),
      expanded: true,
    },
    {
      key: "departures",
      name: "Oras plecare",
      type: "array",
      values: DEPARTURE_CITIES,
      match: (row, value) => row.departure === value,
      expanded: true,
      truncateAt: 6,
    },
    {
      key: "transport_types",
      name: "Transport",
      type: "array",
      values: TRANSPORT_TYPES.filter((entry) => entry.value !== "propriu"),
      match: (row, value) => row.transport === value,
      expanded: true,
    },
    {
      key: "countries",
      name: "Tari",
      type: "array",
      values: COUNTRIES,
      match: (row, value) => row.countries.some((name) => country(name) === value),
      truncateAt: 8,
    },
    {
      key: "tags",
      name: "Etichete",
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
