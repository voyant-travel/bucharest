import { useMemo, useState } from "react"

import { Button } from "~/components/ui/button"
import type { Rate, RoomType } from "~/lib/product/adapter"
import { bookingHref, type BookingTarget } from "~/lib/product/booking"
import { cn } from "~/lib/utils"

import { copyFor, counted, fill, type Copy } from "./copy"
import { RateAction, RatePrice, RateTerms, RoomFacts } from "./RateParts"
import { boardWords, money, statusOf, telHref, tooSmall, type RateStatus } from "./rate-language"

export interface RoomRateTableProps {
  roomTypes: RoomType[]
  /**
   * The language this page is published in. English when the operator has not
   * said otherwise, and English again for any language the theme has not been
   * translated into — a working table with English labels beats one whose
   * cancellation line reads `freeCancellationUntil`.
   */
  locale?: string
  currency: string
  nights: number
  rooms: number
  adults: number
  /** The number the page falls back to when the table cannot sell anything. */
  phone?: string
  /**
   * The operator's booking-engine base URL. Absent is a supported state: the
   * table still compares rates honestly, it just hands the reader to a person
   * instead of to a checkout.
   */
  bookingBase?: string
  productId: string
  productSlug: string
}

interface Row {
  rate: Rate
  status: RateStatus
}

interface Group {
  room: RoomType
  rows: Row[]
  /** False when the room cannot hold the requested party. */
  fits: boolean
}

/**
 * The rate table of a hotel — the module the rest of a `stay` page exists to
 * support.
 *
 * Two decisions carry most of the weight and both come from how the market's
 * reference pages behave rather than from what is convenient to render:
 *
 * 1. The row is a *rate*, not a room. A room type with a flexible and a saver
 *    rate is one room and two rows, grouped under a single room cell. Showing
 *    one "from" price per room hides the trade the reader is actually making —
 *    a cheaper night against the right to change their mind — and that trade is
 *    the entire decision on an accommodation page.
 * 2. Refundable comes first. Sorting by price puts the non-refundable rate at
 *    the top of every group, where it reads as the room's price and the
 *    cancellation terms read as fine print on it.
 */
export default function RoomRateTable({
  roomTypes,
  locale = "en",
  currency,
  nights,
  rooms,
  adults,
  phone,
  bookingBase,
  productId,
  productSlug,
}: RoomRateTableProps) {
  const target: BookingTarget = { base: bookingBase, productId, productSlug }
  /* Resolved once for the whole module. Resolving per row is how the phone
   * cards end up a language ahead of the desktop table. */
  const copy = copyFor(locale)

  /* A party of zero, or nought nights, is a caller bug rather than a request.
   * Clamping keeps the arithmetic and the plurals sane instead of printing
   * "0 nights" beside a real total. */
  const roomCount = Math.max(1, Math.trunc(rooms) || 1)
  const nightCount = Math.max(1, Math.trunc(nights) || 1)
  const partySize = Math.max(1, Math.trunc(adults) || 1)

  const [chosenId, setChosenId] = useState<string | null>(null)

  const groups: Group[] = useMemo(
    () =>
      roomTypes.map((room) => {
        const fits = room.maxOccupancy >= partySize
        return {
          room,
          fits,
          rows: [...room.rates]
            /*
             * Refundable first, and by nothing else. `sort` is stable in every
             * runtime this ships to, so the operator's own ordering survives
             * within each half — they may have a reason for it that the theme
             * cannot see.
             */
            .sort((left, right) => Number(right.refundable) - Number(left.refundable))
            .map((rate) => ({
              rate,
              /* Occupancy overrides availability: a room that is free but too
               * small is still not something this party can book, and the
               * reason has to be the size, not "sold out". */
              status: fits
                ? statusOf(rate.state, copy, locale, rate.roomsLeft)
                : tooSmall(room.maxOccupancy, copy, locale),
            })),
        }
      }),
    [roomTypes, partySize, copy, locale],
  )

  const chosen = useMemo(() => {
    for (const group of groups) {
      for (const row of group.rows) {
        if (row.rate.id === chosenId) return { group, row }
      }
    }
    return undefined
  }, [groups, chosenId])

  if (groups.length === 0 || groups.every((group) => group.rows.length === 0)) {
    return <NoRooms phone={phone} copy={copy} />
  }

  const stayLabel = `${counted(locale, copy.rooms, roomCount)} · ${counted(locale, copy.adults, partySize)} · ${counted(locale, copy.nights, nightCount)}`

  /*
   * No heading of its own. The page that mounts this owns the section heading,
   * at the size every other section on that page uses; a module that titles
   * itself as well produces the same words twice, in two different sizes.
   */
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-baseline justify-end gap-x-6 gap-y-1">
        {/* What the prices below are for. A total means nothing until the
         * reader knows how many rooms and how many nights it counts. */}
        <p className="text-[0.8125rem] text-ink-muted">
          {fill(copy.pricesFor, { stay: stayLabel })}
        </p>
      </header>

      <RateTable
        groups={groups}
        copy={copy}
        locale={locale}
        currency={currency}
        nights={nightCount}
        rooms={roomCount}
        chosenId={chosenId}
        onChoose={setChosenId}
        stayLabel={stayLabel}
        phone={phone}
      />

      <RateCards
        groups={groups}
        copy={copy}
        locale={locale}
        currency={currency}
        nights={nightCount}
        rooms={roomCount}
        chosenId={chosenId}
        onChoose={setChosenId}
        phone={phone}
      />

      {chosen && (
        <ChosenSummary
          room={chosen.group.room}
          rate={chosen.row.rate}
          copy={copy}
          locale={locale}
          currency={currency}
          rooms={roomCount}
          nights={nightCount}
          adults={partySize}
          phone={phone}
          target={target}
        />
      )}
    </div>
  )
}

/**
 * The desktop table.
 *
 * A real `<table>`: this is tabular data, the reader compares down the price
 * column, and a grid of `<div>`s gives a screen reader no way to say which room
 * a rate belongs to. The room cell is a `<th scope="rowgroup">` spanning its
 * rates for exactly that reason.
 */
function RateTable({
  groups,
  copy,
  locale,
  currency,
  nights,
  rooms,
  chosenId,
  onChoose,
  stayLabel,
  phone,
}: {
  groups: Group[]
  copy: Copy
  locale: string
  currency: string
  nights: number
  rooms: number
  chosenId: string | null
  onChoose: (id: string) => void
  stayLabel: string
  phone?: string
}) {
  return (
    <table className="hidden w-full border-collapse text-left md:table">
      <caption className="sr-only">{fill(copy.tableCaption, { stay: stayLabel })}</caption>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className="u-eyebrow py-3 pr-6 text-ink-subtle">
            {copy.columnRoom}
          </th>
          <th scope="col" className="u-eyebrow py-3 pr-6 text-ink-subtle">
            {copy.columnRate}
          </th>
          <th scope="col" className="u-eyebrow py-3 pr-6 text-ink-subtle">
            {copy.columnTotal}
          </th>
          <th scope="col" className="py-3">
            <span className="sr-only">{copy.columnChoice}</span>
          </th>
        </tr>
      </thead>
      {groups.map((group) => (
        /* One `<tbody>` per room type, so the grouping is in the document and
         * not only in the border colours. */
        <tbody key={group.room.id} className="border-b border-line">
          {group.rows.length === 0 ? (
            <tr>
              <th scope="row" className="py-5 pr-6 align-top font-normal">
                <RoomFacts room={group.room} fits={group.fits} copy={copy} locale={locale} />
              </th>
              <td colSpan={3} className="py-5 text-[0.8125rem] text-ink-subtle">
                {copy.noRatesForRoom}
              </td>
            </tr>
          ) : (
            group.rows.map((row, index) => {
              const chosen = row.rate.id === chosenId
              /*
               * The tint sits on the rate cells, not on the `<tr>`: the room
               * cell spans the whole group, so a row-level background from the
               * first rate would wash the room over as well and read as though
               * the room — rather than one of its rates — were sold out.
               */
              const tone = cn(chosen && "bg-accent-wash", row.status.muted && "bg-surface-sunk/60")
              return (
                <tr key={row.rate.id} className={cn(index > 0 && "border-t border-line/60")}>
                  {index === 0 && (
                    <th
                      scope="rowgroup"
                      rowSpan={group.rows.length}
                      className="w-[26%] py-5 pr-6 align-top font-normal"
                    >
                      <RoomFacts room={group.room} fits={group.fits} copy={copy} locale={locale} />
                    </th>
                  )}
                  <td className={cn("w-[28%] py-5 pr-6 align-top", tone)}>
                    <RateTerms rate={row.rate} copy={copy} locale={locale} />
                  </td>
                  <td className={cn("w-[24%] py-5 pr-6 align-top", tone)}>
                    <RatePrice
                      rate={row.rate}
                      copy={copy}
                      locale={locale}
                      currency={currency}
                      nights={nights}
                      rooms={rooms}
                      priced={row.status.bookable}
                      phone={phone}
                    />
                  </td>
                  <td className={cn("py-5 pr-4 align-top", tone)}>
                    <RateAction
                      status={row.status}
                      chosen={chosen}
                      onChoose={() => onChoose(row.rate.id)}
                      label={`${group.room.name}, ${boardWords(row.rate.board, copy)}`}
                      copy={copy}
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      ))}
    </table>
  )
}

/**
 * The same data on a phone, as a list of cards.
 *
 * Not a table that scrolls sideways. A rate table is four columns of which the
 * price and the cancellation terms are the two that matter, and a horizontal
 * scroller reliably hides one of them off-screen — the reader compares what
 * they can see and chooses on incomplete terms. The room type survives as a
 * sticky sub-header so a rate is never read without knowing which room it is
 * a rate for.
 */
function RateCards({
  groups,
  copy,
  locale,
  currency,
  nights,
  rooms,
  chosenId,
  onChoose,
  phone,
}: {
  groups: Group[]
  copy: Copy
  locale: string
  currency: string
  nights: number
  rooms: number
  chosenId: string | null
  onChoose: (id: string) => void
  phone?: string
}) {
  return (
    <ul className="space-y-5 md:hidden">
      {groups.map((group) => (
        /*
         * No `overflow-hidden` on the card: an ancestor that clips its overflow
         * becomes the scroll container and the sub-header below stops sticking.
         * The corners are rounded on the header and the last rate instead.
         */
        <li key={group.room.id} className="rounded-card border border-line bg-surface">
          <div className="sticky top-0 z-10 rounded-t-card border-b border-line bg-surface/95 px-4 py-3 backdrop-blur">
            <RoomFacts room={group.room} fits={group.fits} copy={copy} locale={locale} />
          </div>
          {group.rows.length === 0 ? (
            <p className="px-4 py-5 text-[0.8125rem] text-ink-subtle">{copy.noRatesForRoom}</p>
          ) : (
            <ul>
              {group.rows.map((row, index) => {
                const chosen = row.rate.id === chosenId
                return (
                  <li
                    key={row.rate.id}
                    className={cn(
                      "space-y-3 px-4 py-4",
                      index > 0 && "border-t border-line/60",
                      chosen && "bg-accent-wash",
                      row.status.muted && "bg-surface-sunk/60",
                    )}
                  >
                    <RateTerms rate={row.rate} copy={copy} locale={locale} />
                    <RatePrice
                      rate={row.rate}
                      copy={copy}
                      locale={locale}
                      currency={currency}
                      nights={nights}
                      rooms={rooms}
                      priced={row.status.bookable}
                      phone={phone}
                    />
                    <RateAction
                      status={row.status}
                      chosen={chosen}
                      onChoose={() => onChoose(row.rate.id)}
                      label={`${group.room.name}, ${boardWords(row.rate.board, copy)}`}
                      copy={copy}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * What the reader has chosen so far, and the way out of this module.
 *
 * The theme owns no checkout, so the way out is a link to the one that does —
 * built by `bookingHref` from the room, the rate and the party, so the engine
 * does not re-ask the four questions this table has already answered. It is an
 * anchor rather than a button on purpose: it can be opened in a second tab
 * beside the comparison, copied to whoever is paying, and followed when the
 * island fails to hydrate.
 *
 * Two rates never get that link even when an engine is configured. `on_request`
 * and `waitlist` are the operator saying a human confirms this room, and a
 * "Book" that lands in a checkout would be the page overruling them.
 */
function ChosenSummary({
  room,
  rate,
  copy,
  locale,
  currency,
  rooms,
  nights,
  adults,
  phone,
  target,
}: {
  room: RoomType
  rate: Rate
  copy: Copy
  locale: string
  currency: string
  rooms: number
  nights: number
  adults: number
  phone?: string
  target: BookingTarget
}) {
  const total = rate.price.amount * rooms

  const byHand = rate.state === "on_request" || rate.state === "waitlist"
  const href = byHand
    ? undefined
    : bookingHref(target, { room: room.id, rate: rate.id, nights, rooms, adults })
  const enquiry = phone ? telHref(phone) : undefined

  return (
    <div
      className="flex flex-wrap items-end justify-between gap-4 rounded-card border border-line bg-surface-sunk p-4 md:p-5"
      role="status"
    >
      <div className="space-y-1">
        <p className="u-eyebrow text-ink-subtle">{copy.yourChoice}</p>
        <p className="text-[0.9375rem] text-ink">
          {room.name} · {boardWords(rate.board, copy)}
        </p>
        <p className="text-[0.8125rem] text-ink-muted">
          {counted(locale, copy.rooms, rooms)} · {counted(locale, copy.adults, adults)} ·{" "}
          {counted(locale, copy.nights, nights)} · {money(total, currency)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {/* Offered beside the booking link, not instead of it. When the link
          * itself is the telephone, repeating the number here would give the
          * same panel two of them. */}
        {phone && href && (
          <a
            href={telHref(phone)}
            className="text-[0.8125rem] text-ink-subtle underline underline-offset-2 hover:text-ink"
          >
            {fill(copy.orCall, { phone })}
          </a>
        )}
        {href ? (
          <Button size="lg" render={<a href={href} />}>
            {copy.book}
          </Button>
        ) : enquiry ? (
          <Button size="lg" render={<a href={enquiry} />}>
            {copy.requestQuote}
          </Button>
        ) : (
          /*
           * No engine and no number. Saying so is the only honest option left:
           * a button that looks live and does nothing would leave the reader
           * wondering whether they had done something wrong.
           */
          <p className="text-[0.875rem] text-ink-muted">{copy.noRoute}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Nothing to sell for these dates.
 *
 * An empty table is a dead end, and an agency's advantage over a marketplace is
 * that a person can go and look. So the state that has no inventory still has
 * a way to ask for some.
 */
function NoRooms({ phone, copy }: { phone?: string; copy: Copy }) {
  return (
    <div className="space-y-3 rounded-card border border-line bg-surface-sunk p-6 text-center">
      <p className="text-[0.9375rem] text-ink">{copy.noAvailability}</p>
      <p className="text-[0.8125rem] text-ink-muted">{copy.noAvailabilityHelp}</p>
      {phone ? (
        <Button
          size="lg"
          render={<a href={telHref(phone)} />}
          className="mx-auto"
        >
          {fill(copy.requestQuoteAt, { phone })}
        </Button>
      ) : (
        /*
         * With no number configured there is nowhere to route a request, so the
         * affordance points at the operator's own contact page rather than at a
         * dialler that would open empty.
         */
        <Button size="lg" render={<a href="/pages/about" />} className="mx-auto">
          {copy.requestQuote}
        </Button>
      )}
    </div>
  )
}
