/**
 * Every word the rate table is allowed to put in front of a traveller.
 *
 * `rate-language.ts` already made the case for keeping these out of the markup:
 * each one is a commitment the operator has to honour at the desk, and copy
 * that lives inside a layout gets tweaked per breakpoint until the phone
 * promises free cancellation the desktop did not. This file takes the same
 * strings one step further and takes the *language* out of them too — a table
 * that hard-codes Romanian can only ever be published by a Romanian operator,
 * and worse, will print "Nerambursabil" underneath an English heading the
 * platform translated correctly.
 *
 * English is the source of truth, phrased as an English hotel page phrases it
 * rather than translated word for word: board bases are "Half board", not "Half
 * pension".
 */

/**
 * Counted phrases, keyed by CLDR plural category.
 *
 * Same shape as `~/lib/messages` uses, restated rather than imported: this
 * module ships inside a client island, and reaching into that file for a type
 * and a five-line helper risks pulling the theme-wide dictionary of every
 * language into the bundle a phone downloads for one table.
 *
 * Romanian counts the noun as well as the number: one form for a single night,
 * one for a few, and one above nineteen that inserts an extra particle before
 * the noun. Getting that wrong is the tell of a machine-translated page.
 * English needs two forms and no particle at all, which is exactly why the
 * rule has to live in the dictionary rather than in the table.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string
}

/** The board bases a rate can be sold on, said out loud instead of in code. */
export type BoardWords = Record<string, string>

export interface Copy {
  // Board bases, keyed by the trade's own codes
  board: BoardWords

  // Table chrome
  pricesFor: string
  tableCaption: string
  columnRoom: string
  columnRate: string
  columnTotal: string
  columnChoice: string

  // Rate terms
  payAtProperty: string
  payOnline: string
  nonRefundable: string
  cancellationToConfirm: string
  freeCancellationUntil: string

  // Price
  priceUnavailable: string
  perNight: string
  roomsTimesPrice: string

  // States and the actions they allow
  choose: string
  chosen: string
  chosenAction: string
  instantConfirmation: string
  requestAvailability: string
  onRequestNote: string
  joinWaitlist: string
  waitlistNote: string
  soldOutNote: string
  notOfferedNote: string
  expiredNote: string

  // Empty states and the ways out of the module
  noRatesForRoom: string
  yourChoice: string
  orCall: string
  book: string
  requestQuote: string
  requestQuoteAt: string
  noRoute: string
  noAvailability: string
  noAvailabilityHelp: string

  // Counted phrases
  rooms: PluralForms
  adults: PluralForms
  nights: PluralForms
  guests: PluralForms
  maxGuests: PluralForms
  roomsLeft: PluralForms
}

export const EN: Copy = {
  board: {
    RO: "Room only",
    BB: "Breakfast included",
    HB: "Half board",
    FB: "Full board",
    AI: "All inclusive",
    UAI: "Ultra all inclusive",
  },

  pricesFor: "Prices for {stay}",
  tableCaption: "Rooms and rates available for {stay}",
  columnRoom: "Room",
  columnRate: "Rate",
  columnTotal: "Price for the whole stay",
  columnChoice: "Choice",

  payAtProperty: "Pay at the property",
  payOnline: "Pay online when you book",
  nonRefundable: "Non-refundable · cannot be cancelled or changed",
  cancellationToConfirm: "Cancellation terms are confirmed before payment",
  freeCancellationUntil: "Free cancellation until {date}",

  priceUnavailable: "Price unavailable",
  perNight: "{amount}/night",
  roomsTimesPrice: "{rooms} × {amount} / stay",

  choose: "Choose",
  chosen: "Chosen",
  chosenAction: "{action}: {rate}",
  instantConfirmation: "Instant confirmation",
  requestAvailability: "Request availability",
  onRequestNote: "On request · we confirm availability before any payment",
  joinWaitlist: "Join the waiting list",
  waitlistNote: "Waiting list · we will let you know if a room frees up",
  soldOutNote: "Sold out for the selected dates",
  notOfferedNote: "Not offered on the selected dates",
  expiredNote: "Rate expired · search again for a current price",

  noRatesForRoom: "We have no rates for this room on the selected dates.",
  yourChoice: "Your choice",
  orCall: "or call {phone}",
  book: "Book",
  requestQuote: "Request a quote",
  requestQuoteAt: "Request a quote on {phone}",
  noRoute: "Contact the agency for availability and pricing.",
  noAvailability: "We have no availability for the selected dates.",
  noAvailabilityHelp:
    "Change the dates or ask us for a quote — we will look for an alternative in the same period.",

  rooms: { one: "{count} room", other: "{count} rooms" },
  adults: { one: "{count} adult", other: "{count} adults" },
  nights: { one: "{count} night", other: "{count} nights" },
  guests: { one: "{count} guest", other: "{count} guests" },
  maxGuests: { one: "Maximum {count} guest", other: "Maximum {count} guests" },
  roomsLeft: { one: "Last room at this rate", other: "{count} rooms left" },
}

export const RO: Copy = {
  board: {
    RO: "Fără masă",
    BB: "Mic dejun",
    HB: "Demipensiune",
    FB: "Pensiune completă",
    AI: "All Inclusive",
    UAI: "Ultra All Inclusive",
  },

  pricesFor: "Prețuri pentru {stay}",
  tableCaption: "Camere și tarife disponibile pentru {stay}",
  columnRoom: "Cameră",
  columnRate: "Tarif",
  columnTotal: "Preț pentru tot sejurul",
  columnChoice: "Alegere",

  payAtProperty: "Plătești la cazare",
  payOnline: "Plata online, la rezervare",
  nonRefundable: "Nerambursabil · nu se poate anula sau modifica",
  cancellationToConfirm: "Condițiile de anulare se confirmă înainte de plată",
  freeCancellationUntil: "Anulare gratuită până la {date}",

  priceUnavailable: "Preț indisponibil",
  perNight: "{amount}/noapte",
  roomsTimesPrice: "{rooms} × {amount} / sejur",

  choose: "Alege",
  chosen: "Ales",
  chosenAction: "{action}: {rate}",
  instantConfirmation: "Confirmare imediată",
  requestAvailability: "Cere disponibilitate",
  onRequestNote: "La cerere · confirmăm disponibilitatea înainte de orice plată",
  joinWaitlist: "Intră pe listă",
  waitlistNote: "Listă de așteptare · te anunțăm dacă se eliberează o cameră",
  soldOutNote: "Epuizat pentru datele selectate",
  notOfferedNote: "Nu se oferă la datele selectate",
  expiredNote: "Tarif expirat · reia căutarea pentru un preț valabil",

  noRatesForRoom: "Nu avem tarife pentru această cameră la datele selectate.",
  yourChoice: "Alegerea ta",
  orCall: "sau sună la {phone}",
  book: "Rezervă",
  requestQuote: "Cere ofertă",
  requestQuoteAt: "Cere ofertă la {phone}",
  noRoute: "Contactează agenția pentru disponibilitate și preț.",
  noAvailability: "Nu avem disponibilitate pentru datele selectate.",
  noAvailabilityHelp:
    "Schimbă datele sau cere-ne o ofertă — căutăm o alternativă pentru aceeași perioadă.",

  rooms: {
    one: "{count} cameră",
    few: "{count} camere",
    other: "{count} de camere",
  },
  adults: {
    one: "{count} adult",
    few: "{count} adulți",
    other: "{count} de adulți",
  },
  nights: {
    one: "{count} noapte",
    few: "{count} nopți",
    other: "{count} de nopți",
  },
  guests: {
    one: "{count} persoană",
    few: "{count} persoane",
    other: "{count} de persoane",
  },
  maxGuests: {
    one: "Maxim {count} persoană",
    few: "Maxim {count} persoane",
    other: "Maxim {count} de persoane",
  },
  roomsLeft: {
    one: "Ultima cameră disponibilă la acest tarif",
    few: "{count} camere rămase",
    other: "{count} de camere rămase",
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
 * into should get a working rate table with a few English labels, not a
 * cancellation line reading `freeCancellationUntil`.
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
 * The category comes from `Intl.PluralRules`, so Romanian's *few* — and its
 * *de* above nineteen — are served by the same call as English's two forms. A
 * language whose forms omit the category the runtime picks falls back to
 * `other`, the one form every entry is required to carry.
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
