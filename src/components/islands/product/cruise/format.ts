/**
 * The words and figures a cabin grade is read in.
 *
 * Kept beside the cards rather than in `~/lib`, for the same reason the
 * departures module keeps its own: these are presentation decisions about one
 * surface, and a shared helper would invite a second surface to change them.
 *
 * Nothing here holds a language of its own. Every phrase takes the resolved
 * `Copy`, so a card's words cannot end up in a different language from the
 * panel around it — which is exactly what a module-level table of nouns
 * guarantees the first time a second language is published.
 */
import {
  AnchorIcon,
  BedIcon,
  CrownIcon,
  TerraceIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import { fill } from "~/lib/messages"
import type { CabinGrade } from "~/lib/product/adapter"

import { counted, type Copy } from "./copy"

/**
 * A money figure beside the headline — a supplement, a total, an addend.
 *
 * The same `de-DE` grouping with no decimals as `PriceBlock`, which does not
 * export its formatter, and deliberately not the reader's locale: a total
 * written `1,515.00 €` under a headline written `1.515 €` reads as two
 * different numbers, and this module prints both within a centimetre of each
 * other. Duplicated deliberately and only here.
 */
export function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * The category a grade's name reads as.
 *
 * `code` is inferred from the name by the adapter, which says outright that
 * nothing may depend on the inference being right. So it is allowed to decorate
 * and nothing else: a kicker above the name and an icon beside it. No price, no
 * capacity, no route and no ordering is decided from it anywhere in this module
 * — if the guess is wrong the reader loses a word, not a fare.
 */
export function gradeKicker(copy: Copy, code: CabinGrade["code"]): string {
  return copy.gradeKicker[code]
}

export const GRADE_ICON: Record<CabinGrade["code"], typeof BedIcon> = {
  interior: BedIcon,
  oceanview: ViewIcon,
  balcony: TerraceIcon,
  suite: CrownIcon,
  other: AnchorIcon,
}

/**
 * `Max. 2 people`, and `Max. 1 person` when that is what it is.
 *
 * Counted through `Intl.PluralRules` rather than by switching on `max === 1`,
 * because that only ever fixes the two-form languages: Romanian marks a third
 * form above nineteen, and a single-berth cabin advertised as "Max. 1 persoane"
 * is the typo a reader notices on the one line that decides whether their party
 * fits.
 */
export function occupancyPhrase(copy: Copy, max: number): string {
  return fill(copy.maxOccupancy, { people: counted(copy, copy.people, max) })
}

/**
 * The decks a grade sits on, or nothing when the publication named none.
 *
 * `deckNames` is free text with a default of `[]`, so an operator may publish
 * "8", "Deck 8" or nothing at all. The names are printed exactly as given
 * rather than reformatted into a house pattern: an operator who already writes
 * "Deck 8" gets their own words back, and one who writes "8" is not given a
 * deck number this theme invented a prefix for. Only the word in front of them
 * is the theme's, and it agrees with how many there are.
 */
export function decksPhrase(copy: Copy, names: readonly string[]): string | undefined {
  const named = names.map((name) => name.trim()).filter((name) => name.length > 0)
  if (named.length === 0) return undefined
  return counted(copy, copy.deck, named.length).replaceAll("{names}", named.join(" · "))
}

/**
 * `+75%` — the supplement as the operator quotes it.
 *
 * A percentage and not a figure, because the figure depends on the grade and
 * this phrase sits on the card whatever the party size. The euro amount is
 * computed only where it is actually charged: inside the total, at one adult.
 */
export function percentPhrase(value: number): string {
  return `+${Math.round(value)}%`
}
