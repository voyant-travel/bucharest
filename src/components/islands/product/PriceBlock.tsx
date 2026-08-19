import { fill } from "~/lib/messages"
import type { LiveState } from "~/lib/product/mode"
import type { PriceBasis } from "~/lib/search/contract"
import { cn } from "~/lib/utils"

import { copyFor } from "./copy"

export interface PriceBlockProps {
  state: LiveState
  amount?: number
  currency?: string
  basis?: PriceBasis
  /** The prior price, struck through. Only pass one that was genuinely charged. */
  was?: number
  /**
   * Whether to prefix "de la". True while the figure is the cheapest of several;
   * it must go away the moment the reader has chosen a concrete departure or
   * rate, because "from" beside a price the reader just selected reads as a
   * hedge on a number that is no longer indicative.
   */
  from?: boolean
  /** Unavoidable charges the headline excludes, each already worded. */
  extras?: string[]
  size?: "sm" | "md" | "lg"
  /** Where to call when the price cannot be shown at all. */
  phone?: string
  /**
   * The publication's language tag. English is the base language, so an island
   * mounted without one prints English rather than nothing — the failure mode
   * being avoided is a page that mixes two languages because one component was
   * given a locale and its neighbour was not.
   */
  locale?: string
  className?: string
}

const SIZE = {
  sm: "text-[1.125rem]",
  md: "text-[1.5rem]",
  lg: "text-[2rem]",
} as const

function money(amount: number, currency: string): string {
  /*
   * `de-DE` grouping with no decimals is the convention this theme prices in —
   * 1.515 €, not 1,515.00 €. Deliberately not the reader's locale: the same
   * figure has to read identically on every surface of the site, and fractions
   * of a euro are noise on a number this size.
   */
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * A price, or an honest account of why there isn't one.
 *
 * The five states are the whole point of the component. A price surface that
 * renders only "priced" will, on the day an endpoint is slow or refuses, show
 * either a zero or the last number it happened to hold — and a stale fare is
 * the one failure a traveller acts on before anyone notices.
 */
export default function PriceBlock({
  state,
  amount,
  currency = "EUR",
  basis = "per_person",
  was,
  from,
  extras = [],
  size = "md",
  phone,
  locale = "en",
  className,
}: PriceBlockProps) {
  const copy = copyFor(locale)

  if (state === "checking") {
    return (
      <div className={cn("animate-pulse", className)} role="status" aria-live="polite">
        <span className="sr-only">{copy.checking}</span>
        <div className={cn("rounded-card bg-line/60", size === "lg" ? "h-8 w-40" : "h-6 w-32")} />
      </div>
    )
  }

  if (state === "idle") {
    return (
      <p className={cn("text-[0.9375rem] text-ink-subtle", className)}>{copy.needsDate}</p>
    )
  }

  if (state === "unavailable") {
    return (
      <p className={cn("text-[0.9375rem] text-ink-muted", className)}>{copy.unavailable}</p>
    )
  }

  if (state === "failed") {
    /*
     * No number, not even a struck-through one. The page has nothing true to
     * say about the price, so it says that and offers the one route that still
     * works — a person.
     */
    return (
      <div className={cn("text-[0.9375rem] text-ink-muted", className)} role="status">
        <p>{copy.failed}</p>
        {phone && (
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="mt-1 inline-block font-medium text-ink underline underline-offset-2">
            {fill(copy.call, { phone })}
          </a>
        )}
      </div>
    )
  }

  if (amount === undefined) return null

  return (
    <div className={className}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        {from && <span className="text-[0.8125rem] text-ink-subtle">{copy.from}</span>}
        {was !== undefined && was > amount && (
          <span className="text-[0.9375rem] text-ink-subtle line-through">
            {money(was, currency)}
          </span>
        )}
        <span className={cn("font-medium text-ink", SIZE[size])}>{money(amount, currency)}</span>
        <span className="text-[0.8125rem] text-ink-muted">{copy.basis[basis]}</span>
      </p>
      {extras.length > 0 && (
        /*
         * Adjacent to the figure and in a readable size, because these are the
         * charges that make the headline not the total. Buried in terms, they
         * are the complaint; here, they are just the price.
         */
        <ul className="mt-1.5 space-y-0.5">
          {extras.map((extra) => (
            <li key={extra} className="text-[0.75rem] text-ink-subtle">
              + {extra}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
