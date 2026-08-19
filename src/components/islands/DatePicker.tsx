import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import type { DateRange, Matcher } from "react-day-picker"

import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { cn } from "~/lib/cn"
import { formatDate, formatDateRange } from "~/lib/dates"

/**
 * One date, or an interval, picked from a calendar.
 *
 * Two decisions shape the rest of this file.
 *
 * The value on the wire is an ISO day — `2026-05-14` — never a `Date`. That is
 * what `src/lib/dates.ts` formats, what the search form already posts, and the
 * only representation that survives the trip through an Astro island's props,
 * a hidden input and a `FormData`. `Date` is used strictly inside the calendar,
 * where react-day-picker needs one.
 *
 * The two are converted through their calendar fields (`getFullYear`,
 * `getMonth`, `getDate`) rather than through `Date.parse`. A date-only string
 * has no timezone, so parsing `2026-05-14` as an instant lands on 13 May for
 * any reader west of Greenwich — the same trap `lib/dates.ts` documents, one
 * layer down. Reading the fields off a local-midnight `Date` cannot shift the
 * day, whatever timezone the browser is in.
 *
 * Without JavaScript this renders the native `<input type="date">` it replaces,
 * so a required departure date is still fillable on a page whose island never
 * hydrated, and the form posts exactly one value under each name either way.
 */

/** A start and an end, each an ISO day, either of which may be missing. */
export type IsoDateRange = { from?: string; to?: string }

type CommonProps = {
  /** BCP-47 tag. A string, not a date-fns locale: islands take serializable props. */
  locale?: string
  /** Earliest selectable day, as an ISO day. */
  min?: string
  /** Latest selectable day, as an ISO day. */
  max?: string
  disabled?: boolean
  required?: boolean
  /** Months shown side by side. Defaults to 1 for a date, 2 for an interval. */
  numberOfMonths?: number
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"]
  align?: "start" | "center" | "end"
  className?: string
  /** Accessible name for the trigger, which has no `<label>` to point at it. */
  ariaLabel?: string
  clearLabel?: string
}

type SingleProps = CommonProps & {
  mode?: "single"
  /** Posted under this name, replacing an `<input type="date" name="…">`. */
  name?: string
  value?: string | null
  defaultValue?: string
  onValueChange?: (value: string | undefined) => void
  placeholder?: string
}

type RangeProps = CommonProps & {
  mode: "range"
  /** Shorthand for `startName`/`endName` as `${name}From` and `${name}To`. */
  name?: string
  startName?: string
  endName?: string
  value?: IsoDateRange | null
  defaultValue?: IsoDateRange
  onValueChange?: (value: IsoDateRange) => void
  /** Shown before anything is picked. */
  placeholder?: string
  /** Shown after a start is picked but before an end is. */
  endPlaceholder?: string
}

export type DatePickerProps = SingleProps | RangeProps

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/** An ISO day as a local-midnight `Date`, which is what the calendar compares. */
function toDate(value: string | undefined | null): Date | undefined {
  if (!value || !ISO_DAY.test(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** The inverse, read off the local fields so the day cannot shift. */
function toIso(date: Date | undefined | null): string | undefined {
  if (!date || Number.isNaN(date.getTime())) return undefined
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

/**
 * Month, weekday and caption names through `Intl`.
 *
 * react-day-picker localizes with a date-fns `Locale` object, which cannot
 * cross an island boundary — it holds functions. Every label it would produce
 * is available from `Intl` against the same locale string the rest of the page
 * is written in, so the formatters are overridden instead of the locale.
 */
function intlFormatters(locale: string | undefined) {
  const tag = locale || "en"
  const named = (options: Intl.DateTimeFormatOptions) => {
    try {
      return new Intl.DateTimeFormat(tag, options)
    } catch {
      return new Intl.DateTimeFormat("en", options)
    }
  }
  const caption = named({ month: "long", year: "numeric" })
  const monthShort = named({ month: "short" })
  const weekday = named({ weekday: "short" })

  return {
    formatCaption: (month: Date) => caption.format(month),
    formatMonthDropdown: (month: Date) => monthShort.format(month),
    formatWeekdayName: (day: Date) => weekday.format(day),
  }
}

/**
 * The first day of the week for a locale — Monday in Bucharest, Sunday in the
 * United States. Only ever read inside the popup, which never server-renders,
 * so a runtime without the data cannot cause a hydration mismatch.
 */
function weekStartsOn(locale: string | undefined) {
  try {
    const info = new Intl.Locale(locale || "en")
    const first = (
      info as Intl.Locale & {
        getWeekInfo?: () => { firstDay: number }
        weekInfo?: { firstDay: number }
      }
    )
    const day = first.getWeekInfo?.().firstDay ?? first.weekInfo?.firstDay
    // `Intl` counts Monday as 1 through Sunday as 7; the calendar counts
    // Sunday as 0 through Saturday as 6.
    return day === undefined ? undefined : ((day % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6)
  } catch {
    return undefined
  }
}

/** A value the parent may or may not be driving. */
function useValue<T>(controlled: T | null | undefined, initial: T) {
  const [uncontrolled, setUncontrolled] = React.useState(initial)
  const isControlled = controlled !== undefined && controlled !== null
  return [
    isControlled ? controlled : uncontrolled,
    setUncontrolled,
    isControlled,
  ] as const
}

/** True once the island has hydrated, and so once the popup can be opened. */
function useHydrated() {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => setHydrated(true), [])
  return hydrated
}

/** One month instead of two once there is no room for two. */
function useCompact() {
  const [compact, setCompact] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)")
    const sync = () => setCompact(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])
  return compact
}

export default function DatePicker(props: DatePickerProps) {
  return props.mode === "range" ? (
    <RangePicker {...props} />
  ) : (
    <SinglePicker {...props} />
  )
}

function SinglePicker({
  name,
  value: controlled,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date",
  locale,
  min,
  max,
  disabled = false,
  required = false,
  numberOfMonths,
  captionLayout,
  align = "start",
  className,
  ariaLabel,
  clearLabel = "Clear",
}: SingleProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue, isControlled] = useValue(controlled, defaultValue)
  const hydrated = useHydrated()
  const calendarProps = useCalendarProps(locale, min, max)

  function commit(next: string | undefined) {
    if (!isControlled) setValue(next)
    onValueChange?.(next)
  }

  if (!hydrated) {
    return (
      <NativeFallback
        name={name}
        defaultValue={value}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        ariaLabel={ariaLabel}
        className={className}
      />
    )
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label={ariaLabel}
              data-empty={!value}
              className={cn(
                "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
                className,
              )}
            />
          }
        >
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
          {value ? formatDate(locale, value) : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto gap-0 p-0">
          <Calendar
            {...calendarProps}
            mode="single"
            selected={toDate(value)}
            defaultMonth={toDate(value) ?? toDate(min)}
            onSelect={(date) => {
              commit(toIso(date))
              setOpen(false)
            }}
            numberOfMonths={numberOfMonths ?? 1}
            captionLayout={captionLayout}
          />
          {value && (
            <ClearRow
              label={clearLabel}
              onClear={() => {
                commit(undefined)
                setOpen(false)
              }}
            />
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}

function RangePicker({
  name,
  startName = name ? `${name}From` : undefined,
  endName = name ? `${name}To` : undefined,
  value: controlled,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date range",
  endPlaceholder = "End date",
  locale,
  min,
  max,
  disabled = false,
  required = false,
  numberOfMonths,
  captionLayout,
  align = "start",
  className,
  ariaLabel,
  clearLabel = "Clear",
}: RangeProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue, isControlled] = useValue<IsoDateRange>(
    controlled,
    defaultValue ?? {},
  )
  const hydrated = useHydrated()
  const compact = useCompact()
  const calendarProps = useCalendarProps(locale, min, max)

  function commit(next: IsoDateRange) {
    if (!isControlled) setValue(next)
    onValueChange?.(next)
  }

  if (!hydrated) {
    return (
      <div className="flex gap-2">
        <NativeFallback
          name={startName}
          defaultValue={value.from}
          min={min}
          max={value.to ?? max}
          disabled={disabled}
          required={required}
          ariaLabel={ariaLabel}
          className={className}
        />
        <NativeFallback
          name={endName}
          defaultValue={value.to}
          min={value.from ?? min}
          max={max}
          disabled={disabled}
          required={required}
          ariaLabel={endPlaceholder}
          className={className}
        />
      </div>
    )
  }

  return (
    <>
      {startName && <input type="hidden" name={startName} value={value.from ?? ""} />}
      {endName && <input type="hidden" name={endName} value={value.to ?? ""} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label={ariaLabel}
              data-empty={!value.from}
              className={cn(
                "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
                className,
              )}
            />
          }
        >
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
          {value.from && value.to ? (
            // `formatRange` collapses what the two ends share, the way each
            // language expects — "14 – 21 May 2026", not two full dates.
            formatDateRange(locale, value.from, value.to)
          ) : value.from ? (
            <span>
              {formatDate(locale, value.from)} –{" "}
              <span className="text-muted-foreground">{endPlaceholder}</span>
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto gap-0 p-0">
          <Calendar
            {...calendarProps}
            mode="range"
            selected={{ from: toDate(value.from), to: toDate(value.to) }}
            defaultMonth={toDate(value.from) ?? toDate(min)}
            onSelect={(range: DateRange | undefined) => {
              const next = { from: toIso(range?.from), to: toIso(range?.to) }
              commit(next)
              // Only once the interval is whole. Closing on the first click
              // would make picking an end date a second trip to the trigger.
              if (next.from && next.to) setOpen(false)
            }}
            numberOfMonths={numberOfMonths ?? (compact ? 1 : 2)}
            captionLayout={captionLayout}
          />
          {(value.from || value.to) && (
            <ClearRow
              label={clearLabel}
              onClear={() => {
                commit({})
                setOpen(false)
              }}
            />
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}

/**
 * Everything both modes configure the same way, as props to spread.
 *
 * A hook rather than a wrapper component: react-day-picker discriminates
 * `selected` and `onSelect` on `mode`, and any wrapper wide enough to accept
 * both modes has to erase that union — which is exactly the pairing worth
 * having checked. Spread into a concrete `<Calendar mode="…">` instead, and
 * both call sites keep their narrowing.
 */
function useCalendarProps(
  locale: string | undefined,
  min: string | undefined,
  max: string | undefined,
) {
  const formatters = React.useMemo(() => intlFormatters(locale), [locale])
  const firstDay = React.useMemo(() => weekStartsOn(locale), [locale])

  return React.useMemo(() => {
    const before = toDate(min)
    const after = toDate(max)

    // Two separate matchers rather than one `{ before, after }`, which
    // react-day-picker reads as the interval *between* the two.
    const outOfRange: Matcher[] = []
    if (before) outOfRange.push({ before })
    if (after) outOfRange.push({ after })

    return {
      autoFocus: true,
      formatters,
      weekStartsOn: firstDay,
      startMonth: before,
      endMonth: after,
      disabled: outOfRange.length ? outOfRange : undefined,
    } satisfies Partial<React.ComponentProps<typeof Calendar>>
  }, [formatters, firstDay, min, max])
}

function ClearRow({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="border-t border-border p-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={onClear}
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        {label}
      </Button>
    </div>
  )
}

/**
 * What the field is before the island hydrates, and all it ever is without
 * JavaScript.
 *
 * The same `name` the popover would post under, so the form carries one value
 * under one name in both states and nothing downstream has to know which one
 * produced it.
 */
function NativeFallback({
  name,
  defaultValue,
  min,
  max,
  disabled,
  required,
  ariaLabel,
  className,
}: {
  name?: string
  defaultValue?: string
  min?: string
  max?: string
  disabled?: boolean
  required?: boolean
  ariaLabel?: string
  className?: string
}) {
  return (
    <input
      type="date"
      name={name}
      defaultValue={defaultValue}
      min={min}
      max={max}
      disabled={disabled}
      required={required}
      aria-label={ariaLabel}
      className={cn(
        "h-9 w-full rounded-4xl border border-border bg-input/30 px-3 text-sm",
        className,
      )}
    />
  )
}
