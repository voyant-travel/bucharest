/**
 * The two values this index prints, formatted in one place.
 *
 * Both appear on every card in the grid, which is what makes them worth
 * centralising: a price rendered one way in one group and another way in the
 * next is not a subtle bug here, it is a visibly ragged column the reader scans
 * straight down.
 *
 * These mirror `~/components/destination/format`, and are restated rather than
 * imported for the same reason each product family carries its own copy: the
 * index ships as an independent template and must not break when the
 * destination page's helpers are reshaped around a different set of fields.
 *
 * The words belong to `copy`, never to this module. A count helper that closed
 * over one language's noun would keep printing it under every card long after
 * the headings above them had been translated, and a string buried in a
 * formatter is the one nobody finds when the page is proof-read.
 */
import { counted, type Copy } from "./copy"

/**
 * A price, with the currency the row declared.
 *
 * `de-DE` rather than `ro-RO` deliberately, and everywhere in this codebase:
 * Romanian and German group thousands identically, but `ro-RO` renders the euro
 * as the letters "EUR" mid-sentence, which reads as a spreadsheet export sitting
 * under a photograph.
 *
 * The currency is optional in the contract and arrives unvalidated, so a code
 * `Intl` refuses must degrade to a number beside the raw string rather than
 * throwing away the whole index over one card.
 */
export function money(amount: number, currency?: string | undefined): string {
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
 * A trip count, agreeing with the numeral that precedes it.
 *
 * The rule differs by language and cannot be written once here: Romanian
 * inserts "de" before the noun as soon as the last two digits leave the 1-19
 * range, while English only needs a singular and a plural. So each language
 * declares the forms it uses and `Intl.PluralRules` picks between them. Getting
 * this wrong is the kind of small error that makes an expensive page look
 * machine-filled, and it is visible on every card at once because the counts
 * across a grid rarely all land on the same side of twenty.
 *
 * Zero never reaches here: a card whose destination sells nothing hides the
 * count rather than advertising none.
 */
export function trips(count: number, copy: Copy): string {
  return counted(copy, copy.trips, count)
}
