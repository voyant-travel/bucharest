import { useId } from "react"

import { fill } from "~/lib/messages"
import type { ActivityOption } from "~/lib/product/adapter"
import { cn } from "~/lib/utils"

import { isBookable } from "./availability"
import { counted, type Copy } from "./copy"
import { durationOf, fullDateOf, languagesOf, money } from "./format"
import { chargeableCount, seatCount, summaryOf, totalOf, type Participants } from "./participants"
import SlotPicker from "./SlotPicker"

interface Props {
  option: ActivityOption
  currency: string
  party: Participants
  selected: boolean
  withTimes: boolean
  slotTime?: string | undefined
  onSelect: () => void
  onSlot: (time: string) => void
  copy: Copy
}

/**
 * One purchasable variant of the experience, priced for this party.
 *
 * Every card is expanded enough to be compared without being opened, because
 * comparing the options *is* the decision — a group tour in Romanian against a
 * private one at twice the price is the question the reader is actually
 * answering. That is also why this is never a dropdown: a `<select>` shows one
 * option at a time and hides the two facts that decide it, the price and what
 * the price buys.
 */
export default function OptionCard({
  option,
  currency,
  party,
  selected,
  withTimes,
  slotTime,
  onSelect,
  onSlot,
  copy,
}: Props) {
  const nameId = useId()
  const seats = seatCount(party)
  const fares = chargeableCount(party)
  const total = totalOf(party, option.price.amount)

  const overCapacity = option.groupSizeMax !== undefined && seats > option.groupSizeMax
  const bookableSlots = withTimes ? option.slots.filter(isBookable) : []
  const soldOut = withTimes && bookableSlots.length === 0
  const takeable = !overCapacity && !soldOut

  return (
    <article
      aria-labelledby={nameId}
      className={cn(
        "rounded-card border p-4 transition-colors duration-300",
        selected ? "border-ink bg-surface-sunk/50" : "border-line bg-surface",
        !takeable && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h4 id={nameId} className="text-[1.0625rem] font-medium text-ink">
          {option.name}
        </h4>
        <div className="text-right">
          <p className="flex items-baseline justify-end gap-1.5">
            <span className="text-[1.25rem] font-medium tabular-nums text-ink">
              {money(option.price.amount, currency)}
            </span>
            <span className="text-[0.8125rem] text-ink-muted">{copy.perPerson}</span>
          </p>
          {/*
           * The total is re-derived here on every render from the party above,
           * so a card the reader has not opened is never quoting yesterday's
           * headcount. Showing only a per-person figure is how a group of four
           * discovers the real number at checkout.
           */}
          <p className="text-[0.8125rem] tabular-nums text-ink-muted">
            {fares > 0
              ? `${money(total, currency)} ${copy.inTotal} · ${summaryOf(copy, party)}`
              : summaryOf(copy, party)}
          </p>
        </div>
      </div>

      {option.badges.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {option.badges.map((badge) => (
            <li
              key={badge}
              className="rounded-pill border border-line px-2.5 py-1 text-[0.75rem] text-ink-subtle"
            >
              {badge}
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-ink-muted">
        <li>{durationOf(copy, option.durationMinutes)}</li>
        {option.languages.length > 0 && <li>{languagesOf(copy, option.languages)}</li>}
        {option.groupSizeMax !== undefined && (
          <li>{fill(copy.maxGroup, { people: counted(copy, copy.people, option.groupSizeMax) })}</li>
        )}
      </ul>

      {/*
       * The deadline as a date, not as "48 h before". A reader cannot check a
       * relative window against their own calendar without doing arithmetic,
       * and this is the line they will come back to when plans change.
       */}
      <p className="mt-2 text-[0.8125rem] text-ink-muted">
        {option.refundable && option.cancelBy
          ? fill(copy.freeCancellationUntil, { date: fullDateOf(copy, option.cancelBy) })
          : option.refundable
            ? copy.freeCancellation
            : copy.noFreeCancellation}
      </p>

      {overCapacity && option.groupSizeMax !== undefined && (
        <p className="mt-3 text-[0.8125rem] text-brass">
          {fill(copy.overCapacity, {
            people: counted(copy, copy.people, option.groupSizeMax),
          })}
        </p>
      )}
      {soldOut && !overCapacity && (
        <p className="mt-3 text-[0.8125rem] text-ink-muted">{copy.soldOutForDate}</p>
      )}

      {/*
       * The card expands where it stands and its neighbours stay put. Replacing
       * the list with the chosen option would take away the comparison at the
       * exact moment the reader is about to commit to it.
       */}
      {selected && takeable && withTimes && (
        <div className="mt-4 border-t border-line pt-4">
          <SlotPicker
            slots={option.slots}
            value={slotTime}
            onSelect={onSlot}
            label={copy.startTime}
            copy={copy}
          />
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!takeable}
          aria-pressed={selected}
          onClick={onSelect}
          className={cn(
            "inline-flex h-10 items-center rounded-pill px-5 text-[0.875rem] font-medium",
            "transition-colors duration-300",
            "disabled:cursor-not-allowed disabled:opacity-40",
            selected
              ? "border border-ink bg-transparent text-ink"
              : "bg-accent text-accent-ink hover:bg-accent-hover",
          )}
        >
          {selected ? copy.selected : copy.select}
        </button>
      </div>
    </article>
  )
}

/**
 * A card's silhouette while availability is being fetched.
 *
 * The list keeps its shape and the panel around it keeps its price, its party
 * and its date. Blanking the whole panel on every date change is what makes a
 * picker feel like it lost the reader's answers, and on a slow connection it
 * makes the module look broken rather than busy.
 */
export function OptionCardSkeleton() {
  return (
    <div className="animate-pulse rounded-card border border-line p-4" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <div className="h-4 w-40 rounded-card bg-line/60" />
        <div className="h-5 w-20 rounded-card bg-line/60" />
      </div>
      <div className="mt-3 h-3 w-56 rounded-card bg-line/60" />
      <div className="mt-2 h-3 w-32 rounded-card bg-line/60" />
      <div className="mt-4 ml-auto h-9 w-28 rounded-pill bg-line/60" />
    </div>
  )
}
