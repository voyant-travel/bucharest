import { fill } from "~/lib/messages"
import type { CabinGrade, Money } from "~/lib/product/adapter"

import type { Copy } from "./copy"
import { money } from "./format"

/** One addend of the total, printed beside the word for what it is. */
export interface TotalTerm {
  amount: number
  label: string
}

export interface GradeTotal {
  terms: TotalTerm[]
  total: number
}

export interface TotalInputs {
  /** The words the addends are labelled with, resolved by the island above. */
  copy: Copy
  grade: CabinGrade
  /** The currency the card is priced in; every addend must agree with it. */
  currency: string
  nights: number
  adults: number
  portTax?: Money | undefined
  serviceChargePerDay?: Money | undefined
}

/**
 * What one person on this grade is actually charged.
 *
 * The headline fare is not it, and on a cruise it is not close: the port tax
 * and the daily service charge are unavoidable, are billed separately by every
 * line, and on a seven-night sailing add most of a fifth to the figure the page
 * advertises. A page that shows only the "from" number is the standard trap —
 * the reader compares it against another operator's total and picks wrongly.
 *
 * Returns `undefined` rather than a partial sum whenever an addend cannot be
 * honestly computed. A total missing a charge is worse than no total: it looks
 * like the answer, so nobody checks it.
 */
export function totalFor({
  copy,
  grade,
  currency,
  nights,
  adults,
  portTax,
  serviceChargePerDay,
}: TotalInputs): GradeTotal | undefined {
  if (!Number.isFinite(grade.price.amount)) return undefined
  /*
   * A fare quoted in another currency cannot be added to charges quoted in this
   * one, and converting it here would invent a rate this theme has no business
   * holding. Refusing is the only honest outcome.
   */
  if (grade.price.currency !== currency) return undefined

  const terms: TotalTerm[] = [{ amount: Math.round(grade.price.amount), label: copy.fareTerm }]

  /*
   * The supplement enters at one adult and only there. The headline is a
   * double-occupancy fare, so adding it to a couple's total would overcharge
   * them on paper, and leaving it out of a solo total would understate their
   * bill by most of a fare — the larger error by far, and the one the headline
   * already invites by looking like a per-person price that anyone can pay.
   */
  const supplementPct = grade.singleSupplementPct
  if (adults === 1 && supplementPct !== undefined && Number.isFinite(supplementPct)) {
    terms.push({
      amount: Math.round((grade.price.amount * supplementPct) / 100),
      label: copy.singleSupplementTerm,
    })
  }

  if (portTax !== undefined) {
    if (portTax.currency !== currency || !Number.isFinite(portTax.amount)) return undefined
    terms.push({ amount: Math.round(portTax.amount), label: copy.portTaxTerm })
  }

  if (serviceChargePerDay !== undefined) {
    if (serviceChargePerDay.currency !== currency) return undefined
    if (!Number.isFinite(serviceChargePerDay.amount)) return undefined
    /*
     * No length, no total. The service charge is the one addend that depends on
     * a number outside the price — quietly dropping it because `nights` came
     * through as 0 would understate the bill by a hundred euros and leave the
     * page looking certain about it.
     */
    if (!Number.isFinite(nights) || nights <= 0) return undefined
    terms.push({
      amount: Math.round(serviceChargePerDay.amount * nights),
      /* The multiplication is shown, not just its result: `84 €` on its own is
       * a number the reader has to take on trust, and this is the exact line
       * they came to check. */
      label: fill(copy.serviceChargeTerm, {
        nights,
        amount: money(serviceChargePerDay.amount, currency),
      }),
    })
  }

  /*
   * Summed from the rounded addends, not rounded from the exact sum. The line
   * under the total prints these very figures, and a total one euro away from
   * the numbers beside it is arithmetic a reader checks once and then stops
   * trusting the page over.
   */
  return { terms, total: terms.reduce((sum, term) => sum + term.amount, 0) }
}
