/**
 * Every word the departures module puts in front of a reader.
 *
 * The strings used to sit inline, in Romanian, in whichever component happened
 * to render them — which meant the module could only ever be published by a
 * Romanian operator, and meant a page could show an operator's translated
 * headings above a table that still said "Plecare din". Copy that lives beside
 * the markup also drifts: the phone card and the desktop row worded the same
 * state twice and would eventually word it differently.
 *
 * English is the source of truth here, phrased as an English travel site would
 * phrase it rather than translated word for word from the Romanian: a reader
 * seeing "The last places" learns immediately that nobody wrote this page for
 * them.
 */

/**
 * Counted phrases, keyed by CLDR plural category.
 *
 * Same shape as `~/lib/messages` uses, restated rather than imported: this
 * module ships inside a client island, and importing from that file to reach a
 * type or a five-line helper risks pulling the theme-wide dictionary of every
 * language into the bundle a phone downloads for one table.
 *
 * "1 nights" is the kind of detail that tells a reader nobody looked at the
 * page, and a naive `n === 1` test only ever fixes English — Romanian needs
 * three forms, one for a single night, one for a few, and one above nineteen
 * that inserts an extra particle before the noun. It is the third that
 * hand-rolled pluralization always forgets, so the categories come from
 * `Intl.PluralRules` and each language declares only the forms it uses.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string
}

export interface Copy {
  // Filters
  departingFrom: string
  anyCity: string
  departureYear: string
  departureMonth: string

  // Table chrome
  tableCaption: string
  columnDays: string
  columnDeparts: string
  columnReturns: string
  columnAccommodation: string
  columnPriceFrom: string
  chooseDeparture: string
  sortPrefix: string
  sortByDate: string
  sortByPrice: string

  // Empty state, and what the reader is told after choosing
  noMatches: string
  clearFilters: string
  chooseToContinue: string
  selectionKept: string
  dateSelected: string

  // One departure's own facts
  departsFrom: string
  twinShare: string
  singleSupplement: string

  // Barometer
  barometerTitle: string
  lowestPrice: string

  // Availability states and the actions they allow
  book: string
  requestQuote: string
  guaranteedDeparture: string
  onRequest: string
  requestAvailability: string
  waitlist: string
  joinWaitlist: string
  soldOut: string
  chooseAnotherDate: string
  notRunning: string
  unavailable: string
  offerExpired: string
  noRoute: string

  // Counted phrases
  days: PluralForms
  nights: PluralForms
  departures: PluralForms
  placesLeft: PluralForms
}

export const EN: Copy = {
  departingFrom: "Departing from",
  anyCity: "Any",
  departureYear: "Departure year",
  departureMonth: "Departure month",

  tableCaption: "Available departures",
  columnDays: "Days",
  columnDeparts: "Departs",
  columnReturns: "Returns",
  columnAccommodation: "Accommodation",
  columnPriceFrom: "Price from",
  chooseDeparture: "Choose a departure",
  sortPrefix: "Sort:",
  sortByDate: "Date",
  sortByPrice: "Price",

  noMatches: "No departures match these filters",
  clearFilters: "Clear filters",
  chooseToContinue: "Choose a departure to continue your booking.",
  selectionKept:
    "Your chosen departure stays selected; you can carry on comparing the other dates.",
  dateSelected: "Date selected",

  departsFrom: "Departs from {city}",
  twinShare: "Per person, two sharing",
  singleSupplement: "Single supplement + {amount}",

  barometerTitle: "Price barometer",
  lowestPrice: "Lowest price:",

  book: "Book",
  requestQuote: "Request a quote",
  guaranteedDeparture: "Guaranteed departure",
  onRequest: "On request",
  requestAvailability: "Request availability",
  waitlist: "Waiting list",
  joinWaitlist: "Join the waiting list",
  soldOut: "Sold out",
  chooseAnotherDate: "Choose another date",
  notRunning: "Not running",
  unavailable: "Unavailable",
  offerExpired: "This offer has expired",
  noRoute: "Contact the agency for availability and pricing.",

  days: { one: "{count} day", other: "{count} days" },
  nights: { one: "{count} night", other: "{count} nights" },
  departures: { one: "{count} departure", other: "{count} departures" },
  placesLeft: { one: "Last place", other: "Only {count} places left" },
}

export const RO: Copy = {
  departingFrom: "Plecare din",
  anyCity: "Oricare",
  departureYear: "Anul plecării",
  departureMonth: "Luna plecării",

  tableCaption: "Plecări disponibile",
  columnDays: "Zile",
  columnDeparts: "Plecare",
  columnReturns: "Întoarcere",
  columnAccommodation: "Cazare",
  columnPriceFrom: "Preț de la",
  chooseDeparture: "Alege plecarea",
  sortPrefix: "Sortează:",
  sortByDate: "Dată",
  sortByPrice: "Preț",

  noMatches: "Nu există rezultate pentru criteriile selectate",
  clearFilters: "Resetează filtrele",
  chooseToContinue: "Alege o plecare pentru a continua rezervarea.",
  selectionKept:
    "Plecarea aleasă rămâne selectată; poți compara în continuare celelalte date.",
  dateSelected: "Dată selectată",

  departsFrom: "Plecare din {city}",
  twinShare: "Loc în cameră dublă",
  singleSupplement: "Supliment single + {amount}",

  barometerTitle: "Barometrul prețurilor",
  lowestPrice: "Cel mai mic preț:",

  book: "Rezervă",
  requestQuote: "Cere ofertă",
  guaranteedDeparture: "Plecare garantată",
  onRequest: "La cerere",
  requestAvailability: "Cere disponibilitate",
  waitlist: "Listă de așteptare",
  joinWaitlist: "Înscrie-mă pe listă",
  soldOut: "Sold out",
  chooseAnotherDate: "Alege altă dată",
  notRunning: "Nu se operează",
  unavailable: "Indisponibil",
  offerExpired: "Oferta nu mai este valabilă!",
  noRoute: "Contactează agenția pentru disponibilitate și preț.",

  days: { one: "{count} zi", few: "{count} zile", other: "{count} de zile" },
  nights: {
    one: "{count} noapte",
    few: "{count} nopți",
    other: "{count} de nopți",
  },
  departures: {
    one: "{count} plecare",
    few: "{count} plecări",
    other: "{count} de plecări",
  },
  /* The `other` form is the one a hand-written `seats === 1 ? … : …` never
   * had: above nineteen Romanian inserts *de*, so twenty seats left read
   * "Ultimele 20 locuri" — the tell of a page nobody proof-read. */
  placesLeft: {
    one: "Ultimul loc",
    few: "Ultimele {count} locuri",
    other: "Ultimele {count} de locuri",
  },
}

const DICTIONARIES: Record<string, Copy> = { en: EN, ro: RO }

/**
 * The language subtag, lowercased.
 *
 * A publication may be `en-GB`, `ro-RO` or `de-AT`; these labels do not differ
 * by region, so they are keyed by language alone. Matches the resolver in
 * `~/lib/messages`, because two conventions for the same question mean two
 * places to get it wrong.
 */
function language(locale: string | undefined): string {
  return typeof locale === "string" ? (locale.split("-")[0] ?? "en").toLowerCase() : "en"
}

/**
 * The copy for a locale, falling back to English rather than to nothing.
 *
 * An operator publishing in a language this theme has never been translated
 * into should get a working table with a few English labels, not a column
 * headed `columnPriceFrom`.
 */
export function copyFor(locale: string | undefined): Copy {
  return DICTIONARIES[language(locale)] ?? EN
}

/** Substitutes `{name}`-style placeholders. Unknown names are left alone. */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replaceAll(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}

/**
 * A counted phrase in the reader's language.
 *
 * The category comes from `Intl.PluralRules`, so Romanian's *few* and the
 * two-form languages are served by the same call. A language whose forms omit
 * the category the runtime picks falls back to `other`, the one form every
 * entry is required to carry.
 */
export function counted(
  locale: string | undefined,
  forms: PluralForms,
  count: number,
): string {
  let category: Intl.LDMLPluralRule = "other"
  try {
    category = new Intl.PluralRules(locale || "en").select(count)
  } catch {
    /* An operator can publish a locale ICU has never heard of; a table that
     * throws while counting nights is a worse answer than English plurals. */
    category = new Intl.PluralRules("en").select(count)
  }
  return fill(forms[category] ?? forms.other, { count })
}
