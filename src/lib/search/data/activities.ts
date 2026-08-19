/**
 * Things to do once you are there: tickets, guided tours, day trips.
 *
 * Two shapes set this vertical apart. Dates are optional — most of this stock
 * runs daily, and forcing a date before showing anything would hide the whole
 * catalogue from someone still deciding. And travellers arrive counted, not
 * roomed: four people on a walking tour are four tickets, so occupancy is a
 * flat number with no per-room structure to keep.
 *
 * Scores are out of five here rather than out of ten. Experiences are rated the
 * way tickets are rated everywhere else, and translating to a hotel scale would
 * make an honest 4.6 look like a failure.
 *
 * The rows are demo content, written in English, the theme's base language: a
 * ticket, the city it is sold in, the sights it covers. The category, the
 * features and the word beside the score are the theme's own vocabulary and are
 * looked up per locale.
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
  labelFor,
  matchesPlace,
  photo,
} from "./catalog"

export interface ActivityRow {
  id: string
  title: string
  city: string
  country: string
  category: string
  /** Hours on the ground, which is what the duration facet bands. */
  hours: number
  timeOfDay: string[]
  languages: string[]
  features: string[]
  /** Out of five. */
  score: number
  reviews: number
  price: number
  was?: number
  lat: number
  lng: number
  image: string
}

const CATEGORIES: FacetValueSpec[] = [
  { value: "tours", label: (copy) => copy.categories.tours },
  { value: "museums", label: (copy) => copy.categories.museums },
  { value: "food", label: (copy) => copy.categories.food },
  { value: "adventure", label: (copy) => copy.categories.adventure },
  { value: "water", label: (copy) => copy.categories.water },
  { value: "nature", label: (copy) => copy.categories.nature },
  { value: "shows", label: (copy) => copy.categories.shows },
  { value: "wellness", label: (copy) => copy.categories.wellness },
]

const DURATIONS: FacetValueSpec[] = [
  { value: "0-2", label: (copy, locale) => bandLabel("0-2", "hours", copy, locale) },
  { value: "2-4", label: (copy, locale) => bandLabel("2-4", "hours", copy, locale) },
  { value: "4-8", label: (copy, locale) => bandLabel("4-8", "hours", copy, locale) },
  { value: "8-", label: (copy, locale) => bandLabel("8-", "hours", copy, locale) },
]

const TIMES: FacetValueSpec[] = [
  { value: "morning", label: (copy) => copy.times.morning },
  { value: "afternoon", label: (copy) => copy.times.afternoon },
  { value: "evening", label: (copy) => copy.times.evening },
]

/**
 * The language a tour is guided in. The code is the operator's; the name of the
 * language is the theme's, because a language is named differently in every
 * language that names it. A lookup, then, not a proper noun.
 */
const LANGUAGES: FacetValueSpec[] = [
  { value: "ro", label: (copy) => copy.languages.ro },
  { value: "en", label: (copy) => copy.languages.en },
  { value: "fr", label: (copy) => copy.languages.fr },
  { value: "es", label: (copy) => copy.languages.es },
  { value: "it", label: (copy) => copy.languages.it },
  { value: "de", label: (copy) => copy.languages.de },
]

const FEATURES: FacetValueSpec[] = [
  { value: "freecancellation", label: (copy) => copy.features.freecancellation },
  { value: "instant", label: (copy) => copy.features.instant },
  { value: "mobileticket", label: (copy) => copy.features.mobileticket },
  { value: "skiptheline", label: (copy) => copy.features.skiptheline },
  { value: "liveguide", label: (copy) => copy.features.liveguide },
  { value: "smallgroup", label: (copy) => copy.features.smallgroup },
  { value: "transferincluded", label: (copy) => copy.features.transferincluded },
  { value: "accessible", label: (copy) => copy.features.accessible },
]

/** Out of five, so the thresholds differ from the hotel bands — the words do not. */
const RATING_BANDS: FacetValueSpec[] = [
  { value: "4.8", label: (copy) => `4.8+ ${copy.ratings.exceptional}` },
  { value: "4.5", label: (copy) => `4.5+ ${copy.ratings.veryGood}` },
  { value: "4", label: (copy) => `4+ ${copy.ratings.good}` },
]

export const ACTIVITY_ROWS: ActivityRow[] = [
  {
    id: "ac-buc-parlament",
    title: "The Palace of the Parliament: guided tour with ticket",
    city: "Bucharest",
    country: "Romania",
    category: "museums",
    hours: 1.5,
    timeOfDay: ["morning", "afternoon"],
    languages: ["ro", "en"],
    features: ["freecancellation", "instant", "skiptheline", "liveguide"],
    score: 4.6,
    reviews: 2140,
    price: 18,
    lat: 44.4275,
    lng: 26.0873,
    image: "photo-1445019980597-93fa8acb246c",
  },
  {
    id: "ac-buc-comunism",
    title: "Communist Bucharest by Dacia 1300",
    city: "Bucharest",
    country: "Romania",
    category: "tours",
    hours: 3,
    timeOfDay: ["morning", "afternoon"],
    languages: ["ro", "en", "fr"],
    features: ["freecancellation", "smallgroup", "liveguide", "mobileticket"],
    score: 4.9,
    reviews: 860,
    price: 42,
    lat: 44.4325,
    lng: 26.1039,
    image: "photo-1493246507139-91e8fad9978e",
  },
  {
    id: "ac-buc-degustare",
    title: "Romanian wine tasting in the Old Town",
    city: "Bucharest",
    country: "Romania",
    category: "food",
    hours: 2,
    timeOfDay: ["evening"],
    languages: ["ro", "en"],
    features: ["freecancellation", "instant", "smallgroup"],
    score: 4.8,
    reviews: 640,
    price: 35,
    was: 42,
    lat: 44.4308,
    lng: 26.1013,
    image: "photo-1501785888041-af3ef285b470",
  },
  {
    id: "ac-buc-therme",
    title: "Therme Bucharest: a day pass",
    city: "Bucharest",
    country: "Romania",
    category: "wellness",
    hours: 8,
    timeOfDay: ["morning", "afternoon", "evening"],
    languages: ["ro", "en"],
    features: ["mobileticket", "instant", "accessible"],
    score: 4.4,
    reviews: 5120,
    price: 24,
    lat: 44.6112,
    lng: 26.0384,
    image: "photo-1504609773096-104ff2c73ba4",
  },
  {
    id: "ac-brasov-bran",
    title: "Bran and Peles castles: a day trip from Brasov",
    city: "Brasov",
    country: "Romania",
    category: "tours",
    hours: 9,
    timeOfDay: ["morning"],
    languages: ["ro", "en", "de"],
    features: ["transferincluded", "liveguide", "freecancellation", "skiptheline"],
    score: 4.7,
    reviews: 1840,
    price: 68,
    was: 79,
    lat: 45.6486,
    lng: 25.6069,
    image: "photo-1506905925346-21bda4d32df4",
  },
  {
    id: "ac-brasov-tampa",
    title: "Sunrise hike up Tampa",
    city: "Brasov",
    country: "Romania",
    category: "nature",
    hours: 3,
    timeOfDay: ["morning"],
    languages: ["ro", "en"],
    features: ["smallgroup", "liveguide", "freecancellation"],
    score: 4.8,
    reviews: 320,
    price: 26,
    lat: 45.6382,
    lng: 25.5936,
    image: "photo-1516426122078-c23e76319801",
  },
  {
    id: "ac-brasov-atv",
    title: "Quad biking in the Postavarul mountains",
    city: "Brasov",
    country: "Romania",
    category: "adventure",
    hours: 2,
    timeOfDay: ["morning", "afternoon"],
    languages: ["ro", "en"],
    features: ["instant", "smallgroup"],
    score: 4.6,
    reviews: 410,
    price: 58,
    lat: 45.5921,
    lng: 25.5551,
    image: "photo-1517824806704-9040b037703b",
  },
  {
    id: "ac-sibiu-transfagarasan",
    title: "The Transfagarasan and Balea Lake: a day tour",
    city: "Sibiu",
    country: "Romania",
    category: "tours",
    hours: 10,
    timeOfDay: ["morning"],
    languages: ["ro", "en"],
    features: ["transferincluded", "liveguide", "freecancellation"],
    score: 4.9,
    reviews: 720,
    price: 89,
    lat: 45.7936,
    lng: 24.1508,
    image: "photo-1523805009345-7448845a9e53",
  },
  {
    id: "ac-sibiu-astra",
    title: "The ASTRA open-air museum: entry ticket",
    city: "Sibiu",
    country: "Romania",
    category: "museums",
    hours: 3,
    timeOfDay: ["morning", "afternoon"],
    languages: ["ro", "en"],
    features: ["mobileticket", "instant", "accessible"],
    score: 4.5,
    reviews: 980,
    price: 8,
    lat: 45.7669,
    lng: 24.1289,
    image: "photo-1528181304800-259b08848526",
  },
  {
    id: "ac-cluj-salina",
    title: "Turda salt mine and Turda gorge from Cluj-Napoca",
    city: "Cluj-Napoca",
    country: "Romania",
    category: "nature",
    hours: 7,
    timeOfDay: ["morning"],
    languages: ["ro", "en", "de"],
    features: ["transferincluded", "liveguide", "skiptheline"],
    score: 4.7,
    reviews: 1120,
    price: 62,
    lat: 46.7712,
    lng: 23.6236,
    image: "photo-1533105079780-92b9be482077",
  },
  {
    id: "ac-cluj-food",
    title: "A Transylvanian food tour",
    city: "Cluj-Napoca",
    country: "Romania",
    category: "food",
    hours: 3.5,
    timeOfDay: ["afternoon", "evening"],
    languages: ["ro", "en"],
    features: ["smallgroup", "freecancellation", "liveguide"],
    score: 4.9,
    reviews: 380,
    price: 54,
    lat: 46.7693,
    lng: 23.5899,
    image: "photo-1535941339077-2dd1c7963098",
  },
  {
    id: "ac-constanta-delfini",
    title: "Dolphin watching on the Black Sea",
    city: "Constanta",
    country: "Romania",
    category: "water",
    hours: 2,
    timeOfDay: ["morning", "afternoon"],
    languages: ["ro", "en"],
    features: ["instant", "mobileticket", "freecancellation"],
    score: 4.3,
    reviews: 640,
    price: 32,
    lat: 44.1719,
    lng: 28.6549,
    image: "photo-1544735716-392fe2489ffa",
  },
  {
    id: "ac-delta-tur",
    title: "The Danube Delta: a boat tour from Tulcea",
    city: "Tulcea",
    country: "Romania",
    category: "nature",
    hours: 8,
    timeOfDay: ["morning"],
    languages: ["ro", "en"],
    features: ["liveguide", "transferincluded", "smallgroup"],
    score: 4.8,
    reviews: 520,
    price: 78,
    was: 92,
    lat: 45.1789,
    lng: 28.8005,
    image: "photo-1547471080-7cc2caa01a7e",
  },
  {
    id: "ac-roma-colosseum",
    title: "The Colosseum and Roman Forum: skip-the-line ticket",
    city: "Rome",
    country: "Italy",
    category: "museums",
    hours: 3,
    timeOfDay: ["morning", "afternoon"],
    languages: ["ro", "en", "it", "es"],
    features: ["skiptheline", "mobileticket", "instant", "liveguide"],
    score: 4.7,
    reviews: 18420,
    price: 42,
    lat: 41.8902,
    lng: 12.4922,
    image: "photo-1552465011-b4e21bf6e79a",
  },
  {
    id: "ac-roma-vatican",
    title: "The Vatican Museums and the Sistine Chapel",
    city: "Rome",
    country: "Italy",
    category: "museums",
    hours: 3.5,
    timeOfDay: ["morning"],
    languages: ["en", "it", "es", "fr"],
    features: ["skiptheline", "liveguide", "instant"],
    score: 4.6,
    reviews: 22140,
    price: 56,
    was: 64,
    lat: 41.9065,
    lng: 12.4536,
    image: "photo-1554797589-7241bb691973",
  },
  {
    id: "ac-roma-vespa",
    title: "Rome by Vespa at sunset",
    city: "Rome",
    country: "Italy",
    category: "adventure",
    hours: 3,
    timeOfDay: ["evening"],
    languages: ["en", "it"],
    features: ["smallgroup", "freecancellation", "liveguide"],
    score: 4.9,
    reviews: 640,
    price: 98,
    lat: 41.9028,
    lng: 12.4964,
    image: "photo-1590523278191-995cbcda646b",
  },
  {
    id: "ac-paris-eiffel",
    title: "The Eiffel Tower: second-floor access",
    city: "Paris",
    country: "France",
    category: "museums",
    hours: 2,
    timeOfDay: ["morning", "afternoon", "evening"],
    languages: ["en", "fr"],
    features: ["skiptheline", "mobileticket", "instant"],
    score: 4.5,
    reviews: 31240,
    price: 38,
    lat: 48.8584,
    lng: 2.2945,
    image: "photo-1597834777623-acd73456aca1",
  },
  {
    id: "ac-paris-sena",
    title: "A dinner cruise on the Seine",
    city: "Paris",
    country: "France",
    category: "water",
    hours: 2.5,
    timeOfDay: ["evening"],
    languages: ["en", "fr"],
    features: ["freecancellation", "instant", "accessible"],
    score: 4.4,
    reviews: 8120,
    price: 92,
    lat: 48.8606,
    lng: 2.3376,
    image: "photo-1699521609597-6f0a2a0e9694",
  },
  {
    id: "ac-barcelona-sagrada",
    title: "Sagrada Familia: ticket with audio guide",
    city: "Barcelona",
    country: "Spain",
    category: "museums",
    hours: 1.5,
    timeOfDay: ["morning", "afternoon"],
    languages: ["en", "es", "fr", "it"],
    features: ["skiptheline", "mobileticket", "instant", "accessible"],
    score: 4.8,
    reviews: 26410,
    price: 34,
    lat: 41.4036,
    lng: 2.1744,
    image: "photo-1700589448574-959c56eceb4c",
  },
  {
    id: "ac-barcelona-tapas",
    title: "A tapas tour of the Gothic Quarter",
    city: "Barcelona",
    country: "Spain",
    category: "food",
    hours: 3.5,
    timeOfDay: ["evening"],
    languages: ["en", "es"],
    features: ["smallgroup", "liveguide", "freecancellation"],
    score: 4.9,
    reviews: 2140,
    price: 78,
    lat: 41.3833,
    lng: 2.1777,
    image: "photo-1707485318485-25e6b0e402cd",
  },
  {
    id: "ac-viena-concert",
    title: "A Mozart concert at the Musikverein",
    city: "Vienna",
    country: "Austria",
    category: "shows",
    hours: 2,
    timeOfDay: ["evening"],
    languages: ["de", "en"],
    features: ["mobileticket", "instant", "accessible"],
    score: 4.6,
    reviews: 4210,
    price: 64,
    lat: 48.2001,
    lng: 16.3726,
    image: "photo-1731336250970-dc942b5e0746",
  },
  {
    id: "ac-viena-schonbrunn",
    title: "Schonbrunn Palace and its gardens",
    city: "Vienna",
    country: "Austria",
    category: "museums",
    hours: 3,
    timeOfDay: ["morning", "afternoon"],
    languages: ["de", "en", "ro"],
    features: ["skiptheline", "liveguide", "instant"],
    score: 4.7,
    reviews: 9840,
    price: 44,
    lat: 48.1855,
    lng: 16.3122,
    image: "photo-1754836982329-92ff4ac13d77",
  },
  {
    id: "ac-budapesta-szechenyi",
    title: "The Szechenyi Baths: entry with a private cabin",
    city: "Budapest",
    country: "Hungary",
    category: "wellness",
    hours: 5,
    timeOfDay: ["morning", "afternoon", "evening"],
    languages: ["en", "de"],
    features: ["mobileticket", "skiptheline", "instant"],
    score: 4.5,
    reviews: 15240,
    price: 36,
    was: 42,
    lat: 47.5188,
    lng: 19.0817,
    image: "photo-1761157845286-7663794fd91d",
  },
  {
    id: "ac-budapesta-dunare",
    title: "An evening Danube cruise with prosecco",
    city: "Budapest",
    country: "Hungary",
    category: "water",
    hours: 1.5,
    timeOfDay: ["evening"],
    languages: ["en", "ro"],
    features: ["freecancellation", "instant", "mobileticket"],
    score: 4.7,
    reviews: 11620,
    price: 22,
    lat: 47.4996,
    lng: 19.0455,
    image: "photo-1761953743924-a31e6159d465",
  },
  {
    id: "ac-praga-castel",
    title: "Prague Castle: a morning guided tour",
    city: "Prague",
    country: "Czechia",
    category: "tours",
    hours: 2.5,
    timeOfDay: ["morning"],
    languages: ["en", "de"],
    features: ["liveguide", "skiptheline", "smallgroup"],
    score: 4.6,
    reviews: 3410,
    price: 39,
    lat: 50.0909,
    lng: 14.4005,
    image: "photo-1764488846358-d71c3cb9c909",
  },
  {
    id: "ac-istanbul-bosfor",
    title: "A Bosphorus cruise with lunch",
    city: "Istanbul",
    country: "Turkey",
    category: "water",
    hours: 6,
    timeOfDay: ["morning"],
    languages: ["en", "ro"],
    features: ["transferincluded", "instant", "freecancellation"],
    score: 4.4,
    reviews: 6240,
    price: 46,
    lat: 41.0369,
    lng: 28.9857,
    image: "photo-1773016976756-df949b42cba0",
  },
  {
    id: "ac-atena-acropole",
    title: "The Acropolis and its museum: combined ticket",
    city: "Athens",
    country: "Greece",
    category: "museums",
    hours: 4,
    timeOfDay: ["morning", "afternoon"],
    languages: ["en", "fr", "es"],
    features: ["skiptheline", "mobileticket", "liveguide"],
    score: 4.7,
    reviews: 12840,
    price: 48,
    lat: 37.9715,
    lng: 23.7257,
    image: "photo-1780134758196-8206dee53f6e",
  },
  {
    id: "ac-dubai-desert",
    title: "A desert safari with dinner and a show",
    city: "Dubai",
    country: "United Arab Emirates",
    category: "adventure",
    hours: 7,
    timeOfDay: ["afternoon", "evening"],
    languages: ["en", "ro"],
    features: ["transferincluded", "instant", "freecancellation"],
    score: 4.6,
    reviews: 18240,
    price: 64,
    was: 78,
    lat: 25.0657,
    lng: 55.4033,
    image: "photo-1445019980597-93fa8acb246c",
  },
  {
    id: "ac-venetia-gondola",
    title: "A gondola ride on the Grand Canal",
    city: "Venice",
    country: "Italy",
    category: "water",
    hours: 0.5,
    timeOfDay: ["morning", "afternoon", "evening"],
    languages: ["en", "it"],
    features: ["instant", "mobileticket"],
    score: 4.5,
    reviews: 9420,
    price: 33,
    lat: 45.4341,
    lng: 12.3388,
    image: "photo-1493246507139-91e8fad9978e",
  },
  {
    id: "ac-lisabona-sintra",
    title: "Sintra, Cascais and Cabo da Roca",
    city: "Lisbon",
    country: "Portugal",
    category: "tours",
    hours: 9,
    timeOfDay: ["morning"],
    languages: ["en", "es", "fr"],
    features: ["transferincluded", "liveguide", "smallgroup", "freecancellation"],
    score: 4.8,
    reviews: 5120,
    price: 72,
    lat: 38.7223,
    lng: -9.1393,
    image: "photo-1501785888041-af3ef285b470",
  },
]

/** Cities and countries this catalogue actually sells in. */
const PLACES = ACTIVITY_ROWS.flatMap((row) => [row.city, row.country])

/**
 * Bands are half-open. A three-hour tour belongs in "2-4 hours" and nowhere else;
 * counting it twice would make the facet totals sum to more than the results.
 */
function inHours(hours: number, band: string): boolean {
  if (band === "8-") return hours > 8
  const [min, max] = band.split("-")
  return hours >= Number(min) && hours < Number(max)
}

function result(row: ActivityRow, copy: Copy, locale: string): ResultItem {
  const badge = row.score >= 4.8 && row.reviews > 500 ? copy.tags.travellerfavourite : undefined
  /* Half an hour is written in minutes rather than as "0.5 hours", and an hour
   * and a half keeps its decimal — the count still picks the plural form, which
   * is the part a fixed string would get wrong in half the languages here. */
  const duration =
    row.hours < 1
      ? counted(locale, copy.plurals.minutes, Math.round(row.hours * 60))
      : counted(locale, copy.plurals.hours, row.hours, String(row.hours))
  return {
    id: row.id,
    title: row.title,
    href: `/experiente/${row.id}`,
    image: photo(row.image, `${row.title}, ${row.city}`),
    ...(badge ? { badge } : {}),
    eyebrow: labelFor(CATEGORIES, row.category, copy, locale),
    place: `${row.city}, ${row.country}`,
    rating: {
      score: row.score,
      label: fill(copy.outOfFive, { score: row.score.toFixed(1) }),
      count: row.reviews,
    },
    inclusions: row.features
      .slice(0, 3)
      .map((feature) => labelFor(FEATURES, feature, copy, locale)),
    chips: [
      duration,
      row.languages
        .map((code) => labelFor(LANGUAGES, code, copy, locale))
        .slice(0, 2)
        .join(", "),
    ],
    price: {
      amount: row.price,
      currency: CURRENCY,
      basis: "per_person",
      ...(row.was ? { was: row.was, discountPct: Math.round((1 - row.price / row.was) * 100) } : {}),
      footnote: copy.footnotes.perPerson,
    },
    geo: { lat: row.lat, lng: row.lng },
  }
}

/**
 * The destination is the only required input, and the free-text box searches
 * titles rather than acting as another facet: someone typing "Colosseum" wants
 * that ticket, not the category it belongs to.
 */
function base(row: ActivityRow, query: SearchQuery): boolean {
  const filters = query.filters
  const destination = filters.destination
  if (typeof destination === "string" && destination !== "") {
    if (!matchesPlace(destination, [row.city, row.country], PLACES)) return false
  }
  const text = typeof filters.q === "string" ? filters.q : query.q
  if (typeof text === "string" && text !== "") {
    /* Titles and the city, never the category label. `base` runs before a
     * dictionary is in scope, so matching a category would have to pick one
     * language — and the same query would then return a different number of
     * results depending on which publication ran it. The category has a facet
     * of its own, which is where that narrowing belongs. */
    if (!contains(`${row.title} ${row.city}`, text)) return false
  }
  return true
}

export const activitiesCatalog: Catalog<ActivityRow> = {
  vertical: "activities",
  items: ACTIVITY_ROWS,
  base,
  facets: [
    {
      key: "categories",
      name: (copy) => copy.facets.category,
      type: "array",
      values: CATEGORIES,
      match: (row, value) => row.category === value,
      expanded: true,
    },
    {
      key: "rating",
      name: (copy) => copy.facets.rating,
      type: "array",
      values: RATING_BANDS,
      match: (row, value) => row.score >= Number(value),
      expanded: true,
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
      match: (row, value) => inHours(row.hours, value),
    },
    {
      key: "timeOfDay",
      name: (copy) => copy.facets.timeOfDay,
      type: "array",
      values: TIMES,
      match: (row, value) => row.timeOfDay.includes(value),
    },
    {
      key: "language",
      name: (copy) => copy.facets.language,
      type: "array",
      values: LANGUAGES,
      match: (row, value) => row.languages.includes(value),
    },
    {
      key: "features",
      name: (copy) => copy.facets.features,
      type: "array",
      values: FEATURES,
      match: (row, value) => row.features.includes(value),
      truncateAt: 6,
    },
  ],
  compare: {
    recommended: (a, b) => b.score - a.score || b.reviews - a.reviews,
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    rating_desc: (a, b) => b.score - a.score || b.reviews - a.reviews,
    duration_asc: (a, b) => a.hours - b.hours,
  },
  price: (row) => row.price,
  result,
}
