import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { Departure } from "~/lib/product/adapter"
import type { BookingTarget } from "~/lib/product/booking"
import type { AvailabilityState } from "~/lib/product/mode"

import { isSellable } from "./availability"
import { copyFor, counted } from "./copy"
import { DepartureCard } from "./DepartureCard"
import { DepartureFilters } from "./DepartureFilters"
import { DepartureRow } from "./DepartureRow"
import { PriceBarometer } from "./PriceBarometer"
import { monthOf, yearOf } from "./format"

export interface DeparturesTableProps {
  departures: Departure[]
  /**
   * The language this page is published in. English when the operator has not
   * said otherwise, and English again for any language the theme has not been
   * translated into — a working table with English labels beats one reading
   * `columnPriceFrom`.
   */
  locale?: string
  currency: string
  /** False when a human confirms every booking: the verb changes, not the list. */
  instantBook: boolean
  phone?: string
  /**
   * The operator's booking-engine base URL. Absent is a supported state, not a
   * misconfiguration — an agency that has not set one up still has a page worth
   * reading and a telephone worth ringing, and every row falls back to that.
   */
  bookingBase?: string
  productId: string
  productSlug: string
}

type SortKey = "date" | "price"
type Direction = "asc" | "desc"
interface Sort {
  key: SortKey
  direction: Direction
}

/**
 * The module a circuit page is built around.
 *
 * Everything here happens without a navigation. A traveller comparing eight
 * departures is comparing them against each other, and a page that answers each
 * click with a new document throws that comparison away and asks them to
 * rebuild it from memory. So the filters, the barometer and the choice itself
 * all resolve in place, and the only thing that leaves this component is the
 * departure's id — into the URL so the reader can send the date they picked to
 * whoever they are travelling with, and into the href of the row's own call to
 * action, which is where the comparison finally ends: at the booking engine,
 * carrying the date, in a tab the reader chose to open.
 */
export default function DeparturesTable({
  departures,
  locale = "en",
  currency,
  instantBook,
  phone,
  bookingBase,
  productId,
  productSlug,
}: DeparturesTableProps) {
  const target: BookingTarget = { base: bookingBase, productId, productSlug }
  /* Resolved once for the whole module. Resolving per row is how one surface
   * ends up a language ahead of another after somebody adds a card. */
  const copy = copyFor(locale)

  /* The sort chip keeps the arrows in the markup and takes only the nouns from
   * the dictionary, so a translator cannot accidentally reverse them. */
  const SORT_LABEL: Record<string, string> = {
    "date-asc": copy.sortByDate,
    "date-desc": `${copy.sortByDate} ↓`,
    "price-asc": `${copy.sortByPrice} ↑`,
    "price-desc": `${copy.sortByPrice} ↓`,
  }

  const [city, setCity] = useState("")
  const [activeYears, setActiveYears] = useState<number[]>([])
  const [activeMonths, setActiveMonths] = useState<number[]>([])
  const [sort, setSort] = useState<Sort>({ key: "date", direction: "asc" })
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [highlightedId, setHighlightedId] = useState<string | undefined>(undefined)

  /* Sorted by the reader's own collation rather than by one fixed language. A
   * German collator files "Ö" under O and a Swedish one puts it last; picking
   * the wrong one puts a departure city where that reader will not look. */
  const cities = useMemo(() => {
    let collator: Intl.Collator
    try {
      collator = new Intl.Collator(locale)
    } catch {
      /* A locale tag ICU rejects must not take the table down with it. */
      collator = new Intl.Collator("en")
    }
    return [...new Set(departures.map((departure) => departure.from))].sort(collator.compare)
  }, [departures, locale])

  const years = useMemo(() => {
    const found = new Set<number>()
    for (const departure of departures) {
      const year = yearOf(departure.startsOn)
      if (year !== undefined) found.add(year)
    }
    return [...found].sort((a, b) => a - b)
  }, [departures])

  /*
   * City and year first, months second. A month chip has to answer "does this
   * circuit run in February *from Cluj*" — greying it against the whole
   * catalogue would leave the reader clicking a live chip into an empty table.
   */
  const inCityAndYear = useMemo(
    () =>
      departures.filter((departure) => {
        if (city && departure.from !== city) return false
        if (activeYears.length === 0) return true
        const year = yearOf(departure.startsOn)
        return year !== undefined && activeYears.includes(year)
      }),
    [departures, city, activeYears],
  )

  const monthsOffered = useMemo(() => {
    const offered = Array.from({ length: 12 }, () => false)
    for (const departure of inCityAndYear) {
      const month = monthOf(departure.startsOn)
      if (month !== undefined) offered[month] = true
    }
    return offered
  }, [inCityAndYear])

  const visible = useMemo(() => {
    const matching = inCityAndYear.filter((departure) => {
      if (activeMonths.length === 0) return true
      const month = monthOf(departure.startsOn)
      return month !== undefined && activeMonths.includes(month)
    })
    const ordered = [...matching].sort((a, b) => {
      const byDate = a.startsOn.localeCompare(b.startsOn)
      /* Same price, earlier date first: two identical figures in an arbitrary
       * order make the table look unsorted at exactly the moment the reader is
       * scanning it most closely. */
      return sort.key === "price" ? a.price.amount - b.price.amount || byDate : byDate
    })
    return sort.direction === "desc" ? ordered.reverse() : ordered
  }, [inCityAndYear, activeMonths, sort])

  /*
   * Both layouts render — the phone's cards and the desktop's rows — and one of
   * them is `display: none`. Keeping every node registered and picking the laid
   * out one at scroll time is what stops the barometer from scrolling to a row
   * nobody can see.
   */
  const nodes = useRef(new Map<string, HTMLElement[]>())
  const registerRow = useCallback((id: string, node: HTMLElement | null) => {
    /* React hands back `null` without saying which node it detached, so the
     * stale ones are recognised by having left the document. */
    const live = (nodes.current.get(id) ?? []).filter((entry) => entry.isConnected)
    const next = node ? [...live, node] : live
    if (next.length === 0) nodes.current.delete(id)
    else nodes.current.set(id, next)
  }, [])

  const reveal = useCallback((id: string) => {
    setHighlightedId(id)
    const target = (nodes.current.get(id) ?? []).find((node) => node.offsetParent !== null)
    if (!target) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" })
  }, [])

  const select = useCallback((departure: Departure) => {
    if (!isSellable(departure.state)) return
    setSelectedId(departure.id)
    setHighlightedId(departure.id)
    /*
     * No event is dispatched. It used to announce the chosen departure to the
     * inline booking form, which no longer exists — the row is a link to the
     * managed engine and carries the departure in its href. A dispatch with no
     * listener is worse than none: the next reader assumes something downstream
     * depends on the name and keeps it alive forever.
     */
    const url = new URL(window.location.href)
    url.searchParams.set("departure", departure.id)
    window.history.pushState({ departureSlotId: departure.id }, "", url)
  }, [])

  useEffect(() => {
    const apply = () => {
      const id = new URLSearchParams(window.location.search).get("departure")
      /*
       * A link shared in March can be opened in May. Restoring a date that has
       * since sold out would show the reader a selected row whose button is
       * disabled, so an unsellable state restores as no selection at all.
       */
      const state: AvailabilityState | undefined = departures.find(
        (departure) => departure.id === id,
      )?.state
      setSelectedId(state !== undefined && isSellable(state) && id !== null ? id : undefined)
    }
    /*
     * A shared link restores the highlight but stays silent: the booking panel
     * moves focus into its own field when it hears the event, and doing that
     * during page load drags the reader away from the top of the page they just
     * opened. The event belongs to the click, not to the URL.
     */
    apply()
    window.addEventListener("popstate", apply)
    return () => window.removeEventListener("popstate", apply)
  }, [departures])

  const reset = () => {
    setCity("")
    setActiveYears([])
    setActiveMonths([])
  }

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]

  const sortByPrice = () =>
    setSort((current) =>
      current.key === "price" && current.direction === "asc"
        ? { key: "price", direction: "desc" }
        : { key: "price", direction: "asc" },
    )

  const sortByDate = () =>
    setSort((current) =>
      current.key === "date" && current.direction === "asc"
        ? { key: "date", direction: "desc" }
        : { key: "date", direction: "asc" },
    )

  const cycleSort = () =>
    setSort((current) => {
      if (current.key === "date") return { key: "price", direction: "asc" }
      if (current.direction === "asc") return { key: "price", direction: "desc" }
      return { key: "date", direction: "asc" }
    })

  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" =>
    sort.key !== key ? "none" : sort.direction === "asc" ? "ascending" : "descending"

  const shared = (departure: Departure) => ({
    departure,
    copy,
    locale,
    currency,
    instantBook,
    target,
    ...(phone === undefined ? {} : { phone }),
    selected: selectedId === departure.id,
    highlighted: highlightedId === departure.id,
    onSelect: select,
    registerRow,
  })

  return (
    <div className="flex flex-col gap-8">
      <DepartureFilters
        copy={copy}
        locale={locale}
        cities={cities}
        city={city}
        onCityChange={setCity}
        years={years}
        activeYears={activeYears}
        onToggleYear={(year) => setActiveYears((current) => toggle(current, year))}
        monthsOffered={monthsOffered}
        activeMonths={activeMonths}
        onToggleMonth={(month) => setActiveMonths((current) => toggle(current, month))}
      />

      {visible.length === 0 ? (
        <div className="rounded-card border border-line bg-surface-sunk px-5 py-8 text-center">
          <p className="text-[0.9375rem] text-ink">{copy.noMatches}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-[0.8125rem] text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            {copy.clearFilters}
          </button>
        </div>
      ) : (
        <>
          {/* The barometer is a desktop instrument. Twenty bars in a 360px
            * viewport are either illegible or a second horizontal scroll, so
            * the phone gets the one control it actually needs instead. */}
          <div className="hidden md:block">
            <PriceBarometer
              copy={copy}
              locale={locale}
              departures={visible}
              currency={currency}
              highlightedId={highlightedId}
              onPick={reveal}
            />
          </div>

          <div className="flex items-center justify-between gap-3 md:hidden">
            <span className="text-[0.8125rem] text-ink-subtle">
              {counted(locale, copy.departures, visible.length)}
            </span>
            <button
              type="button"
              onClick={cycleSort}
              className="h-9 rounded-pill border border-line px-3 text-[0.8125rem] text-ink transition-colors duration-300 hover:border-ink/25"
            >
              {copy.sortPrefix} {SORT_LABEL[`${sort.key}-${sort.direction}`]}
            </button>
          </div>

          <table className="hidden w-full border-collapse text-left md:table">
            <caption className="sr-only">{copy.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col" className="u-eyebrow pb-3 pl-0 pr-3 text-ink-subtle">
                  {copy.columnDays}
                </th>
                <th
                  scope="col"
                  aria-sort={ariaSort("date")}
                  className="u-eyebrow px-3 pb-3 text-ink-subtle"
                >
                  <button
                    type="button"
                    onClick={sortByDate}
                    className="transition-colors duration-300 hover:text-ink"
                  >
                    {copy.columnDeparts}{" "}
                    {sort.key === "date" && (sort.direction === "asc" ? "↑" : "↓")}
                  </button>
                </th>
                <th scope="col" className="u-eyebrow px-3 pb-3 text-ink-subtle">
                  {copy.columnReturns}
                </th>
                <th scope="col" className="u-eyebrow px-3 pb-3 text-ink-subtle">
                  {copy.columnAccommodation}
                </th>
                <th
                  scope="col"
                  aria-sort={ariaSort("price")}
                  className="u-eyebrow px-3 pb-3 text-ink-subtle"
                >
                  <button
                    type="button"
                    onClick={sortByPrice}
                    className="transition-colors duration-300 hover:text-ink"
                  >
                    {copy.columnPriceFrom}{" "}
                    {sort.key === "price" && (sort.direction === "asc" ? "↑" : "↓")}
                  </button>
                </th>
                <th scope="col" className="pb-3 pl-3 pr-0">
                  <span className="sr-only">{copy.chooseDeparture}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((departure) => (
                <DepartureRow key={departure.id} {...shared(departure)} />
              ))}
            </tbody>
          </table>

          <ul className="flex flex-col gap-3 md:hidden">
            {visible.map((departure) => (
              <DepartureCard key={departure.id} {...shared(departure)} />
            ))}
          </ul>
        </>
      )}

      <p className="text-[0.75rem] text-ink-subtle" aria-live="polite">
        {selectedId === undefined ? copy.chooseToContinue : copy.selectionKept}
      </p>
    </div>
  )
}
