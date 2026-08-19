import { counted, type Copy } from "./copy"

/**
 * Who is going, and which of them the operator charges for.
 *
 * The party is modelled by age band rather than as a single headcount because
 * the two answers differ: a family of two adults and a baby is three people to
 * the guide and two fares to the till. A picker that asks "how many?" quotes
 * the wrong total to every family that uses it, and the discrepancy surfaces at
 * checkout, which is the worst possible place to discover it.
 */

export type ParticipantId = "adult" | "child" | "infant"

export interface ParticipantCategory {
  id: ParticipantId
  /** The age band, shown beside the label. Never implied by the label alone. */
  band: string
  /** Whether this band pays. Infants ride free and the row says so. */
  chargeable: boolean
  min: number
  max: number
}

/**
 * The bands themselves carry no words.
 *
 * An age range is the same fact in every language, so it stays here; the label
 * and the counted phrase come from the dictionary. Keeping a `label` field on
 * this table is how a module ends up with one row of Romanian nouns that no
 * amount of locale plumbing above it can reach.
 */
export const CATEGORIES: readonly ParticipantCategory[] = [
  { id: "adult", band: "18+", chargeable: true, min: 1, max: 12 },
  { id: "child", band: "3-12", chargeable: true, min: 0, max: 12 },
  { id: "infant", band: "0-2", chargeable: false, min: 0, max: 6 },
]

export type Participants = Record<ParticipantId, number>

/**
 * One adult. Not two: the resting price beside the stepper is a per-person
 * figure, and a default party of two makes the first total the reader sees
 * twice the number they were quoted a line above.
 */
export const INITIAL: Participants = { adult: 1, child: 0, infant: 0 }

/** The band's name — "Adult", "Copil" — in the reader's language. */
export function labelOf(copy: Copy, id: ParticipantId): string {
  return copy.participant[id].label
}

/**
 * "2 adults", "1 child".
 *
 * Counted through `Intl.PluralRules` rather than by switching on `n === 1`,
 * which only ever fixes English: Romanian needs a third form above nineteen —
 * it inserts a "de" that "19 locuri" does not take and "20 de locuri" does —
 * and getting that wrong is the kind of detail that tells a reader nobody
 * looked at the page.
 */
export function countOf(copy: Copy, id: ParticipantId, count: number): string {
  return counted(copy, copy.participant[id].counted, count)
}

/** How many fares this party buys. */
export function chargeableCount(party: Participants): number {
  return CATEGORIES.filter((category) => category.chargeable).reduce(
    (total, category) => total + party[category.id],
    0,
  )
}

/**
 * How many places this party takes.
 *
 * Includes the baby. An operator's "max. 15 people" is a headcount on a minibus
 * or a walking group, and a lap infant still occupies one — counting only the
 * paying members is how a group of fifteen plus two babies gets sold a tour
 * that cannot carry it.
 */
export function seatCount(party: Participants): number {
  return CATEGORIES.reduce((total, category) => total + party[category.id], 0)
}

/**
 * What the party costs at a given per-person price.
 *
 * Children are charged the option's own price. The contract carries one price
 * per option and no child rate, so applying a discount here would be inventing
 * a commercial term the operator never published — the one class of error a
 * traveller acts on. Only the infant row is free, and only because the row
 * itself says so.
 */
export function totalOf(party: Participants, unitAmount: number): number {
  return chargeableCount(party) * unitAmount
}

export interface LineItem {
  id: ParticipantId
  label: string
  count: number
  /** Undefined when the band is free, so the summary can say so in words. */
  amount?: number
}

/** The party, itemised, with the empty bands left out. */
export function lineItems(
  copy: Copy,
  party: Participants,
  unitAmount: number,
): LineItem[] {
  return CATEGORIES.filter((category) => party[category.id] > 0).map((category) => {
    const count = party[category.id]
    const label = labelOf(copy, category.id)
    return category.chargeable
      ? { id: category.id, label, count, amount: count * unitAmount }
      : { id: category.id, label, count }
  })
}

/** "2 adults · 1 child" — the party in one line, for a trigger or a total. */
export function summaryOf(copy: Copy, party: Participants): string {
  return CATEGORIES.filter((category) => party[category.id] > 0)
    .map((category) => countOf(copy, category.id, party[category.id]))
    .join(" · ")
}
