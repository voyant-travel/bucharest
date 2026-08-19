/**
 * The destinations index's own words.
 *
 * The index carries far fewer theme-supplied strings than the destination page
 * — a jump bar's accessible name, the meta line under a card, the closing band
 * — but they are the strings that sit *between* operator sentences, which is
 * exactly where a language mismatch is most visible: "de la 1.290 €" under an
 * English blurb reads as a half-finished translation rather than as a price.
 *
 * Restated rather than imported from the destination template's `copy`, for the
 * same reason the two `format` modules are restated: the index ships as an
 * independent template and must not change wording because a sibling template
 * was reshaped.
 */
import { fill, type PluralForms } from "~/lib/messages"

export interface Copy {
  /**
   * The language these strings are actually in.
   *
   * Not the locale that was asked for. A page falling back to English words has
   * to count in English too — asking Romanian plural rules for a category no
   * English entry declares would quietly resolve to `other` and print the wrong
   * form the day someone adds one.
   */
  language: string

  /** Accessible name for the sticky region jump bar. */
  regionsNavLabel: string

  /** The card's trip count: "12 trips". */
  trips: PluralForms
  /** Precedes a price on the card's meta line: "from 1.290 €". */
  from: string

  /** The closing band, for a reader who could not choose. */
  undecidedHeading: string
  undecidedBody: string
  /** Eyebrow over the telephone number in that band. */
  callUsDirect: string
  requestQuote: string
}

export const EN: Copy = {
  language: "en",

  regionsNavLabel: "Destinations by region",

  trips: { one: "{count} trip", other: "{count} trips" },
  from: "from",

  undecidedHeading: "Not sure where to go?",
  undecidedBody:
    "Tell us when you can travel and how you like to travel. We will suggest the destination and build the trip from scratch.",
  callUsDirect: "Call us direct",
  requestQuote: "Request a quote",
}

export const RO: Copy = {
  language: "ro",

  regionsNavLabel: "Destinații pe regiuni",

  trips: {
    one: "{count} călătorie",
    few: "{count} călătorii",
    other: "{count} de călătorii",
  },
  from: "de la",

  undecidedHeading: "Nu te-ai hotărât încă?",
  undecidedBody:
    "Spune-ne când poți pleca și cum îți place să călătorești. Îți propunem destinația și construim drumul de la zero.",
  callUsDirect: "Sună-ne direct",
  requestQuote: "Cere ofertă",
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
 * An operator publishing in a language this template has never been translated
 * into gets a working index with a few English labels, not a grid of cards
 * reading `card.from`.
 */
export function copyFor(locale: string | undefined): Copy {
  return DICTIONARIES[language(locale)] ?? EN
}

/**
 * A counted phrase in the copy's own language.
 *
 * The category comes from `Intl.PluralRules`, which is what carries Romanian's
 * third form — the one inserting "de" before the noun once the last two digits
 * leave the 1-19 range — without a rule hand-written per language, and
 * English's plain two forms through the same call. A form the dictionary does
 * not declare falls back to `other`, the one every entry has.
 */
export function counted(copy: Copy, forms: PluralForms, count: number): string {
  let category: Intl.LDMLPluralRule = "other"
  try {
    category = new Intl.PluralRules(copy.language).select(count)
  } catch {
    category = new Intl.PluralRules("en").select(count)
  }
  return fill(forms[category] ?? forms.other, { count })
}
