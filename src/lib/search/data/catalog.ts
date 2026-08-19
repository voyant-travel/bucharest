/**
 * What a vertical's dataset has to declare so one engine can search all six.
 *
 * The engine is deliberately ignorant of travel. It knows how to intersect
 * selections, how to count a facet against its siblings and how to page — and
 * nothing about board basis, stopovers or cruise lines. Everything
 * product-shaped is declared here, next to the rows it describes, because a
 * facet and the attribute it reads are the same decision written twice if they
 * live apart.
 *
 * The value universe is declared rather than derived from the rows. Deriving it
 * would silently drop "Ultra all inclusive" the day no hotel offers it, which is
 * exactly the case where a traveller needs to see the empty option and
 * understand that their combination is what emptied it.
 *
 * The rows are demo content: a supplier feed the operator has not connected
 * yet. They are written in English because English is this theme's base
 * language, and the words *around* them — a board basis, a facet heading, the
 * word beside a score — are not written here at all. Those are the theme's own
 * vocabulary and they are looked up per locale, so a Romanian publication and
 * an English one describe the same room in their own words.
 */
import type { FacetType, ResultItem, SearchQuery, Vertical } from "../contract"
import type { Copy, Labelled } from "../copy"
import { counted, countedRange, fill } from "../copy"

export { counted, countedRange, fill, labelFor, labelOf } from "../copy"

export const CURRENCY = "EUR"

/**
 * Images reuse the photo ids already shipped in `theme.config.ts`, at the same
 * width the cards ask for, so a demo dataset never renders a broken tile.
 */
export function photo(id: string, alt: string): { src: string; alt: string } {
  return {
    src: `https://images.unsplash.com/${id}?w=960&q=80&auto=format&fit=crop`,
    alt,
  }
}

/**
 * Accented text compares badly with `===`. A traveller types "brasov" and means
 * an accented one; a supplier feed written properly carries the diacritics.
 * Folding both sides is the only comparison that serves both, and it is the
 * same fold the slugs are cut with, so a typed name and a declared value meet.
 */
export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0219\u015f]/g, "s")
    .replace(/[\u021b\u0163]/g, "t")
    .toLowerCase()
    .trim()
}

export function contains(haystack: string, needle: string): boolean {
  return fold(haystack).includes(fold(needle))
}

/**
 * Destination matching, with the substring trap closed.
 *
 * "Roma" is a substring of "Romania", so a plain `includes` sends someone
 * shopping for the Colosseum to a museum in Sibiu. When the typed text is
 * exactly a place the catalogue knows, only that place matches; anything else
 * is treated as a name still being typed and matches on substring.
 */
export function matchesPlace(needle: string, names: string[], universe: string[]): boolean {
  const wanted = fold(needle)
  if (wanted === "") return true
  if (universe.some((name) => fold(name) === wanted)) {
    return names.some((name) => fold(name) === wanted)
  }
  return names.some((name) => fold(name).includes(wanted))
}

export interface FacetValueSpec extends Labelled {
  /** Ships hang under their line; nothing nests deeper than that. */
  parent?: string
}

export interface FacetSpec<T> {
  key: string
  /**
   * The heading, in the reader's language. A function rather than a string
   * because the dataset is loaded once per process and read by every locale
   * the operator publishes in.
   */
  name: (copy: Copy) => string
  type: FacetType
  /** `array` facets: the full universe, zero-count values included. */
  values?: FacetValueSpec[]
  /** `array` facets: does this row belong under this value. */
  match?: (item: T, value: string) => boolean
  /** `range` facets: the number the slider bounds and filters on. */
  measure?: (item: T) => number
  /** `text` facets: what a typed fragment is matched against. */
  text?: (item: T) => string
  /**
   * Where a count answers the wrong question. Nobody books a flight because 38
   * itineraries have one stop; they book it because direct starts at 189 €.
   */
  hint?: (matching: T[], copy: Copy) => string | undefined
  expanded?: boolean
  searchable?: boolean
  truncateAt?: number
}

/**
 * A dataset plus the four things the engine cannot infer: what the form
 * narrows before faceting starts, how each sort orders, what a row costs, and
 * which card slots it fills.
 */
export interface Catalog<T> {
  vertical: Vertical
  items: T[]
  /**
   * The form's own constraints — destination, dates, occupancy, trip type.
   * They sit outside the facet system on purpose: a facet count is computed
   * against sibling facets, but never against the search the traveller ran.
   * Widening "Stops" must not start offering flights to another city.
   */
  base?: (item: T, query: SearchQuery) => boolean
  facets: FacetSpec<T>[]
  /** Keyed by the sort ids the vertical definition advertises. */
  compare: Record<string, (a: T, b: T) => number>
  price: (item: T) => number
  /**
   * The card's slots, filled. Takes the reader's words because most of what a
   * card says is the theme talking — the basis under a figure, what is
   * included, the ribbon — and only the proper nouns come from the row.
   */
  result: (item: T, copy: Copy, locale: string) => ResultItem
}

/**
 * The registry erases the row type, because the engine never holds a row long
 * enough to care what it is: every function that touches one arrives from the
 * same catalog that produced it. The `any` is the price of that erasure and it
 * stops at this line — each catalog is written against its own row type.
 */
export type AnyCatalog = Catalog<any>

/**
 * A price, written the way the rest of the theme writes prices.
 *
 * `de-DE` with `style: "currency"`, matching the product pages and the result
 * card exactly. It does not follow the reader's language on purpose: the theme
 * shows `1.290 €` in every language it publishes, and a fare that reads
 * "1,290 €" in the rail and "1.290 €" on the card it filters looks like two
 * different systems quoting two different numbers.
 */
export function money(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

/**
 * "2026-09-14" → "14 September 2026", in the reader's language.
 *
 * Through `Intl` rather than a month list, because a hand-kept list is one
 * language's months hard-coded into a component that six languages render, and
 * the second language to arrive gets English dates inside its own sentence.
 */
export function longDate(iso: string, locale: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return iso
  try {
    return new Intl.DateTimeFormat(locale || "en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsed)
  } catch {
    return iso
  }
}

/** "2026-09" → "September 2026", the label a month facet and a month set share. */
export function monthLabel(key: string, locale: string): string {
  const parsed = new Date(`${key}-01T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return key
  let text = key
  try {
    text = new Intl.DateTimeFormat(locale || "en", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsed)
  } catch {
    return key
  }
  /* Romanian and French lowercase their months mid-sentence; a facet value is
   * the start of one, so the first letter is raised where the language left it
   * low rather than by hard-coding either convention. */
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}

/** The `YYYY-MM` a date belongs to, which is all any month facet compares. */
export function monthOf(iso: string): string {
  return iso.slice(0, 7)
}

/**
 * Board basis, classification, review bands, cancellation and hotel facilities
 * are one vocabulary shared by packages and stays.
 *
 * The two verticals sell the same hotel from different angles — one with a
 * charter seat attached, one without — and a traveller who filtered "Ultra all
 * inclusive" on the package rail expects the same words on the hotel rail. Two
 * lists would drift within a season.
 *
 * The codes are the operator's — `hb` is half board in every travel system ever
 * built — and the words are the theme's, so each value declares a lookup rather
 * than a string.
 */
export const MEALS: FacetValueSpec[] = [
  { value: "ro", label: (copy) => copy.board.ro },
  { value: "bb", label: (copy) => copy.board.bb },
  { value: "hb", label: (copy) => copy.board.hb },
  { value: "fb", label: (copy) => copy.board.fb },
  { value: "ai", label: (copy) => copy.board.ai },
  { value: "uai", label: (copy) => copy.board.uai },
]

export const CLASSIFICATIONS: FacetValueSpec[] = [5, 4, 3, 2].map((stars) => ({
  value: String(stars),
  label: (copy, locale) => counted(locale, copy.plurals.stars, stars),
}))

/** Thresholds, not buckets — "8+" has to include a 9.4, or the filter lies. */
export const RATINGS: FacetValueSpec[] = [
  { value: "9", label: (copy) => `9+ ${copy.ratings.exceptional}` },
  { value: "8", label: (copy) => `8+ ${copy.ratings.veryGood}` },
  { value: "7", label: (copy) => `7+ ${copy.ratings.good}` },
  { value: "6", label: (copy) => `6+ ${copy.ratings.pleasant}` },
]

export const CANCELLATIONS: FacetValueSpec[] = [
  { value: "free", label: (copy) => copy.cancellation.free },
  { value: "fee", label: (copy) => copy.cancellation.fee },
  { value: "nonrefundable", label: (copy) => copy.cancellation.nonrefundable },
]

export const AMENITIES: FacetValueSpec[] = [
  { value: "pool", label: (copy) => copy.amenities.pool },
  { value: "beach", label: (copy) => copy.amenities.beach },
  { value: "spa", label: (copy) => copy.amenities.spa },
  { value: "aquapark", label: (copy) => copy.amenities.aquapark },
  { value: "kidsclub", label: (copy) => copy.amenities.kidsclub },
  { value: "gym", label: (copy) => copy.amenities.gym },
  { value: "alacarte", label: (copy) => copy.amenities.alacarte },
  { value: "wifi", label: (copy) => copy.amenities.wifi },
  { value: "parking", label: (copy) => copy.amenities.parking },
  { value: "airconditioning", label: (copy) => copy.amenities.airconditioning },
]

/** The word beside the score. Booking sites train the expectation; match it. */
export function ratingLabel(score: number, copy: Copy): string {
  if (score >= 9) return copy.ratings.exceptional
  if (score >= 8) return copy.ratings.veryGood
  if (score >= 7) return copy.ratings.good
  return copy.ratings.pleasant
}

/**
 * Duration bands are declared as `min-max` strings so the form option, the
 * facet value and the URL are one token. `14-` is "over 14", with no ceiling.
 */
export function inBand(nights: number, band: string): boolean {
  if (band === "any" || band === "") return true
  const [min, max] = band.split("-")
  const low = Number(min)
  if (Number.isNaN(low)) return true
  if (max === undefined) return nights === low
  if (max === "") return nights > low
  return nights >= low && nights <= Number(max)
}

/**
 * A band's label, in the reader's language.
 *
 * The token the band travels as is the only input: `"7"` is seven nights,
 * `"10-14"` is a range, `"14-"` is everything above. Written out through the
 * counted phrases so the languages that change the noun above nineteen get the
 * form they need, rather than banding being spelled into a fixed label list.
 */
export function bandLabel(
  band: string,
  unit: "nights" | "days" | "hours" | "minutes",
  copy: Copy,
  locale: string,
): string {
  const forms = copy.plurals[unit]
  const [min, max] = band.split("-")
  const low = Number(min)
  if (max === undefined) return counted(locale, forms, low)
  if (max === "") return fill(copy.bands.over, { value: counted(locale, forms, low) })
  const high = Number(max)
  if (low === 0) return fill(copy.bands.upTo, { value: counted(locale, forms, high) })
  return countedRange(locale, forms, low, high)
}
