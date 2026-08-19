/**
 * The booking panel's own words.
 *
 * The panel is the last thing a reader looks at before they leave this site for
 * the booking engine, which makes it the worst place on a product page to be
 * speaking the wrong language: a Romanian booking button under an English
 * itinerary is the point at which a reader stops believing the two systems are
 * the same company.
 *
 * The strings live beside the panel rather than in `~/lib/messages` because
 * they belong to one component and are read by nothing else; the theme-wide
 * dictionary carries the labels of the *managed* booking journey, which is a
 * different surface with a different vocabulary.
 */

export interface Copy {
  /** Eyebrow at the top of the panel. */
  eyebrow: string
  /** Precedes the price: "from 1.290 €". */
  from: string
  /**
   * What a price is charged against, keyed by the adapter's `basis` value.
   *
   * Keyed rather than flattened into named fields so an unknown basis — the
   * adapters are versioned separately from this theme — falls out as no suffix
   * at all instead of as a missing-key placeholder beside a real number.
   */
  basis: Record<string, string>

  /** Said when the reader is being handed to the booking engine. */
  bookIntro: string
  /** Said when the operator confirms this product by hand. */
  enquireIntro: string

  book: string
  requestQuote: string
  /** Neither route is configured and there is no telephone either. */
  contactAgency: string
  /** Precedes the telephone number offered beside a booking link. */
  preferPhone: string
  /** The standing note under the panel: nothing here is a quotation. */
  priceNote: string
}

export const EN: Copy = {
  eyebrow: "Booking",
  from: "from",
  basis: {
    per_night: "/ night",
    per_stay: "/ stay",
    per_person: "/ person",
    per_party: "total",
  },

  bookIntro:
    "You continue in the Voyant booking system, where you choose your dates and pay securely.",
  enquireIntro: "We will reply with availability and the exact price for your dates.",

  book: "Book",
  requestQuote: "Request a quote",
  contactAgency: "Contact the agency for availability and prices.",
  preferPhone: "Prefer to call?",
  priceNote: "Prices and availability are confirmed at the booking step.",
}

export const RO: Copy = {
  eyebrow: "Rezervare",
  from: "de la",
  basis: {
    per_night: "/ noapte",
    per_stay: "/ sejur",
    per_person: "/ persoană",
    per_party: "total",
  },

  bookIntro:
    "Continui în sistemul de rezervări Voyant, unde alegi data și plătești securizat.",
  enquireIntro: "Îți răspundem cu disponibilitatea și prețul exact pentru datele tale.",

  book: "Rezervă",
  requestQuote: "Cere ofertă",
  contactAgency: "Contactează agenția pentru disponibilitate și preț.",
  preferPhone: "Preferi prin telefon?",
  priceNote: "Prețurile și disponibilitatea se confirmă în pasul de rezervare.",
}

const DICTIONARIES: Record<string, Copy> = { en: EN, ro: RO }

/**
 * The language subtag, lowercased.
 *
 * A publication may be `en-GB`, `ro-RO` or `de-AT`; these labels do not differ
 * by region, so they are keyed by language alone. Mirrors the resolver in
 * `~/lib/messages` so the two never disagree about what locale a page is in.
 */
function language(locale: string | undefined): string {
  return typeof locale === "string" ? (locale.split("-")[0] ?? "en").toLowerCase() : "en"
}

/**
 * The words for a locale, falling back to English rather than to keys.
 *
 * An operator publishing in a language this panel has never been translated
 * into gets a working booking hand-off with English labels. A button reading
 * `booking.book` is a button nobody presses.
 */
export function copyFor(locale: string | undefined): Copy {
  return DICTIONARIES[language(locale)] ?? EN
}
