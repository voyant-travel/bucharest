import { useId, useState } from "react"

import { fill } from "~/lib/messages"
import type { CabinGrade, Money } from "~/lib/product/adapter"
import type { BookingTarget } from "~/lib/product/booking"

import { presentGrade } from "./availability"
import { CabinGradeCard } from "./CabinGradeCard"
import { copyFor } from "./copy"
import OccupancyStepper, { DEFAULT_ADULTS } from "./OccupancyStepper"

export interface CabinGradeSelectorProps {
  /** Cheapest first, as the adapter sorted them. Never re-sorted here. */
  grades: CabinGrade[]
  currency: string
  /** How long the sailing is, and therefore how much service charge accrues. */
  nights: number
  portTax?: Money
  serviceChargePerDay?: Money
  /**
   * The operator's booking-engine base URL. Absent is a supported state, not a
   * misconfiguration — an agency that has not set one up still has a sailing
   * worth reading about and a telephone worth ringing, and every card falls
   * back to that.
   */
  bookingBase?: string
  productId: string
  productSlug: string
  phone?: string
  /**
   * The publication's language tag. English is the base language, so a row
   * mounted without one is a working English row — the failure mode being
   * avoided is a page that mixes two languages because the island was left out
   * when the locale was threaded through.
   */
  locale?: string
}

/**
 * The module a sailing page is built around.
 *
 * Everything here happens without a navigation. A traveller weighing an
 * interior cabin against a balcony is weighing them against each other, and a
 * page that answers each click with a new document throws that comparison away
 * and asks them to rebuild it from memory. So the party size, the choice and
 * the total all resolve in place, and the only thing that leaves this component
 * is the grade's id — into the href of that card's own call to action, which is
 * where the comparison finally ends: at the booking engine, carrying the cabin
 * and the headcount, in a tab the reader chose to open.
 *
 * The grades arrive already ordered by price. They are rendered in that order
 * and never re-sorted: the contract carries no grade code and no floor area, so
 * price is the only ordering the publication actually supports, and a second
 * opinion about it here would be this component inventing a hierarchy.
 */
export default function CabinGradeSelector({
  grades,
  currency,
  nights,
  portTax,
  serviceChargePerDay,
  bookingBase,
  productId,
  productSlug,
  phone,
  locale = "en",
}: CabinGradeSelectorProps) {
  const groupName = useId()
  const [adults, setAdults] = useState(DEFAULT_ADULTS)
  const [chosenId, setChosenId] = useState<string | undefined>(undefined)

  const target: BookingTarget = { base: bookingBase, productId, productSlug }
  /* Resolved once and handed down. Every card resolving it separately is how
   * one of them ends up on a different fallback from the row around it. */
  const copy = copyFor(locale)

  /*
   * The selection is validated against the current party on every render rather
   * than corrected in an effect. A reader who picks a two-berth cabin and then
   * steps up to four must not be left with a highlighted card and a total for a
   * grade that can no longer take them — and an effect would show them exactly
   * that for one frame before tidying up behind their back.
   */
  const chosen = grades.find((grade) => grade.id === chosenId)
  const selectedId =
    chosen !== undefined && !presentGrade(copy, chosen, adults).disabled ? chosen.id : undefined

  const hasSupplement = grades.some((grade) => grade.singleSupplementPct !== undefined)

  if (grades.length === 0) {
    /*
     * No grades is an answer, not an error. A sailing whose cabin categories
     * are not published yet gets a sentence rather than an empty row of
     * borders that reads as a page that failed to load.
     */
    return (
      <div className="rounded-card border border-line bg-surface-sunk px-5 py-8 text-center">
        <p className="text-[0.9375rem] text-ink">{copy.noGrades}</p>
        {phone !== undefined && (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="mt-2 inline-block text-[0.8125rem] font-medium text-ink underline underline-offset-2"
          >
            {fill(copy.call, { phone })}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <OccupancyStepper value={adults} onChange={setAdults} copy={copy} />
        {adults === 1 && hasSupplement && (
          /*
           * Said once at the top as well as on every card, because this is the
           * step at which the whole row of headline prices stops applying to
           * the reader. Finding that out card by card, after choosing, is how a
           * solo traveller ends up quoted a couple's fare.
           */
          <p className="max-w-sm text-[0.8125rem] leading-relaxed text-brass">
            {copy.soloNotice}
          </p>
        )}
      </div>

      <fieldset className="min-w-0">
        <legend className="sr-only">{copy.chooseGrade}</legend>
        {/*
         * One row that wraps, and a single column below `md`. `auto-fit` rather
         * than a fixed column count because the number of grades is the
         * operator's, not this theme's — three cards pinned into a four-column
         * grid leave a hole where the reader expects a fourth option.
         *
         * On a phone the cards stack full width. Not a horizontal scroller and
         * not a carousel: both hide grades off-screen, and a grade the reader
         * never sees is a grade they never compared.
         */}
        <ul className="grid grid-cols-1 gap-4 md:[grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))]">
          {grades.map((grade) => (
            <CabinGradeCard
              key={grade.id}
              grade={grade}
              copy={copy}
              currency={currency}
              nights={nights}
              adults={adults}
              portTax={portTax}
              serviceChargePerDay={serviceChargePerDay}
              target={target}
              phone={phone}
              selected={selectedId === grade.id}
              groupName={groupName}
              onSelect={(picked) => setChosenId(picked.id)}
            />
          ))}
        </ul>
      </fieldset>

      <p className="text-[0.75rem] leading-relaxed text-ink-subtle" aria-live="polite">
        {selectedId === undefined ? copy.chooseToSeeTotal : copy.choiceKept}
      </p>
    </div>
  )
}
