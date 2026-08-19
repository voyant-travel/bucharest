import { useMemo } from "react"

import type { Departure } from "~/lib/product/adapter"
import { cn } from "~/lib/utils"

import { isSellable } from "./availability"
import type { Copy } from "./copy"
import { formatDay, money, monthsShort, parseDay } from "./format"

interface Props {
  copy: Copy
  /** The bar labels are months, so this instrument speaks a language too. */
  locale: string
  departures: Departure[]
  currency: string
  /** The row currently under the reader's attention, if any. */
  highlightedId: string | undefined
  onPick: (id: string) => void
}

const FLOOR = 50
const CEILING = 150

/**
 * The height of one bar, in pixels.
 *
 * The formula is the operator's, not an invention: everything is measured
 * against the cheapest departure, so the shortest bar is the best price and the
 * scale means the same thing on a 600 € circuit as on a 3.000 € one. The
 * ceiling keeps one outlier from flattening the other nineteen bars into a
 * single line.
 */
export function barHeight(price: number, minPrice: number): number {
  if (minPrice <= 0) return FLOOR
  const proportion = ((price - minPrice) / minPrice) * 100
  return Math.min(Math.max(FLOOR + proportion, FLOOR), CEILING)
}

/**
 * Twenty rows of prices, read as one shape.
 *
 * A departures table answers "when can I go"; it answers "which of these is the
 * good deal" only by making the reader compare twenty numbers by eye. The
 * barometer answers it in a glance and hands the reader back to the row they
 * were looking for.
 */
export function PriceBarometer({
  copy,
  locale,
  departures,
  currency,
  highlightedId,
  onPick,
}: Props) {
  /* Above the early return, because a hook that runs only for two departures
   * or more is a hook that changes order the moment a filter empties. */
  const months = useMemo(() => monthsShort(locale), [locale])

  if (departures.length < 2) return null

  const minPrice = Math.min(...departures.map((departure) => departure.price.amount))

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="u-eyebrow text-ink-subtle">{copy.barometerTitle}</span>
        <span className="text-[0.8125rem] text-ink-muted">
          {copy.lowestPrice}{" "}
          <span className="font-medium text-ink">{money(minPrice, currency)}</span>
        </span>
      </figcaption>

      <div className="mt-4 overflow-x-auto pb-1">
        <ul className="flex min-w-full items-end gap-1.5" style={{ height: `${CEILING}px` }}>
          {departures.map((departure) => {
            const cheapest = departure.price.amount === minPrice
            const dimmed = !isSellable(departure.state)
            const date = parseDay(departure.startsOn)

            return (
              <li key={departure.id} className="flex h-full w-12 shrink-0 flex-col justify-end">
                <button
                  type="button"
                  onClick={() => onPick(departure.id)}
                  aria-label={`${formatDay(departure.startsOn, locale)}, ${money(departure.price.amount, currency)}`}
                  className="group flex w-full flex-col justify-end text-center"
                  style={{ height: `${barHeight(departure.price.amount, minPrice)}px` }}
                >
                  <span className="text-[0.625rem] tabular-nums text-ink-subtle">
                    {Math.round(departure.price.amount)}
                  </span>
                  <span
                    className={cn(
                      "mt-1 w-full flex-1 rounded-t-[3px] transition-colors duration-300",
                      cheapest ? "bg-accent" : "bg-line group-hover:bg-ink/25",
                      dimmed && "opacity-40",
                      highlightedId === departure.id && "bg-ink",
                    )}
                  />
                  <span className="mt-1 text-[0.625rem] text-ink-subtle">
                    {date ? months[date.getUTCMonth()] : ""}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </figure>
  )
}
