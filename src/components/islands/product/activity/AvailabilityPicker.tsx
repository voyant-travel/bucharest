import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useId, useMemo, useState } from "react"

import PriceBlock from "~/components/islands/product/PriceBlock"
import { Button } from "~/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { fill } from "~/lib/messages"
import type { ActivityOption } from "~/lib/product/adapter"
import type { BookingTarget } from "~/lib/product/booking"
import type { LiveState } from "~/lib/product/mode"
import { cn } from "~/lib/utils"

import { isTakeable, useAvailability } from "./availability"
import AvailabilityCalendar from "./AvailabilityCalendar"
import BookingSummary from "./BookingSummary"
import { type Copy, copyFor } from "./copy"
import { DateStrip, NextAvailable } from "./DateStrip"
import { dayMonthOf, fullDateOf, weekdayOf } from "./format"
import OptionCard, { OptionCardSkeleton } from "./OptionCard"
import ParticipantStepper from "./ParticipantStepper"
import { INITIAL, type Participants } from "./participants"

export interface AvailabilityPickerProps {
  /** Every purchasable variant. Shown in full, never behind a dropdown. */
  options: ActivityOption[]
  /** Sellable days, ISO, ascending. Anything absent is refused, not dimmed. */
  availableDates: string[]
  currency: string
  /** True for `date_time`, false for `date`. The start-time step exists only then. */
  withTimes: boolean
  /** Where to call when there is no availability to show at all. */
  phone?: string
  /**
   * The operator's booking-engine base URL. Absent is a supported state — the
   * panel still answers what it costs and when the next one is, and hands the
   * completed selection to a person instead of to a checkout.
   */
  bookingBase?: string
  productId: string
  productSlug: string
  /**
   * The publication's language tag. English is the base language, so a panel
   * mounted without one is a working English panel — the failure mode being
   * avoided is a page that mixes two languages because the island was left out
   * when the locale was threaded through.
   */
  locale?: string
}

/** How many dates the resting strip offers before the calendar is needed. */
const STRIP = 7

/**
 * A date, an option, and — when the experience has start times — an hour.
 *
 * The three steps live in one panel and each reveals the next, but the panel is
 * useful before any of them is touched. That resting state is the part most
 * implementations get wrong: they open on an empty calendar and a "de la"
 * price, which asks the reader to do work before the page has told them
 * anything. Here the panel already answers the two questions someone arrives
 * with — what does it cost, and when is the next one — and a party going
 * tomorrow can pick a pill and reach a total without opening anything.
 *
 * Nothing is ever hidden behind a `<select>`. Comparing the options *is* the
 * decision on an experience page: a group tour against a private one at twice
 * the price is the question being answered, and a control that shows one option
 * at a time hides it.
 */
export default function AvailabilityPicker({
  options,
  availableDates,
  currency,
  withTimes,
  phone,
  bookingBase,
  productId,
  productSlug,
  locale = "en",
}: AvailabilityPickerProps) {
  const target: BookingTarget = { base: bookingBase, productId, productSlug }
  /* Resolved once and handed down. Every child asking for it separately is how
   * one of them ends up on a different fallback from its neighbour. */
  const copy = copyFor(locale)

  const [party, setParty] = useState<Participants>(INITIAL)
  const [date, setDate] = useState<string | undefined>(undefined)
  const [optionId, setOptionId] = useState<string | undefined>(undefined)
  const [slotTime, setSlotTime] = useState<string | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const compact = useCompact()
  const ids = useId()

  /*
   * Cheapest first, because the list is read as a price ladder — the first card
   * is the figure the headline promised, and every card after it is what more
   * money buys. Sorted from a copy: the prop belongs to the caller.
   */
  const ladder = useMemo(
    () => [...options].sort((a, b) => a.price.amount - b.price.amount),
    [options],
  )
  const cheapest = ladder[0]
  const hasSupply = ladder.length > 0 && availableDates.length > 0

  const { live, offered } = useAvailability(date, ladder, withTimes, hasSupply)
  const selected = offered.find((option) => option.id === optionId)
  /*
   * Re-checked on every render rather than remembered at selection time. The
   * party can grow after an option was chosen, and a summary that keeps
   * totalling a tour the group has outgrown is worse than no summary.
   */
  const confirmed = selected && isTakeable(selected, party, withTimes) ? selected : undefined

  function chooseDate(iso: string) {
    setDate(iso)
    /* Both are quoted for a day. Carrying yesterday's 10:00 into a new date is
     * how a picker confirms a slot that was never checked. */
    setOptionId(undefined)
    setSlotTime(undefined)
    setCalendarOpen(false)
  }

  function chooseOption(id: string) {
    setOptionId(id)
    setSlotTime(undefined)
  }

  /*
   * The headline keeps showing a price while availability is being fetched.
   * "from 24 €" is not the figure in flight — it is what the product costs at
   * all — so replacing it with a skeleton on every date tap would make the one
   * stable number on the panel flicker. It goes away only when there is
   * genuinely nothing true to say.
   */
  const headline: LiveState = !hasSupply || live === "failed" ? "failed" : "priced"
  const headlineOption = confirmed ?? cheapest

  /* A window onto the strip that keeps the chosen day in view, with the day
   * before it still reachable — changing your mind by one day is the commonest
   * edit, and it should not cost a calendar. */
  const stripDates = date ? windowAround(availableDates, date, STRIP) : availableDates.slice(0, STRIP)
  const nextAfter = date ? availableDates.filter((iso) => iso > date).slice(0, 3) : []

  const panel = (
    <div className="flex flex-col gap-6">
      <PriceBlock
        state={headline}
        amount={headlineOption?.price.amount}
        currency={currency}
        basis="per_person"
        /* "from" is a hedge on an indicative figure; the moment a concrete
         * option is chosen the number is no longer indicative. */
        from={!confirmed}
        size="lg"
        phone={phone}
        locale={copy.locale}
      />

      <ParticipantStepper value={party} onChange={setParty} copy={copy} />

      <section aria-labelledby={`${ids}-date`}>
        <StepHeading id={`${ids}-date`} index={1} title={copy.stepDate} copy={copy} />

        {availableDates.length === 0 ? (
          /* No days to offer means the availability call did not come back —
           * see `useAvailability`. Offering a calendar of refused days would
           * dress that up as an operator with nothing left to sell. */
          <p className="mt-3 text-[0.9375rem] text-ink-muted">{copy.datesUnavailable}</p>
        ) : date ? (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-[0.9375rem] text-ink">
                <span className="capitalize">{weekdayOf(copy, date)}</span>,{" "}
                {fullDateOf(copy, date)}
              </p>
              <button
                type="button"
                aria-expanded={calendarOpen}
                onClick={() => setCalendarOpen((open) => !open)}
                className="text-[0.8125rem] text-ink-muted underline underline-offset-2 transition-colors duration-300 hover:text-ink"
              >
                {calendarOpen ? copy.hideCalendar : copy.changeDate}
              </button>
            </div>
            <DateStrip
              dates={stripDates}
              selected={date}
              onPick={chooseDate}
              label={copy.nearbyDates}
              copy={copy}
            />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <NextAvailable
              dates={availableDates}
              selected={date}
              onPick={chooseDate}
              count={STRIP}
              copy={copy}
            />
            <button
              type="button"
              aria-expanded={calendarOpen}
              onClick={() => setCalendarOpen((open) => !open)}
              className="flex items-center gap-2 self-start text-[0.8125rem] text-ink-muted underline underline-offset-2 transition-colors duration-300 hover:text-ink"
            >
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
              {calendarOpen ? copy.hideCalendar : copy.showAllDates}
            </button>
          </div>
        )}

        {calendarOpen && availableDates.length > 0 && (
          <div className="mt-3 rounded-card border border-line p-3">
            <AvailabilityCalendar
              dates={availableDates}
              value={date}
              onSelect={chooseDate}
              copy={copy}
            />
          </div>
        )}
      </section>

      {date && (
        <section aria-labelledby={`${ids}-option`}>
          <StepHeading id={`${ids}-option`} index={2} title={copy.stepOption} copy={copy} />

          <div className="mt-3 flex flex-col gap-3">
            {live === "checking" && (
              <div role="status" aria-live="polite">
                <span className="sr-only">{copy.checkingAvailability}</span>
                <div className="flex flex-col gap-3">
                  <OptionCardSkeleton />
                  <OptionCardSkeleton />
                </div>
              </div>
            )}

            {live === "priced" &&
              offered.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  currency={currency}
                  party={party}
                  selected={option.id === optionId}
                  withTimes={withTimes}
                  slotTime={slotTime}
                  onSelect={() => chooseOption(option.id)}
                  onSlot={setSlotTime}
                  copy={copy}
                />
              ))}

            {live === "unavailable" && (
              <div className="rounded-card border border-line bg-surface-sunk p-4">
                <p className="text-[0.9375rem] text-ink">
                  {fill(copy.soldOutOn, { date: fullDateOf(copy, date) })}
                </p>
                {nextAfter.length > 0 ? (
                  <>
                    <p className="mt-1 text-[0.8125rem] text-ink-muted">{copy.closestDates}</p>
                    <DateStrip
                      dates={nextAfter}
                      onPick={chooseDate}
                      label={copy.nextDatesWithPlaces}
                      copy={copy}
                    />
                  </>
                ) : (
                  <p className="mt-1 text-[0.8125rem] text-ink-muted">{copy.noLaterDates}</p>
                )}
              </div>
            )}

            {live === "failed" && (
              /* The offer of a person is already made by the price block above,
               * which is where the missing number is. Repeating the telephone
               * here would give the same panel two of them. */
              <p role="status" className="rounded-card border border-line p-4 text-[0.9375rem] text-ink-muted">
                {copy.availabilityFailed}
              </p>
            )}
          </div>
        </section>
      )}

      {confirmed && date && (
        <BookingSummary
          option={confirmed}
          date={date}
          currency={currency}
          party={party}
          withTimes={withTimes}
          slotTime={slotTime}
          target={target}
          phone={phone}
          copy={copy}
        />
      )}
    </div>
  )

  if (!compact) {
    return (
      <section
        aria-label={copy.panelLabel}
        className="rounded-card border border-line bg-surface p-5 md:p-6"
      >
        {panel}
      </section>
    )
  }

  /*
   * On a phone the panel is a bottom sheet, because inline it would push the
   * editorial off the screen and still be too tall to use. Every answer lives
   * in this component and not in the sheet, so dismissing it — by the close
   * button, the backdrop or the back gesture — cannot lose a selection: the
   * sheet unmounts, the state does not.
   */
  return (
    <section
      aria-label={copy.panelLabel}
      className="rounded-card border border-line bg-surface p-4"
    >
      <PriceBlock
        state={headline}
        amount={headlineOption?.price.amount}
        currency={currency}
        basis="per_person"
        from={!confirmed}
        size="md"
        phone={phone}
        locale={copy.locale}
      />

      <p className="mt-2 text-[0.8125rem] text-ink-muted">
        {date
          ? `${dayMonthOf(copy, date)}${slotTime ? `, ${fill(copy.atTime, { time: slotTime })}` : ""}${confirmed ? ` · ${confirmed.name}` : ""}`
          : availableDates[0]
            ? `${copy.nextAvailable}: ${weekdayOf(copy, availableDates[0])}, ${dayMonthOf(copy, availableDates[0])}`
            : copy.noDates}
      </p>

      <Sheet>
        <SheetTrigger
          render={
            <Button size="lg" className="mt-3 h-12 w-full bg-accent text-accent-ink hover:bg-accent-hover" />
          }
        >
          {confirmed
            ? copy.reviewBooking
            : withTimes
              ? copy.chooseDateAndTime
              : copy.chooseDate}
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto bg-surface text-ink"
        >
          <SheetHeader>
            <SheetTitle>{copy.sheetTitle}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-8">{panel}</div>
        </SheetContent>
      </Sheet>
    </section>
  )
}

/**
 * The step's number and name.
 *
 * Numbered because the panel reveals its steps one at a time, and a reader who
 * scrolls back to change a date needs to see that they are three questions in
 * rather than looking at three unrelated controls.
 */
function StepHeading({
  id,
  index,
  title,
  copy,
}: {
  id: string
  index: number
  title: string
  copy: Copy
}) {
  return (
    <h3 id={id} className="flex items-baseline gap-2">
      <span className="u-eyebrow text-ink-subtle">{fill(copy.step, { index })}</span>
      <span className="text-[0.9375rem] font-medium text-ink">{title}</span>
    </h3>
  )
}

/** A slice of the sellable days that keeps the chosen one visible. */
function windowAround(dates: string[], chosen: string, size: number): string[] {
  const index = dates.indexOf(chosen)
  if (index < 0) return dates.slice(0, size)
  const start = Math.max(0, Math.min(index - 1, dates.length - size))
  return dates.slice(start, start + size)
}

/**
 * Whether this is a phone.
 *
 * Matched in JavaScript rather than with a `md:` pair of panels, because the
 * two layouts must not both exist: rendering the panel twice would give the
 * page two calendars, two steppers and two sets of the same buttons. Starts
 * false so the server and the first client render agree — a phone gets the
 * inline panel for one frame, which is a working panel, not a broken one.
 */
function useCompact(): boolean {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)")
    const sync = () => setCompact(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  return compact
}
