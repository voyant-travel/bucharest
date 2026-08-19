/**
 * The three values this page prints, formatted in one place.
 *
 * A trip card carries a duration and a from-price on every reference site in
 * this market, which means both strings appear on every card in a rail and any
 * inconsistency between them is visible as a ragged column rather than as a
 * single wrong label.
 *
 * The words belong to `copy`, never to this module. A helper that closed over
 * one language's word for a night would keep printing it on every badge in the
 * rail long after the headings around them had been translated, and a string
 * hidden inside a formatter is the one nobody finds when a page is proof-read.
 */
import { counted, type Copy } from "./copy"

/**
 * A price, with the currency the row declared.
 *
 * `de-DE` rather than `ro-RO` deliberately, and for the same reason the
 * booking panel uses it: Romanian and German group thousands identically, but
 * `ro-RO` renders the euro as the letters "EUR" mid-sentence, which reads as a
 * spreadsheet export next to a photograph.
 *
 * The currency is optional in the contract and arrives unvalidated, so a code
 * `Intl` refuses must degrade to a number beside the raw string rather than
 * throwing the whole page away over one card.
 */
export function money(amount: number, currency?: string): string {
  const plain = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(amount)
  if (!currency) return plain
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${plain} ${currency}`
  }
}

/**
 * A night count, agreeing with the numeral that precedes it.
 *
 * The agreement rule is not the same in every language this theme renders —
 * Romanian inserts "de" before the noun once the last two digits leave the 1-19
 * range, English simply pluralises — so the forms come from the copy and the
 * choice between them from `Intl.PluralRules`, rather than from a condition
 * written here that would only ever be right for the language it was written
 * in. A badge that gets this wrong is the kind of small error that makes an
 * expensive page look automated.
 */
export function nights(count: number, copy: Copy): string {
  return counted(copy, copy.nights, count)
}

/**
 * An excerpt short enough to sit on a card without pushing the price line out
 * of alignment with its neighbours in the rail.
 *
 * Cut at a word boundary, but only when one falls late enough to be worth
 * having; a hard cut is better than losing half the sentence to a stray space
 * near the start.
 */
export function excerpt(text: string, max = 60): string {
  const clean = text.trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const space = cut.lastIndexOf(" ")
  const kept = space > max * 0.6 ? cut.slice(0, space) : cut
  return `${kept.replace(/[\s.,;:–—-]+$/, "")}…`
}
