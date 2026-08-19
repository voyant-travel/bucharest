import { HugeiconsIcon } from "@hugeicons/react"
import { Fragment, useId } from "react"

import PriceBlock from "~/components/islands/product/PriceBlock"
import { fill } from "~/lib/messages"
import type { CabinGrade, Money } from "~/lib/product/adapter"
import type { BookingTarget } from "~/lib/product/booking"
import type { LiveState } from "~/lib/product/mode"
import { cn } from "~/lib/utils"

import { BADGE, CTA, isSellable, presentGrade, routeFor, TONE_BADGE } from "./availability"
import type { Copy } from "./copy"
import {
  decksPhrase,
  GRADE_ICON,
  gradeKicker,
  money,
  occupancyPhrase,
  percentPhrase,
} from "./format"
import { totalFor } from "./total"

interface Props {
  grade: CabinGrade
  copy: Copy
  currency: string
  nights: number
  adults: number
  portTax?: Money | undefined
  serviceChargePerDay?: Money | undefined
  /** The sailing this card belongs to, for the hand-off to the engine. */
  target: BookingTarget
  phone?: string | undefined
  selected: boolean
  /** The radio group's name, so the row of cards behaves as one choice. */
  groupName: string
  onSelect: (grade: CabinGrade) => void
  /**
   * The state of the price line, and of nothing else on the card.
   *
   * Cabin fares are a live fetch by contract, so this card has to survive one
   * being in flight. The seam is here, at the figure, rather than around the
   * whole card on purpose: blanking the name, the deck and the occupancy while
   * a re-price runs throws away everything the reader was comparing and makes a
   * slow connection look like a broken page. Defaults to `priced` because the
   * grades arrive with the page today.
   */
  priceState?: LiveState
}

/**
 * One cabin grade, priced for this party.
 *
 * Every card is expanded enough to be compared without being opened, because
 * comparing the grades *is* the decision — an interior cabin against a balcony
 * at twice the money is the question the reader is actually answering. That is
 * also why choosing one never collapses the others, and why this is never a
 * dropdown: a `<select>` shows one grade at a time and hides the two facts that
 * decide it, what it costs and what the cost buys.
 */
export function CabinGradeCard({
  grade,
  copy,
  currency,
  nights,
  adults,
  portTax,
  serviceChargePerDay,
  target,
  phone,
  selected,
  groupName,
  onSelect,
  priceState = "priced",
}: Props) {
  const inputId = useId()
  const shown = presentGrade(copy, grade, adults)
  const sellable = isSellable(grade.state) && !shown.disabled
  const route = routeFor(copy, grade, adults, shown, target, phone)
  const decks = decksPhrase(copy, grade.deckNames)
  const totals = totalFor({
    copy,
    grade,
    currency,
    nights,
    adults,
    portTax,
    serviceChargePerDay,
  })

  /*
   * The charges the headline excludes, worded as `PriceBlock` prints them: it
   * adds the "+" itself. Both are optional in the contract and an operator may
   * publish neither, so the list is built up rather than assumed.
   */
  const extras: string[] = []
  if (portTax !== undefined) {
    extras.push(
      fill(copy.portTaxExtra, { amount: money(portTax.amount, portTax.currency) }),
    )
  }
  if (serviceChargePerDay !== undefined) {
    extras.push(
      fill(copy.serviceChargeExtra, {
        amount: money(serviceChargePerDay.amount, serviceChargePerDay.currency),
      }),
    )
  }

  const supplementPct = grade.singleSupplementPct
  /* The moment the supplement stops being a caveat and starts being a charge. */
  const soloPays = adults === 1 && supplementPct !== undefined

  return (
    <li
      className={cn(
        "flex flex-col rounded-card border p-4 transition-colors duration-300",
        selected ? "border-ink bg-accent-wash" : "border-line bg-surface",
        shown.dim && "opacity-40",
      )}
    >
      {/*
       * A radio, not a button and not a clickable card. It is the correct
       * semantic for one choice among several, it arrives in the tab order for
       * free with arrow keys between the grades, and — the reason it matters
       * here — choosing a grade must never navigate, or the total this card
       * exists to show would be gone before it rendered.
       */}
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-start gap-3",
          shown.disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <input
          id={inputId}
          type="radio"
          name={groupName}
          className="peer sr-only"
          checked={selected}
          disabled={shown.disabled}
          onChange={() => onSelect(grade)}
        />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill border border-line",
            "transition-colors duration-300",
            "peer-checked:border-ink peer-checked:bg-ink",
            /* The input itself is `sr-only`, so its own focus ring is invisible
             * — this dot has to carry it or the grades become unreachable for
             * anyone navigating by keyboard. */
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          )}
        >
          <span className={cn("size-2 rounded-pill bg-surface", !selected && "hidden")} />
        </span>

        <span className="min-w-0">
          <span className="u-eyebrow flex items-center gap-1.5 text-ink-subtle">
            <HugeiconsIcon
              icon={GRADE_ICON[grade.code]}
              strokeWidth={1.8}
              className="size-3.5"
              aria-hidden="true"
            />
            {gradeKicker(copy, grade.code)}
          </span>
          <span className="mt-2 block text-[1.0625rem] font-medium leading-snug text-ink">
            {grade.name}
          </span>
        </span>
      </label>

      <p className="mt-3 text-[0.8125rem] text-ink-muted">
        {occupancyPhrase(copy, grade.maxOccupancy)}
      </p>
      {decks !== undefined && <p className="mt-1 text-[0.8125rem] text-ink-muted">{decks}</p>}

      <div
        className={cn(
          "mt-3 flex flex-col",
          shown.strike && "line-through decoration-ink-subtle",
        )}
      >
        <PriceBlock
          /*
           * `contents` dissolves PriceBlock's own wrapper so its figure and its
           * extras become items of this column and "per person, two sharing"
           * can be ordered between them. The order is the point, not a nicety:
           * "from 1.515 €" read without the occupancy basis directly beneath it
           * is a solo traveller reading someone else's fare, and pushing that
           * line below two lines of port charges is enough for the eye to skip
           * it.
           *
           * Only while the figure is actually a figure. A `checking` PriceBlock
           * is a pulsing bar in a box of its own, and `display: contents` would
           * throw that box away.
           */
          className={priceState === "priced" ? "contents [&>ul]:order-3" : undefined}
          state={priceState}
          size="md"
          amount={grade.price.amount}
          currency={currency}
          basis={grade.price.basis}
          /* "de la" is a hedge on a number the reader has not chosen yet. It
           * goes the moment they do. */
          from={sellable && !selected}
          extras={extras}
          locale={copy.locale}
          {...(phone === undefined ? {} : { phone })}
        />
        {priceState === "priced" && (
          <p className="order-2 mt-0.5 text-[0.75rem] text-ink-subtle">{copy.fareBasis}</p>
        )}
      </div>

      {supplementPct !== undefined && (
        /*
         * On the card, at readable size, and never in a footnote — this is the
         * single largest gap between the headline and what a solo traveller
         * pays. It goes brass at one adult because that is the moment it stops
         * being information and starts being their bill.
         */
        <p
          className={cn(
            "mt-2 text-[0.75rem]",
            soloPays ? "font-medium text-brass" : "text-ink-subtle",
          )}
        >
          {fill(copy.singleSupplement, { percent: percentPhrase(supplementPct) })}
          {soloPays && ` · ${copy.soloApplies}`}
        </p>
      )}

      {(shown.badge !== undefined || shown.reason !== undefined) && (
        <div className="mt-3 flex flex-col items-start gap-1.5">
          {shown.badge !== undefined && (
            <span className={cn(BADGE, TONE_BADGE[shown.tone])}>{shown.badge}</span>
          )}
          {shown.reason !== undefined && (
            <p className="text-[0.75rem] text-ink-muted">{shown.reason}</p>
          )}
        </div>
      )}

      {selected && (
        /*
         * The card expands where it stands and its neighbours stay put.
         * Replacing the row with the chosen grade would take the comparison
         * away at the exact moment the reader is about to commit to it.
         */
        <div className="mt-4 border-t border-line pt-4">
          <p className="u-eyebrow text-ink-subtle">{copy.estimatedTotal}</p>
          {totals === undefined ? (
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
              {copy.totalUnavailable}
            </p>
          ) : (
            <>
              <p className="mt-2 text-[1.5rem] font-medium tabular-nums text-ink">
                {money(totals.total, currency)}
              </p>
              {/*
               * The arithmetic, not just its answer. A reader who can see
               * `1.515 € + 180 € + 84 €` can check the total against the fare
               * they were quoted elsewhere; one who is handed only the sum has
               * to trust it, and the first thing they will do instead is go and
               * find the "from" price again.
               */}
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-subtle">
                {totals.terms.map((term, index) => (
                  <Fragment key={term.label}>
                    {index > 0 && " + "}
                    <span className="tabular-nums text-ink-muted">
                      {money(term.amount, currency)}
                    </span>{" "}
                    {term.label}
                  </Fragment>
                ))}
              </p>
              {/*
               * Per person and no further. The contract carries no third- or
               * fourth-berth fare, which is almost always lower than the first
               * two, so multiplying this figure by the party would print a
               * number nobody is charged — the very failure the total is here
               * to fix, committed one line lower down.
               */}
            </>
          )}
        </div>
      )}

      <div className="mt-auto pt-4">
        {route.kind === "closed" ? (
          <button
            type="button"
            disabled
            className={cn(CTA, "cursor-not-allowed border border-line text-ink-subtle")}
          >
            {shown.cta}
          </button>
        ) : route.kind === "tell" ? (
          <p className="text-[0.8125rem] leading-relaxed text-ink-muted">{route.text}</p>
        ) : (
          <a
            href={route.href}
            /*
             * Marking the card before the hand-off, so a reader who opens the
             * engine in a new tab comes back to a page still showing the grade
             * they chose rather than to an untouched row.
             */
            onClick={() => onSelect(grade)}
            className={cn(
              CTA,
              route.kind === "book"
                ? "bg-accent text-accent-ink hover:bg-accent-hover"
                : "border border-ink/25 text-ink hover:border-ink/50",
            )}
          >
            {route.label}
            {/* Four cards, four links reading "Book". The grade is what tells
              * them apart in a screen reader's list of links. */}
            <span className="sr-only"> — {grade.name}</span>
          </a>
        )}
      </div>
    </li>
  )
}
