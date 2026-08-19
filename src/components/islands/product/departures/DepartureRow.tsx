import PriceBlock from "~/components/islands/product/PriceBlock"
import type { Departure } from "~/lib/product/adapter"
import type { BookingTarget } from "~/lib/product/booking"
import { cn } from "~/lib/utils"

import { BADGE, CTA, isSellable, presentDeparture, routeFor, TONE_BADGE } from "./availability"
import { counted, fill, type Copy } from "./copy"
import { formatDay, money, weekdayOf } from "./format"

interface Props {
  departure: Departure
  copy: Copy
  /** Kept beside `copy`: dates and plurals need the tag, not just the words. */
  locale: string
  currency: string
  instantBook: boolean
  phone?: string
  /** The product this row belongs to, for the hand-off to the engine. */
  target: BookingTarget
  selected: boolean
  /** Scrolled to from the barometer, but not chosen. */
  highlighted: boolean
  onSelect: (departure: Departure) => void
  registerRow: (id: string, node: HTMLElement | null) => void
}

export function DepartureRow({
  departure,
  copy,
  locale,
  currency,
  instantBook,
  phone,
  target,
  selected,
  highlighted,
  onSelect,
  registerRow,
}: Props) {
  const shown = presentDeparture(departure, instantBook, copy, locale)
  const sellable = isSellable(departure.state)
  const route = routeFor(departure, shown, target, instantBook, copy, phone)

  return (
    <tr
      ref={(node) => registerRow(departure.id, node)}
      className={cn(
        "border-t border-line align-top transition-colors duration-500",
        selected && "bg-accent-wash",
        !selected && highlighted && "bg-surface-sunk",
        !sellable && "text-ink-subtle",
      )}
    >
      {/*
        * A seven-night circuit is sold as eight days. The two figures are not
        * interchangeable and travellers compare operators on both, so the row
        * carries them together rather than picking one.
        */}
      <td className="px-3 py-5 first:pl-0">
        <span className="block text-[0.9375rem] font-medium text-ink">
          {counted(locale, copy.days, departure.nights + 1)}
        </span>
        <span className="block text-[0.8125rem] text-ink-subtle">
          {counted(locale, copy.nights, departure.nights)}
        </span>
      </td>

      <td className="px-3 py-5">
        <span className="block text-[0.8125rem] text-ink-muted">
          {weekdayOf(departure.startsOn, locale)}
        </span>
        <span className="block text-[0.9375rem] font-medium text-ink">
          {formatDay(departure.startsOn, locale)}
        </span>
        <span className="mt-1 block text-[0.8125rem] text-ink-subtle">
          {fill(copy.departsFrom, { city: departure.from })}
        </span>
      </td>

      <td className="px-3 py-5">
        <span className="block text-[0.8125rem] text-ink-muted">
          {weekdayOf(departure.endsOn, locale)}
        </span>
        <span className="block text-[0.9375rem] text-ink">{formatDay(departure.endsOn, locale)}</span>
      </td>

      {/*
        * The occupancy the price assumes, and what it costs to travel alone.
        * A solo traveller shown only the double-occupancy figure discovers the
        * supplement at checkout, which is where trust is lost rather than won.
        */}
      <td className="px-3 py-5">
        <span className="block text-[0.9375rem] text-ink">{copy.twinShare}</span>
        {departure.singleSupplement !== undefined && (
          <span className="block text-[0.8125rem] text-ink-subtle">
            {fill(copy.singleSupplement, {
              amount: money(departure.singleSupplement, currency),
            })}
          </span>
        )}
      </td>

      <td className="px-3 py-5">
        <div className={cn(shown.strike && "line-through decoration-ink-subtle")}>
          <PriceBlock
            state="priced"
            size="sm"
            amount={departure.price.amount}
            currency={currency}
            basis={departure.price.basis}
            was={departure.was}
            /* "from" is a hedge on an indicative figure. The moment this
             * concrete departure is the reader's choice, the figure is the
             * price and the hedge would read as a caveat on it. */
            from={sellable && !selected}
          />
        </div>
      </td>

      <td className="py-5 pl-3 text-right last:pr-0">
        <div className="flex flex-col items-end gap-2">
          {shown.badge && (
            <span className={cn(BADGE, TONE_BADGE[shown.tone])}>{shown.badge}</span>
          )}
          {route.kind === "closed" ? (
            /* Nothing to link to and nothing to ask for: the state itself is
             * the answer, so the control stays put and stays inert. */
            <button
              type="button"
              disabled
              className={cn(CTA, "cursor-not-allowed border border-line text-ink-subtle")}
            >
              {shown.cta}
            </button>
          ) : route.kind === "tell" ? (
            <p className="max-w-[15rem] text-[0.8125rem] leading-relaxed text-ink-muted">
              {route.text}
            </p>
          ) : (
            /*
             * A link, not a button. The reader can open the engine in a new tab
             * and keep this table to compare against, copy the date to someone
             * travelling with them, and get there at all if the island never
             * hydrates. `onClick` only marks the row — the href is what moves.
             */
            <a
              href={route.href}
              onClick={() => onSelect(departure)}
              className={cn(
                CTA,
                route.kind === "book"
                  ? "bg-accent text-accent-ink hover:bg-accent-hover"
                  : "border border-ink/25 text-ink hover:border-ink/50",
                selected && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
              )}
            >
              {route.label}
            </a>
          )}
          {selected && <span className="sr-only">{copy.dateSelected}</span>}
        </div>
      </td>
    </tr>
  )
}
