import PriceBlock from "~/components/islands/product/PriceBlock"
import type { Departure } from "~/lib/product/adapter"
import type { BookingTarget } from "~/lib/product/booking"
import { cn } from "~/lib/utils"

import { BADGE, CTA, isSellable, presentDeparture, routeFor, TONE_BADGE } from "./availability"
import { counted, fill, type Copy } from "./copy"
import { formatDayRange, money } from "./format"

interface Props {
  departure: Departure
  copy: Copy
  /** Kept beside `copy`: dates and plurals need the tag, not just the words. */
  locale: string
  currency: string
  instantBook: boolean
  phone?: string
  /** The product this card belongs to, for the hand-off to the engine. */
  target: BookingTarget
  selected: boolean
  highlighted: boolean
  onSelect: (departure: Departure) => void
  registerRow: (id: string, node: HTMLElement | null) => void
}

/**
 * The same departure on a phone.
 *
 * A card rather than a table that scrolls sideways: six columns on a 360px
 * screen means the price is off-screen while the date is on it, and a reader
 * comparing dates and prices by swiping is comparing nothing.
 */
export function DepartureCard({
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
    <li
      ref={(node) => registerRow(departure.id, node)}
      className={cn(
        "rounded-card border p-4 transition-colors duration-500",
        selected ? "border-ink bg-accent-wash" : "border-line bg-surface",
        !selected && highlighted && "bg-surface-sunk",
      )}
    >
      <p className={cn("text-[0.9375rem] font-medium", sellable ? "text-ink" : "text-ink-subtle")}>
        {formatDayRange(departure.startsOn, departure.endsOn, locale)}
      </p>
      <p className="mt-1 text-[0.8125rem] text-ink-muted">
        {counted(locale, copy.nights, departure.nights)} · {departure.from}
      </p>

      <div className={cn("mt-3", shown.strike && "line-through decoration-ink-subtle")}>
        <PriceBlock
          state="priced"
          size="sm"
          amount={departure.price.amount}
          currency={currency}
          basis={departure.price.basis}
          was={departure.was}
          from={sellable && !selected}
        />
      </div>
      {departure.singleSupplement !== undefined && (
        <p className="mt-1 text-[0.75rem] text-ink-subtle">
          {fill(copy.singleSupplement, {
            amount: money(departure.singleSupplement, currency),
          })}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {shown.badge ? (
          <span className={cn(BADGE, TONE_BADGE[shown.tone])}>{shown.badge}</span>
        ) : (
          <span />
        )}
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
          /* The same link the desktop row renders, and for the same reasons —
           * see `DepartureRow`. Only the layout around it differs. */
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
      </div>

      {selected && <span className="sr-only">{copy.dateSelected}</span>}
    </li>
  )
}
