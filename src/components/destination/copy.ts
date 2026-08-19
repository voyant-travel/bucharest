/**
 * The destination template's own words.
 *
 * Everything an operator writes arrives already translated — the platform
 * resolves a publication per locale — but the labels this template supplies
 * itself do not: the section headings, the enquiry button, the "from" in front
 * of a price, the accessible name on the sticky nav. Those ship with the theme,
 * so the theme has to carry them in every language it claims to render.
 *
 * English is the base. A page that mixes a Romanian heading over English
 * operator copy is the failure this file exists to stop, and it is the failure
 * that arrives by default when literals sit in markup: the moment a publication
 * is not Romanian, half the page changes language and half does not.
 *
 * This is a sibling of `~/lib/messages` rather than an entry in it. The
 * destination templates ship as an independent family, and keeping their words
 * beside their markup means a template reshaped around different fields does
 * not have to reach into the theme-wide dictionary to take its strings with it.
 */
import { fill, type PluralForms } from "~/lib/messages"

export interface Copy {
  /**
   * The language these strings are actually in.
   *
   * Not the locale that was asked for. When an operator publishes in a language
   * this file does not carry, the reader gets English words — and the plural
   * rules that pick between them have to be English too. Selecting Romanian
   * categories over English forms would ask for a *few* form no English entry
   * declares, which silently drops back to *other* and looks arbitrary the day
   * someone adds one.
   */
  language: string

  /** Accessible name for the sticky in-page nav. */
  navLabel: string
  /** The page's only conversion, repeated about once every screen and a half. */
  requestQuote: string
  /** The link to the full listing behind a curated rail or a stays panel. */
  viewAll: string
  /** Precedes a telephone number in running prose. */
  callUsAt: string
  /** Eyebrow over a telephone number given its own block. */
  callUsDirect: string

  /**
   * The sticky nav's labels, keyed by section id.
   *
   * The ids are URL fragments and are owned by `destinationSections`, so they
   * are the stable thing to key on: a translated label must never move the
   * anchor it points at, or every link anyone has shared into a section breaks
   * the first time a page is published in another language.
   */
  sectionLabels: Record<string, string>

  introHeading: string

  tripsHeading: string
  /** Precedes a price: "from 1.290 €". */
  from: string
  /** Follows a price: "from 1.290 € / person". */
  perPerson: string
  /** The duration badge on a trip card. */
  nights: PluralForms
  /** The rail's closing card, for a reader none of the trips suited. */
  tailoredEyebrow: string
  tailoredHeading: string
  tailoredBody: string

  experiencesHeading: string
  /** The contact banner interrupting the experience grid. */
  experiencesPrompt: string

  storiesHeading: string

  whereHeading: string
  whereToGo: string
  whereToStay: string

  expertsHeading: string

  faqHeading: string

  siblingsHeading: string
}

export const EN: Copy = {
  language: "en",

  navLabel: "Page sections",
  requestQuote: "Request a quote",
  viewAll: "View all",
  callUsAt: "Call us on",
  callUsDirect: "Call us direct",

  sectionLabels: {
    overview: "Overview",
    trips: "Trips",
    experiences: "Experiences",
    see: "What to see",
    where: "Where to go and stay",
    team: "Our team",
    faqs: "FAQs",
  },

  introHeading: "Overview",

  tripsHeading: "Trips",
  from: "from",
  perPerson: "/ person",
  nights: { one: "{count} night", other: "{count} nights" },
  tailoredEyebrow: "Made for you",
  tailoredHeading: "Build your own trip",
  tailoredBody:
    "Tell us when you can travel and how long you have. We will suggest the rest.",

  experiencesHeading: "Experiences",
  experiencesPrompt: "Looking for something that is not on the list?",

  storiesHeading: "What to see and do",

  whereHeading: "Where to go and where to stay",
  whereToGo: "Where to go",
  whereToStay: "Where to stay",

  expertsHeading: "The people who build your trip",

  faqHeading: "Frequently asked questions",

  siblingsHeading: "Other destinations",
}

export const RO: Copy = {
  language: "ro",

  navLabel: "Secțiunile paginii",
  requestQuote: "Cere ofertă",
  viewAll: "Vezi toate",
  callUsAt: "Sună-ne la",
  callUsDirect: "Sună-ne direct",

  sectionLabels: {
    overview: "Prezentare",
    trips: "Călătorii",
    experiences: "Experiențe",
    see: "Ce vezi",
    where: "Unde",
    team: "Echipa",
    faqs: "Întrebări",
  },

  introHeading: "Prezentare",

  tripsHeading: "Călătorii",
  from: "de la",
  perPerson: "/ persoană",
  nights: { one: "{count} noapte", few: "{count} nopți", other: "{count} de nopți" },
  tailoredEyebrow: "Pe măsura ta",
  tailoredHeading: "Construim călătoria de la zero",
  tailoredBody: "Spune-ne când poți pleca și cât timp ai. Restul îl propunem noi.",

  experiencesHeading: "Experiențe",
  experiencesPrompt: "Vrei o experiență care nu e pe listă?",

  storiesHeading: "Ce vezi și ce faci",

  whereHeading: "Unde să mergi și unde să stai",
  whereToGo: "Unde să mergi",
  whereToStay: "Unde să stai",

  expertsHeading: "Oamenii care îți construiesc călătoria",

  faqHeading: "Întrebări frecvente",

  siblingsHeading: "Alte destinații",
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
 * into gets a working page with a few English labels. Rendering `nav.label`
 * instead would tell every reader the site is broken.
 */
export function copyFor(locale: string | undefined): Copy {
  return DICTIONARIES[language(locale)] ?? EN
}

/**
 * A counted phrase in the copy's own language.
 *
 * The category comes from `Intl.PluralRules`, so Romanian's third form — the
 * one that inserts "de" before the noun once the last two digits leave the 1-19
 * range — and the two-form languages are handled by one call rather than by a
 * rule hand-written per language. A form the dictionary does not declare falls
 * back to `other`, the one form every entry must carry.
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
