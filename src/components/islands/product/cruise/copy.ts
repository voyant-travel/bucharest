import type { PluralForms } from "~/lib/messages"

/**
 * Every word the cabin-grade module supplies itself.
 *
 * The operator's own text — a grade's name, a deck's name — arrives already
 * translated, because the platform resolves a publication per locale. The
 * scaffolding does not: the state badges, the calls to action, the sentence
 * explaining what a headline fare is quoted on, the labels under the total.
 * Those are the theme's, so the theme translates them, and they live beside the
 * cards rather than in `~/lib/messages` for the same reason `format.ts` keeps
 * its own formatter — they are decisions about one surface.
 *
 * English is the source of truth and everything else is a translation of it. A
 * language this file does not carry falls back to English rather than rendering
 * a key: an operator publishing in a language nobody has translated this theme
 * into should get a working row of cards with English labels, not a page
 * reading `estimatedTotal`.
 */
export interface Copy {
  /**
   * The tag `Intl` is handed for numbers.
   *
   * The reader's own tag when this file carries their language, and the
   * dictionary's own tag when it does not — a page falling back to English
   * labels must not then print German words beside them, because half a page in
   * each language reads as a bug rather than as a fallback.
   */
  locale: string
  /**
   * The language the forms below are written in.
   *
   * Plural categories are selected against this and not against `locale`: a
   * German reader gets the English dictionary, and asking `Intl.PluralRules`
   * for a German category would hand back a form these English strings never
   * declared.
   */
  language: string

  /* The row as a whole */
  noGrades: string
  /** `{phone}` */
  call: string
  chooseGrade: string
  soloNotice: string
  chooseToSeeTotal: string
  choiceKept: string

  /* Occupancy */
  occupancyHeading: string
  fewerGuests: string
  moreGuests: string

  /* One card */
  /** `{people}` — already counted, so the noun agrees with the number. */
  maxOccupancy: string
  /** `{names}` for one deck, and `{names}` for several. */
  deck: PluralForms
  /** The basis the headline fare is quoted on. The single most misread line. */
  fareBasis: string
  /** `{percent}` */
  singleSupplement: string
  soloApplies: string
  estimatedTotal: string
  totalUnavailable: string
  /** `{amount}` — the charges the headline excludes, as `PriceBlock` prints them. */
  portTaxExtra: string
  serviceChargeExtra: string

  /* The addends under the total */
  fareTerm: string
  singleSupplementTerm: string
  portTaxTerm: string
  /** `{nights}` and `{amount}` — the multiplication, not just its result. */
  serviceChargeTerm: string

  /* Kickers above a grade's name */
  gradeKicker: Record<"interior" | "oceanview" | "balcony" | "suite" | "other", string>

  /* Availability states */
  guaranteed: string
  fewLeft: string
  onRequest: string
  waitlist: string
  soldOut: string
  notOffered: string
  expired: string
  notOfferedReason: string
  expiredReason: string

  /* Calls to action */
  book: string
  checkAvailability: string
  joinWaitlist: string
  chooseAnother: string
  unavailable: string
  requestQuote: string
  noRoute: string

  /* Counted phrases */
  people: PluralForms
}

export const EN: Copy = {
  locale: "en",
  language: "en",

  noGrades: "Cabin categories for this sailing are not published yet.",
  call: "Call {phone}",
  chooseGrade: "Choose a cabin category",
  soloNotice:
    "Fares shown are per person, two sharing. Travelling alone adds the single supplement, which is included in the total on the card you choose.",
  chooseToSeeTotal: "Choose a cabin category to see the estimated total per person.",
  choiceKept:
    "Your chosen category stays selected; the others stay visible for comparison.",

  occupancyHeading: "Guests in the cabin",
  fewerGuests: "Fewer guests",
  moreGuests: "Add a guest",

  maxOccupancy: "Max. {people}",
  deck: { one: "Deck: {names}", other: "Decks: {names}" },
  fareBasis: "per person, two sharing",
  singleSupplement: "Single supplement {percent}",
  soloApplies: "applies when travelling alone",
  estimatedTotal: "Estimated total per person",
  totalUnavailable:
    "The total cannot be worked out here. The charges above are added to the fare.",
  portTaxExtra: "{amount} port taxes",
  serviceChargeExtra: "{amount} per person, per day service charge",

  fareTerm: "fare",
  singleSupplementTerm: "single supplement",
  portTaxTerm: "port taxes",
  serviceChargeTerm: "service charge ({nights} × {amount})",

  gradeKicker: {
    interior: "Interior",
    oceanview: "Ocean view",
    balcony: "Balcony",
    suite: "Suite",
    other: "Cabin",
  },

  guaranteed: "Guaranteed departure",
  fewLeft: "Only a few left",
  onRequest: "On request",
  waitlist: "Waitlist",
  soldOut: "Sold out",
  notOffered: "Not offered",
  expired: "Expired",
  notOfferedReason: "Not available on this sailing",
  expiredReason: "This fare is no longer valid.",

  book: "Book",
  checkAvailability: "Check availability",
  joinWaitlist: "Join the waitlist",
  chooseAnother: "Choose another cabin",
  unavailable: "Unavailable",
  requestQuote: "Request a quote",
  noRoute: "Contact the agency for availability and pricing.",

  people: { one: "{count} person", other: "{count} people" },
}

export const RO: Copy = {
  locale: "ro-RO",
  language: "ro",

  noGrades: "Categoriile de cabină pentru această plecare nu sunt încă publicate.",
  call: "Sună la {phone}",
  chooseGrade: "Alege categoria de cabină",
  soloNotice:
    "Tarifele afișate sunt pe loc în cabină dublă. Pentru o singură persoană se adaugă suplimentul single, inclus în totalul de pe cardul ales.",
  chooseToSeeTotal: "Alege o categorie de cabină ca să vezi totalul estimativ pe persoană.",
  choiceKept:
    "Categoria aleasă rămâne selectată; celelalte rămân vizibile pentru comparație.",

  occupancyHeading: "Persoane în cabină",
  fewerGuests: "Scade numărul de persoane",
  moreGuests: "Adaugă o persoană",

  maxOccupancy: "Max. {people}",
  deck: { one: "Punte: {names}", few: "Punți: {names}", other: "Punți: {names}" },
  fareBasis: "loc în cabină dublă",
  singleSupplement: "Supliment single {percent}",
  soloApplies: "se aplică la 1 persoană",
  estimatedTotal: "Total estimativ pe persoană",
  totalUnavailable: "Totalul nu poate fi calculat aici. Taxele de mai sus se adaugă la tarif.",
  portTaxExtra: "{amount} taxă portuară",
  serviceChargeExtra: "{amount}/pers./zi taxă de serviciu",

  fareTerm: "tarif",
  singleSupplementTerm: "supliment single",
  portTaxTerm: "taxă portuară",
  serviceChargeTerm: "taxă de serviciu ({nights} × {amount})",

  gradeKicker: {
    interior: "Interior",
    oceanview: "Cu fereastră",
    balcony: "Cu balcon",
    suite: "Suită",
    other: "Cabină",
  },

  guaranteed: "Plecare garantată",
  fewLeft: "Ultimele locuri",
  onRequest: "La cerere",
  waitlist: "Listă de așteptare",
  soldOut: "Epuizat",
  notOffered: "Nu se operează",
  expired: "Expirat",
  notOfferedReason: "Indisponibil pentru această plecare",
  expiredReason: "Oferta nu mai este valabilă.",

  book: "Rezervă",
  checkAvailability: "Cere disponibilitate",
  joinWaitlist: "Înscrie-mă pe listă",
  chooseAnother: "Alege altă cabină",
  unavailable: "Indisponibil",
  requestQuote: "Cere ofertă",
  noRoute: "Contactează agenția pentru disponibilitate și preț.",

  people: {
    one: "{count} persoană",
    few: "{count} persoane",
    other: "{count} de persoane",
  },
}

const DICTIONARIES: Record<string, Copy> = { en: EN, ro: RO }

/**
 * The language subtag, lowercased.
 *
 * A publication may be `en-GB`, `ro-RO` or `de-AT`; these labels do not differ
 * by region, so they are keyed by language alone. Matches the resolver in
 * `src/lib/messages.ts` — two conventions would mean two places to forget a
 * string.
 */
function language(locale: string | undefined): string {
  return typeof locale === "string" ? (locale.split("-")[0] ?? "en").toLowerCase() : "en"
}

export function copyFor(locale: string | undefined): Copy {
  const dictionary = DICTIONARIES[language(locale)]
  if (dictionary === undefined) return EN
  /* The region is carried through only for a language this file translates, so
   * a fallback page cannot end up with English words and a foreign number
   * format sitting in the same sentence. */
  return locale ? { ...dictionary, locale } : dictionary
}

/**
 * A counted phrase in the reader's language.
 *
 * The category comes from `Intl.PluralRules`, so Romanian's *few* — the reason
 * "19 locuri" is right and "20 locuri" is not, the twentieth taking a "de" the
 * nineteenth does not — is handled by the same call that handles English's two
 * forms. Naive `n === 1` switching only ever fixes
 * English, and "Max. 1 persoane" is the typo a reader notices on the one line
 * that decides whether their party fits.
 */
export function counted(copy: Copy, forms: PluralForms, count: number): string {
  let category: Intl.LDMLPluralRule = "other"
  try {
    category = new Intl.PluralRules(copy.language).select(count)
  } catch {
    category = new Intl.PluralRules("en").select(count)
  }
  return (forms[category] ?? forms.other).replaceAll("{count}", String(count))
}
