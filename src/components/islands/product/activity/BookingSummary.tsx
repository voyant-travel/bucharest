import { fill } from "~/lib/messages"
import type { ActivityOption } from "~/lib/product/adapter"
import { bookingHref, type BookingTarget } from "~/lib/product/booking"
import { cn } from "~/lib/utils"

import { isBookable } from "./availability"
import type { Copy } from "./copy"
import { fullDateOf, money } from "./format"
import { lineItems, totalOf, type Participants } from "./participants"

interface Props {
  option: ActivityOption
  date: string
  currency: string
  party: Participants
  withTimes: boolean
  slotTime?: string | undefined
  /** The product this selection belongs to, for the hand-off to the engine. */
  target: BookingTarget
  phone?: string | undefined
  copy: Copy
}

/**
 * What has been chosen, what it costs, and the one link that acts on it.
 *
 * Itemised rather than summed. A single total makes the reader trust the panel
 * to have counted their party correctly; the lines let them check, which is
 * the only thing that actually earns the trust — and it is where a free infant
 * or a party of one adult too many becomes visible before payment, not after.
 *
 * The hand-off carries every answer the panel collected — option, day, start
 * time, and the party split by band — so the engine opens on the selection the
 * reader just made rather than on an empty form. It is an anchor: openable in
 * a new tab, copyable to whoever is paying, and still followable if this island
 * never hydrates.
 */
export default function BookingSummary({
  option,
  date,
  currency,
  party,
  withTimes,
  slotTime,
  target,
  phone,
  copy,
}: Props) {
  const items = lineItems(copy, party, option.price.amount)
  const total = totalOf(party, option.price.amount)
  const needsSlot = withTimes && !slotTime

  /*
   * `SlotPicker` refuses to select an `on_request` or `waitlist` time, so this
   * is a belt-and-braces check rather than a live branch. It is here because
   * the day that rule is relaxed, the failure would otherwise be silent and
   * expensive: a slot a human has to confirm, sold through a checkout.
   */
  const slot = slotTime ? option.slots.find((entry) => entry.time === slotTime) : undefined
  const byHand = slot !== undefined && !isBookable(slot)

  /*
   * Resolved before the missing-start-time check so the footnote below can tell
   * "this sale is confirmed instantly" from "this one is answered by a person".
   * A reader who has not picked an hour yet is still buying from the engine.
   */
  const engineHref = byHand
    ? undefined
    : bookingHref(target, {
        option: option.id,
        date,
        time: slotTime,
        adults: party.adult,
        children: party.child,
        infants: party.infant,
      })
  const href = needsSlot ? undefined : engineHref
  /*
   * Only worth blocking on an hour when there is an engine to send it to. With
   * no engine configured the enquiry is answered by a person who will settle
   * the time anyway, and holding the reader at a greyed-out button until they
   * pick one would be asking for an answer nobody is waiting on.
   */
  const waitingForSlot = needsSlot && engineHref !== undefined
  const enquiry = phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined

  const cta =
    "mt-4 flex h-12 w-full items-center justify-center rounded-pill px-6 text-[0.9375rem] font-medium transition-colors duration-300"

  return (
    <div className="rounded-card bg-surface-sunk p-4">
      <p className="text-[0.8125rem] text-ink-muted">
        {fullDateOf(copy, date)}
        {slotTime && ` · ${fill(copy.atTime, { time: slotTime })}`} · {option.name}
      </p>

      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4 text-[0.875rem]">
            <span className="text-ink-muted">
              {item.count} × {item.label}
            </span>
            <span className="tabular-nums text-ink">
              {item.amount === undefined ? copy.free : money(item.amount, currency)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        {/*
         * "taxes included" beside the figure, not in the terms. A total that
         * grows between this panel and the payment page is the complaint every
         * booking flow gets, and it costs one word to avoid here.
         */}
        <span className="text-[0.9375rem] font-medium text-ink">{copy.totalWithTaxes}</span>
        <span className="text-[1.25rem] font-medium tabular-nums text-ink">
          {money(total, currency)}
        </span>
      </div>

      {href ? (
        <a href={href} className={cn(cta, "bg-accent text-accent-ink hover:bg-accent-hover")}>
          {copy.bookNow}
        </a>
      ) : waitingForSlot ? (
        /*
         * The selection is incomplete, not unsellable, so the control stays
         * where it is and says why underneath. A live "Book now" that silently
         * needs a start time teaches the reader the panel is broken;
         * hiding it entirely would leave them hunting for a step they have
         * already found. This is the one disabled state left, and it exists
         * only when there is a real engine waiting on the other side of it.
         */
        <button
          type="button"
          disabled
          className={cn(cta, "cursor-not-allowed bg-accent text-accent-ink opacity-40")}
        >
          {copy.bookNow}
        </button>
      ) : enquiry ? (
        <a href={enquiry} className={cn(cta, "border border-ink/25 text-ink hover:border-ink/50")}>
          {copy.requestQuote}
        </a>
      ) : (
        /*
         * No engine and no number: there is nowhere to send the reader, and the
         * sentence says so rather than dressing the dead end as a control.
         */
        <p className="mt-4 text-center text-[0.875rem] text-ink-muted">{copy.noRoute}</p>
      )}

      {waitingForSlot && (
        <p className="mt-2 text-center text-[0.8125rem] text-ink-muted">
          {copy.chooseTimeToContinue}
        </p>
      )}

      {/* Only true of the engine. An enquiry is answered by a person, and
        * promising instant confirmation for one would be a promise the
        * operator never made. */}
      <p className="mt-2 text-center text-[0.8125rem] text-ink-subtle">
        {engineHref ? copy.instantConfirmation : copy.confirmBeforePayment}
      </p>
    </div>
  )
}
