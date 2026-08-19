import { cn } from "~/lib/utils"

import type { Copy } from "./copy"
import { dayOf, monthShortOf, fullDateOf, weekdayCodeOf, weekdayOf } from "./format"

interface StripProps {
  /** ISO days, ascending. Only ever days the operator can actually sell. */
  dates: string[]
  selected?: string | undefined
  onPick: (iso: string) => void
  label: string
  copy: Copy
}

/**
 * A row of dates, tappable.
 *
 * The strip exists so that the common case — "the next day or two" — costs no
 * calendar at all. Most people booking an experience are booking it for this
 * week, and making them open a month grid to confirm what the panel already
 * knows is the single most expensive interaction in a picker like this.
 */
export function DateStrip({ dates, selected, onPick, label, copy }: StripProps) {
  if (dates.length === 0) return null

  return (
    <ul aria-label={label} className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {dates.map((iso) => {
        const active = iso === selected
        return (
          <li key={iso}>
            <button
              type="button"
              onClick={() => onPick(iso)}
              aria-pressed={active}
              /*
               * The visible face is three abbreviated lines, which no screen
               * reader should have to reassemble into a date. The label carries
               * the whole thing instead.
               */
              aria-label={`${weekdayOf(copy, iso)}, ${fullDateOf(copy, iso)}`}
              className={cn(
                "flex min-w-[4.25rem] flex-col items-center gap-0.5 rounded-card border px-3 py-2",
                "transition-colors duration-300",
                active
                  ? "border-ink bg-ink text-canvas"
                  : "border-line bg-surface hover:border-ink/30 hover:bg-surface-sunk",
              )}
            >
              <span className={cn("u-eyebrow", active ? "opacity-70" : "text-ink-subtle")}>
                {weekdayCodeOf(copy, iso)}
              </span>
              <span
                className={cn(
                  "text-[1.125rem] font-medium tabular-nums leading-none",
                  active ? "" : "text-ink",
                )}
              >
                {dayOf(copy, iso)}
              </span>
              <span className={cn("text-[0.75rem] leading-none", active ? "opacity-70" : "text-ink-subtle")}>
                {monthShortOf(copy, iso)}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

interface NextProps {
  /** Every sellable day, ascending. The strip takes the first few itself. */
  dates: string[]
  selected?: string | undefined
  onPick: (iso: string) => void
  /** How many pills to offer before the reader has to open the calendar. */
  count?: number
  copy: Copy
}

/**
 * The resting state of the date step: what the reader gets before they touch
 * anything.
 *
 * Naming the next available day in words is the whole point. "Choose a date" is
 * an instruction; "Next available: Thursday, 20 Aug" is an answer, and it is
 * the answer most readers came for.
 */
export function NextAvailable({ dates, selected, onPick, count = 7, copy }: NextProps) {
  const first = dates[0]
  if (!first) return null

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.9375rem] text-ink-muted">
        {copy.nextAvailable}:{" "}
        <span className="font-medium text-ink">
          {weekdayOf(copy, first)}, {dayOf(copy, first)} {monthShortOf(copy, first)}
        </span>
      </p>
      <DateStrip
        dates={dates.slice(0, count)}
        selected={selected}
        onPick={onPick}
        label={copy.nearestDates}
        copy={copy}
      />
    </div>
  )
}
