import { useMemo } from "react"

import { Calendar } from "~/components/ui/calendar"

import type { Copy } from "./copy"
import { monthYearOf, weekdayCodeAt, WEEK_STARTS_ON } from "./format"

interface Props {
  /** Every sellable day, ascending. Anything absent is disabled, not hidden. */
  dates: string[]
  value?: string | undefined
  onSelect: (iso: string) => void
  copy: Copy
}

/**
 * A month of days, with the unsellable ones refused rather than merely dimmed.
 *
 * Built on `~/components/ui/calendar` rather than on `~/components/islands/
 * DatePicker`. That component is a *form field*: a popover trigger that posts
 * an ISO day under a `name`, with a native `<input type="date">` before it
 * hydrates. Everything it adds is wrong here — this calendar is one revealed
 * step inside a panel, has nothing to post, and must not be behind a second
 * click. What both want is the same primitive underneath, so this takes that
 * directly and DatePicker keeps its own job.
 *
 * react-day-picker earns its place on the two things a hand-rolled grid gets
 * wrong: arrow-key roving focus across a real `role="grid"`, and a genuinely
 * `disabled` day button. A dimmed-but-clickable day is invisible to a screen
 * reader and lets a reader select a date the operator cannot sell.
 */
export default function AvailabilityCalendar({ dates, value, onSelect, copy }: Props) {
  const sellable = useMemo(() => new Set(dates), [dates])
  const first = dates[0]
  const last = dates[dates.length - 1]

  return (
    <Calendar
      mode="single"
      autoFocus
      selected={toLocalDate(value)}
      defaultMonth={toLocalDate(value) ?? toLocalDate(first)}
      /* Navigation stops where supply does; an empty December is not a month
       * worth letting someone page into. */
      startMonth={toLocalDate(first)}
      endMonth={toLocalDate(last)}
      /* Monday, in every language this theme ships — see `WEEK_STARTS_ON`. The
       * headers are derived from the locale but the ordering is not, so an
       * English edition does not silently become Sunday-first. */
      weekStartsOn={WEEK_STARTS_ON}
      showOutsideDays={false}
      disabled={(day: Date) => {
        const iso = toIsoDay(day)
        return !iso || !sellable.has(iso)
      }}
      onSelect={(day) => {
        const iso = toIsoDay(day)
        if (iso) onSelect(iso)
      }}
      formatters={{
        formatCaption: (month: Date) => monthYearOf(copy, month),
        formatWeekdayName: (day: Date) => weekdayCodeAt(copy, day.getDay()),
      }}
      className="w-full bg-transparent p-0"
      classNames={{
        month_caption: "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
        caption_label: "u-eyebrow select-none text-ink",
        weekday: "flex-1 u-eyebrow select-none text-ink-subtle",
        /* Not `opacity-50` on a full-strength day: at that weight the two
         * states are told apart by a shade, and on a phone in daylight they
         * are not told apart at all. */
        disabled: "text-ink-subtle opacity-40",
      }}
    />
  )
}

/**
 * The ISO day the rest of this module speaks, and the local-midnight `Date`
 * the calendar compares against.
 *
 * Converted through the calendar fields rather than through `Date.parse`,
 * which would read a date-only string as UTC and shift the day for readers
 * west of Greenwich. Same trap, same fix, as `DatePicker` and `lib/dates`.
 */
function toLocalDate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toIsoDay(date: Date | undefined): string | undefined {
  if (!date || Number.isNaN(date.getTime())) return undefined
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}
