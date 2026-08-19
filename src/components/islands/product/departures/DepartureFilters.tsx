import { useId, useMemo } from "react"

import { cn } from "~/lib/utils"

import type { Copy } from "./copy"
import { monthsShort } from "./format"

interface Props {
  copy: Copy
  /** Only the month chips read it, but they are twelve of the words here. */
  locale: string
  cities: string[]
  city: string
  onCityChange: (value: string) => void
  years: number[]
  activeYears: number[]
  onToggleYear: (year: number) => void
  /** Twelve flags, in calendar order: whether that month has any departure. */
  monthsOffered: boolean[]
  activeMonths: number[]
  onToggleMonth: (month: number) => void
}

const CHIP =
  "h-9 rounded-pill border px-3 text-[0.8125rem] transition-colors duration-300 disabled:cursor-not-allowed"

/**
 * The header that turns twenty dates into a season.
 *
 * The twelve months are always drawn, the ones with nothing behind them greyed
 * rather than removed. Hiding them would make the row a different width for
 * every product and every filter combination, and would quietly answer "does
 * this circuit run in February?" by saying nothing at all.
 */
export function DepartureFilters({
  copy,
  locale,
  cities,
  city,
  onCityChange,
  years,
  activeYears,
  onToggleYear,
  monthsOffered,
  activeMonths,
  onToggleMonth,
}: Props) {
  const cityId = useId()
  /* Twelve `Intl` lookups per keystroke on the city select is a cost this
   * header has no reason to pay: the labels change only with the language. */
  const months = useMemo(() => monthsShort(locale), [locale])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-3">
          <label htmlFor={cityId} className="u-eyebrow text-ink-subtle">
            {copy.departingFrom}
          </label>
          <select
            id={cityId}
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            className="h-9 rounded-pill border border-line bg-surface px-3 text-[0.8125rem] text-ink transition-colors duration-300 hover:border-ink/25"
          >
            <option value="">{copy.anyCity}</option>
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/*
          * A single season needs no year chips: one chip that cannot be turned
          * off is furniture, and it invites the reader to look for a second
          * year that does not exist.
          */}
        {years.length > 1 && (
          <div className="flex items-center gap-2" role="group" aria-label={copy.departureYear}>
            {years.map((year) => {
              const active = activeYears.includes(year)
              return (
                <button
                  key={year}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleYear(year)}
                  className={cn(
                    CHIP,
                    "tabular-nums",
                    active
                      ? "border-transparent bg-accent text-accent-ink"
                      : "border-line text-ink-muted hover:border-ink/25 hover:text-ink",
                  )}
                >
                  {year}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div
        className="grid grid-cols-6 gap-1.5 sm:grid-cols-12"
        role="group"
        aria-label={copy.departureMonth}
      >
        {months.map((label, month) => {
          const offered = monthsOffered[month] === true
          const active = activeMonths.includes(month)
          return (
            <button
              key={label}
              type="button"
              disabled={!offered}
              aria-pressed={active}
              onClick={() => onToggleMonth(month)}
              className={cn(
                CHIP,
                "w-full px-0 text-center",
                active && "border-transparent bg-accent text-accent-ink",
                !active && offered && "border-line text-ink-muted hover:border-ink/25 hover:text-ink",
                !offered && "border-line/60 bg-surface-sunk text-ink-subtle opacity-60",
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
