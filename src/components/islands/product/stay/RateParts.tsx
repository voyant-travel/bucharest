import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import PriceBlock from "~/components/islands/product/PriceBlock"
import { Button } from "~/components/ui/button"
import type { Rate, RoomType } from "~/lib/product/adapter"
import { cn } from "~/lib/utils"

import { counted, fill, type Copy } from "./copy"
import { boardWords, cancelDate, money, type RateStatus } from "./rate-language"

/**
 * The pieces a rate is described by, shared between the two layouts.
 *
 * The table and the phone list are separate markup — a rate table that scrolls
 * sideways on a phone is unusable, so there is no single responsive DOM that
 * serves both. What must not fork is the *content*: if the terms of a rate were
 * assembled twice, one of the two would eventually promise free cancellation
 * that the other did not.
 */

/** What the room itself is, and whether it can hold the party at all. */
export function RoomFacts({
  room,
  fits,
  copy,
  locale,
}: {
  room: RoomType
  /** False when `maxOccupancy` is below the requested party size. */
  fits: boolean
  copy: Copy
  /** Needed as well as `copy`: the occupancy line is a counted phrase. */
  locale: string
}) {
  return (
    <div className={cn("space-y-1.5", !fits && "opacity-70")}>
      <p className="u-display-sm text-[1.0625rem] leading-snug text-ink">{room.name}</p>
      <p className="text-[0.8125rem] text-ink-muted">{room.beds}</p>
      <p className="text-[0.8125rem] text-ink-subtle">
        {counted(locale, copy.guests, room.maxOccupancy)}
        {room.sizeSqm ? ` · ${room.sizeSqm} m²` : ""}
      </p>
    </div>
  )
}

/** The terms of one rate: what it includes, and what happens if plans change. */
export function RateTerms({
  rate,
  copy,
  locale,
}: {
  rate: Rate
  copy: Copy
  /** The cancellation deadline is a date, so it needs the tag as well. */
  locale: string
}) {
  return (
    <div className="space-y-1.5">
      {/* The code lives in the tooltip and nowhere else — see `boardWords`. */}
      <p className="text-[0.9375rem] text-ink" title={rate.board}>
        {boardWords(rate.board, copy)}
      </p>
      <Cancellation rate={rate} copy={copy} locale={locale} />
      <p className="text-[0.75rem] text-ink-subtle">
        {rate.payAtProperty ? copy.payAtProperty : copy.payOnline}
      </p>
    </div>
  )
}

/**
 * The cancellation terms, which are the reason the two rows exist.
 *
 * "Free cancellation" with no date is the single largest source of consumer
 * complaints about accommodation pages in this market: the reader takes it to
 * mean "any time", the operator means "until fourteen days before". So the date
 * is not decoration on this line, it *is* the line — without one there is no
 * promise to make, and the row says only that the terms are still to be
 * confirmed.
 */
function Cancellation({ rate, copy, locale }: { rate: Rate; copy: Copy; locale: string }) {
  if (!rate.refundable) {
    /*
     * Muted, not red. A non-refundable rate is a legitimate trade the reader is
     * making for a lower price, not a warning; styling it as danger pushes
     * everyone onto the dearer rate they may not need.
     */
    return <p className="text-[0.8125rem] text-ink-muted">{copy.nonRefundable}</p>
  }

  /*
   * A missing date and an unparseable one are the same case: there is no
   * deadline to print, so the promise is not made. The alternative — "Free
   * cancellation until " trailing into nothing — is the worst of the three
   * outcomes, because it reads as unconditional.
   */
  const deadline = rate.cancelBy ? cancelDate(rate.cancelBy, locale) : ""
  if (!deadline) {
    return <p className="text-[0.8125rem] text-ink-muted">{copy.cancellationToConfirm}</p>
  }

  return (
    <p className="flex items-start gap-1.5 text-[0.8125rem] text-ink">
      <HugeiconsIcon
        icon={Tick02Icon}
        strokeWidth={2}
        className="mt-px size-4 shrink-0 text-accent"
        aria-hidden="true"
      />
      <span>{fill(copy.freeCancellationUntil, { date: deadline })}</span>
    </p>
  )
}

/**
 * The price of one rate for the whole stay.
 *
 * The big figure is the total, the per-night figure is the subtitle. Swapping
 * them is the classic accommodation error: "68 €" in the size of a headline
 * beside "total" in the size of a footnote is how a reader arrives at checkout
 * expecting to pay a third of the bill. `basis` comes from the rate itself so
 * the suffix `PriceBlock` prints can never disagree with the number above it.
 */
export function RatePrice({
  rate,
  copy,
  locale,
  currency,
  nights,
  rooms,
  priced,
  phone,
}: {
  rate: Rate
  copy: Copy
  /** The subtitle counts nights and rooms, so the tag comes with the words. */
  locale: string
  currency: string
  nights: number
  rooms: number
  /** False for states where the stored number is no longer a live price. */
  priced: boolean
  phone?: string
}) {
  if (!priced) {
    /*
     * Nothing, not even a struck-through figure. An expired or withdrawn rate
     * still carries an amount, and printing it beside "Sold out" is precisely
     * how a traveller ends up quoting last week's fare down the telephone.
     */
    return (
      <p className="text-[1.125rem] text-ink-subtle">
        <span aria-hidden="true">—</span>
        <span className="sr-only">{copy.priceUnavailable}</span>
      </p>
    )
  }

  const total = rate.price.amount * rooms
  const was = rate.was === undefined ? undefined : rate.was * rooms

  return (
    <div>
      <PriceBlock
        state="priced"
        amount={total}
        currency={currency}
        basis={rate.price.basis}
        was={was}
        size="md"
        phone={phone}
      />
      <p className="mt-1 text-[0.8125rem] text-ink-muted">
        {fill(copy.perNight, { amount: money(rate.perNight, currency) })} ·{" "}
        {counted(locale, copy.nights, nights)}
      </p>
      {rooms > 1 && (
        /*
         * The headline covers the whole party, so the arithmetic behind it is
         * spelled out. Without this line the total looks like it disagrees with
         * the per-night figure, and a reader who cannot reconcile two numbers
         * trusts neither.
         */
        <p className="text-[0.75rem] text-ink-subtle">
          {fill(copy.roomsTimesPrice, {
            rooms: counted(locale, copy.rooms, rooms),
            amount: money(rate.price.amount, currency),
          })}
        </p>
      )}
    </div>
  )
}

/** The state of a rate and, when there is one, the choice it offers. */
export function RateAction({
  status,
  chosen,
  onChoose,
  label,
  copy,
}: {
  status: RateStatus
  chosen: boolean
  onChoose: () => void
  /** Named for a screen reader, which hears the button out of its row. */
  label: string
  copy: Copy
}) {
  return (
    <div className="space-y-2">
      {status.note && (
        <p
          className={cn(
            "text-[0.8125rem]",
            /* A real count is stated plainly, in the body colour. Accent or red
             * here would turn an operator's fact into a pressure tactic. */
            status.muted ? "text-ink-subtle" : "text-ink",
          )}
        >
          {status.note}
        </p>
      )}
      {status.bookable && status.cta && (
        <Button
          type="button"
          size="lg"
          variant={chosen ? "secondary" : "default"}
          aria-pressed={chosen}
          aria-label={fill(copy.chosenAction, {
            action: chosen ? copy.chosen : status.cta,
            rate: label,
          })}
          onClick={onChoose}
          className="w-full md:w-auto"
        >
          {chosen ? copy.chosen : status.cta}
        </Button>
      )}
    </div>
  )
}
