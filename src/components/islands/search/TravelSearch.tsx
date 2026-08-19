import { FilterHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "~/components/ui/pagination"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import type { SearchQuery, SearchResponse, Vertical } from "../../../lib/search/contract"
import { copyFor, counted, fill } from "../../../lib/search/copy"
import { ANY, type VerticalDef } from "../../../lib/search/definition"
import { search } from "../../../lib/search/engine"
import { VERTICALS } from "../../../lib/search/verticals"
import { cn } from "~/lib/utils"

import { countActive, FacetRail, type FacetState } from "./FacetRail"
import { ResultCard } from "./ResultCard"
import { SearchField, type FormState } from "./SearchFields"

interface Props {
  /** Which verticals this operator sells. Tabs appear only for these. */
  verticals: Vertical[]
  /**
   * The publication's language. English is the theme's base, so an operator who
   * has not said otherwise gets a working search rather than a page of keys.
   */
  locale?: string
  initial?: Vertical
  heading?: string
  eyebrow?: string
  introduction?: string
  /**
   * Place suggestions, per vertical and then per field kind, resolved on the
   * server from the catalogue so nothing offered is unsearchable.
   */
  suggestions?: Record<
    string,
    Record<string, { value: string; label: string; note?: string }[]>
  >
}

/**
 * A travel search, across whichever verticals the agency sells.
 *
 * The shell, the facet rail, the sort control and the card are shared; each
 * vertical contributes a definition rather than an implementation. The split
 * is where the variation actually is — four irreconcilable date shapes and two
 * traveller models across five products — so a single polymorphic form would
 * be wrong four times out of five, while five separate results pages would
 * duplicate the one part that is provably identical.
 */
export default function TravelSearch({
  verticals,
  locale = "en",
  initial,
  heading,
  eyebrow,
  introduction,
  suggestions = {},
}: Props) {
  /*
   * The dictionary is resolved once, here, and handed down.
   *
   * Every word this search says — six tab labels, eleven field labels, a facet
   * rail, a sort list and a card — comes from one lookup, so there is exactly
   * one place the reader's language is decided. Resolving per child would make
   * it thirty decisions that can drift apart, and the way that shows up is a
   * rail in one language beside a card in another.
   */
  const copy = copyFor(locale)
  const available = verticals.filter((id) => VERTICALS[id])
  const [vertical, setVertical] = useState<Vertical>(
    initial && available.includes(initial) ? initial : (available[0] ?? "packages"),
  )
  const def: VerticalDef | undefined = VERTICALS[vertical]

  /*
   * Two copies of the form, and only where they earn it.
   *
   * A live vertical keeps one: what you typed is what is being searched. An
   * explicit one keeps the answers you are still writing apart from the ones
   * the query has actually been run with, so a half-typed destination never
   * costs an availability call.
   */
  const [draft, setDraft] = useState<FormState>(() => seed(def))
  const [committed, setCommitted] = useState<FormState>(() => seed(def))
  const [facetState, setFacetState] = useState<FacetState>({})
  const [sort, setSort] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const resultsRef = useRef<HTMLDivElement>(null)
  const explicit = def?.submit === "explicit"
  const form = explicit ? committed : draft
  const dirty =
    explicit && JSON.stringify(draft) !== JSON.stringify(committed)

  /*
   * The query runs synchronously against local fixtures. When this is wired to
   * a live capability the only thing that changes is that `search` returns a
   * promise — the shape it returns is already the contract.
   */
  const response: SearchResponse | undefined = useMemo(() => {
    if (!def) return undefined
    const query: SearchQuery = {
      vertical,
      sort,
      page,
      perPage: 12,
      filters: { ...toFilters(form, def), ...toFilters(facetState) },
    }
    return search(query, locale)
  }, [def, vertical, form, facetState, sort, page, locale])

  /*
   * A new query starts at its first page. Staying on page three of a result
   * set that no longer exists is how a filter appears to return nothing: the
   * count says thirty-one and the list is empty, because page three of eight
   * results has nothing on it.
   */
  useEffect(() => {
    setPage(1)
  }, [vertical, form, facetState, sort])

  if (!def || !response) return null

  /*
   * Changing page moves the reader to the top of the results, not the top of
   * the document: the search bar above is not what they asked to see again.
   */
  const goToPage = (next: number) => {
    setPage(next)
    resultsRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
  }

  const chips = activeChips(facetState, response)
  const pageCount = Math.max(1, Math.ceil(response.total / response.perPage))
  const firstOnPage = response.total === 0 ? 0 : (response.page - 1) * response.perPage + 1
  const lastOnPage = Math.min(response.page * response.perPage, response.total)

  return (
    <section className="u-shell py-16 md:py-24">
      {(eyebrow || heading || introduction) && (
        <header className="mb-8 max-w-[46rem]">
          {eyebrow && <p className="u-eyebrow text-ink-subtle">{eyebrow}</p>}
          {heading && <h2 className="u-display-sm mt-3 text-[1.75rem] md:text-[2.25rem]">{heading}</h2>}
          {introduction && (
            <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink-muted">
              {introduction}
            </p>
          )}
        </header>
      )}

      {/*
       * Verticals as tabs rather than as separate pages: an agency sells one
       * trip, and the traveller deciding between a package and a cruise should
       * not have to navigate to compare them.
       */}
      {
        /*
         * Tabs as an underline rail rather than filled pills. Pills read as
         * six competing buttons floating above a seventh; a rail reads as one
         * control with one thing selected, and it sits on the bar below it
         * instead of hovering over it.
         */
      }
      {available.length > 1 && (
        <div
          className="no-scrollbar mb-0 flex gap-7 overflow-x-auto border-b border-line"
          role="tablist"
          aria-label={copy.verticalTabs}
        >
          {available.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === vertical}
              onClick={() => {
                setVertical(id)
                setDraft(seed(VERTICALS[id]))
                setCommitted(seed(VERTICALS[id]))
                setPage(1)
                setFacetState({})
                setSort(undefined)
              }}
              className={cn(
                "-mb-px shrink-0 border-b-2 pb-3 text-[0.9375rem] transition-colors duration-300",
                id === vertical
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-subtle hover:text-ink",
              )}
            >
              {copy.verticals[id].name}
            </button>
          ))}
        </div>
      )}

      {
        /*
         * One panel, one row, and the submit inside it.
         *
         * The border lives here and nowhere else; fields are divided by
         * hairlines so the bar reads as a single instrument rather than as a
         * tray of separate inputs. The button is part of the panel too — put
         * outside it, or on a line of its own, it stops looking like the end
         * of the sentence the row is making.
         */
      }
      <form
        className="mt-5 overflow-hidden rounded-card border border-line bg-line"
        onSubmit={(event) => {
          event.preventDefault()
          setCommitted(draft)
        }}
      >
        {
          /*
           * Hairlines as gaps, not as borders.
           *
           * Per-cell borders cannot survive wrapping: the rule that draws a
           * left edge on every cell but the first draws one down the middle of
           * the second row too, and the rule that adds a top edge when wrapped
           * cannot tell which cells wrapped. A one-pixel gap over the panel's
           * own colour gives the same hairline in both axes and stays correct
           * however the row breaks.
           */
        }
        <div className="flex flex-wrap items-stretch gap-px">
          {visibleFields(def, draft).map((field) => (
            <div
              key={field.id}
              className={cn(
                "min-w-0 flex-1 bg-surface",
                /*
                 * The basis has to leave room for the button on the same line.
                 * At 12rem apiece the fields plus the button came to more than
                 * the panel, and flex-wrap dropped the button onto a line of
                 * its own — where it stops reading as the end of the row.
                 */
                "basis-[9.5rem]",
              )}
            >
              <SearchField
                field={field}
                value={draft[field.id]}
                copy={copy}
                locale={locale}
                suggestions={suggestions[vertical]?.[field.kind] ?? []}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, [field.id]: value }))
                }
              />
            </div>
          ))}

          {
            /*
             * No button where the results are already live. A control whose
             * only effect is to re-apply what is on screen teaches the reader
             * that their edits did not count — and then they wait for it
             * everywhere else too.
             */
          }
          {explicit && (
            <div className="flex shrink-0 items-stretch bg-surface p-2">
              <Button
                type="submit"
                className={cn(
                  "h-full rounded-pill px-8 text-[0.9375rem] transition-shadow duration-300",
                  dirty && "ring-2 ring-accent/30 ring-offset-2 ring-offset-surface",
                )}
              >
                {copy.verticals[vertical].submit}
              </Button>
            </div>
          )}
        </div>
      </form>

      <div className="mt-10 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <FacetRail
            facets={response.facets}
            state={facetState}
            onChange={(key, value) =>
              setFacetState((prev) => ({ ...prev, [key]: value }))
            }
            onReset={() => setFacetState({})}
            copy={copy}
          />
        </aside>

        <div>
          <div
            ref={resultsRef}
            className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4"
          >
            <div>
              <p className="u-display-sm text-[1.125rem]">
                {counted(locale, copy.verticals[vertical].results, response.total)}
              </p>
              {dirty && (
                <p className="mt-1 text-[0.875rem] text-accent">
                  {fill(copy.searchChanged, {
                    action: copy.verticals[vertical].submit.toLowerCase(),
                  })}
                </p>
              )}
              {response.priceFrom && !dirty && (
                <p className="mt-1 text-[0.875rem] text-ink-muted">
                  {/* The figure stays `de-DE`, matching every other price in the
                      theme; only the sentence around it follows the reader. */}
                  {fill(copy.pricesFrom, {
                    price: new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: response.priceFrom.currency,
                      maximumFractionDigits: 0,
                    }).format(response.priceFrom.amount),
                  })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* The filter rail becomes a sheet below the rail breakpoint. */}
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="sm" className="lg:hidden gap-2" />
                  }
                >
                  <HugeiconsIcon icon={FilterHorizontalIcon} className="size-4" />
                  {copy.filters}
                  {countActive(facetState) > 0 && ` (${countActive(facetState)})`}
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{copy.filters}</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-8">
                    <FacetRail
                      facets={response.facets}
                      state={facetState}
                      onChange={(key, value) =>
                        setFacetState((prev) => ({ ...prev, [key]: value }))
                      }
                      onReset={() => setFacetState({})}
                      copy={copy}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Select
                value={response.appliedSort}
                onValueChange={(next) => setSort(String(next ?? ""))}
                items={response.sorts.map((option) => ({
                  label: option.name,
                  value: option.key,
                }))}
              >
                <SelectTrigger size="sm" className="w-[13rem] border-line bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {response.sorts.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.name}
                      {option.label && (
                        <span className="ml-2 text-ink-subtle">{option.label}</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2">
              <li className="text-[0.8125rem] text-ink-subtle">{copy.activeFilters}</li>
              {chips.map((chip) => (
                <li key={`${chip.key}-${chip.value}`}>
                  <button
                    type="button"
                    onClick={() => removeChip(chip, facetState, setFacetState)}
                    className="rounded-pill border border-line px-3 py-1 text-[0.8125rem] text-ink-muted transition-colors duration-300 hover:border-ink/40 hover:text-ink"
                  >
                    {chip.name} ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 grid gap-4">
            {response.items.length === 0 ? (
              <p className="rounded-card border border-dashed border-line p-8 text-center text-[0.9375rem] text-ink-muted">
                {copy.nothingMatches}
              </p>
            ) : (
              response.items.map((item) => (
                <ResultCard
                  key={item.id}
                  item={item}
                  slots={def.cardSlots}
                  copy={copy}
                  locale={locale}
                />
              ))
            )}
          </div>

          {pageCount > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <p className="text-[0.875rem] text-ink-muted">
                {fill(copy.showing, {
                  first: firstOnPage,
                  last: lastOnPage,
                  total: response.total,
                })}
              </p>

              {
                /*
                 * Buttons, inside the pagination's structure rather than its
                 * links. These change what is on screen; they do not go
                 * anywhere, and a link that navigates nowhere is a link a
                 * screen reader announces wrongly and a middle click breaks.
                 */
              }
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={response.page <= 1}
                      onClick={() => goToPage(response.page - 1)}
                    >
                      {copy.previousPage}
                    </Button>
                  </PaginationItem>

                  {pageNumbers(response.page, pageCount).map((entry, index) =>
                    entry === "gap" ? (
                      <PaginationItem key={`gap-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={entry}>
                        <Button
                          type="button"
                          variant={entry === response.page ? "outline" : "ghost"}
                          size="icon"
                          aria-current={entry === response.page ? "page" : undefined}
                          aria-label={fill(copy.pageNumber, { number: entry })}
                          onClick={() => goToPage(entry)}
                        >
                          {entry}
                        </Button>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={response.page >= pageCount}
                      onClick={() => goToPage(response.page + 1)}
                    >
                      {copy.nextPage}
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * The pages worth offering: the ends, and a window around where you are.
 *
 * Thirty results is three buttons and no decisions. Three hundred is
 * twenty-five, and a row of twenty-five numbers is not navigation — it is a
 * wall that happens to be clickable.
 */
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const pages = new Set<number>([1, total, current])
  if (current - 1 > 1) pages.add(current - 1)
  if (current + 1 < total) pages.add(current + 1)

  const ordered = [...pages].sort((a, b) => a - b)
  const out: (number | "gap")[] = []
  ordered.forEach((page, index) => {
    if (index > 0 && page - ordered[index - 1] > 1) out.push("gap")
    out.push(page)
  })
  return out
}

const SPAN: Record<number, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  12: "md:col-span-12",
}

/**
 * The fields worth showing, given what has been answered so far.
 *
 * A form that asks a question it will ignore is worse than one that asks
 * fewer: the reader has to work out that the greyed control is deliberate.
 */
function visibleFields(def: VerticalDef, form: FormState) {
  return def.form.filter((field) => {
    if (!field.showWhen) return true
    const held = form[field.showWhen.field]
    return typeof held === "string" && field.showWhen.equals.includes(held)
  })
}

/** A vertical's declared defaults, before the traveller touches anything. */
function seed(def: VerticalDef | undefined): FormState {
  if (!def) return {}
  const state: FormState = {}
  for (const field of def.form) {
    if (field.default !== undefined) {
      state[field.id] = field.default as FormState[string]
    } else if (field.kind === "rooms") {
      state[field.id] = [{ adults: 2, childAges: [] }]
    } else if (field.kind === "pax") {
      state[field.id] = [{ adults: 2, childAges: [] }]
    }
  }
  return state
}

/**
 * Form and facet state flatten into the same filter bag.
 *
 * A form field that names a facet is emitted under the facet's key, so the
 * engine treats "Bucharest, chosen in the form" and "Bucharest, ticked in the
 * rail" as the same selection. Without that the rail counts a dimension
 * against a choice it cannot see, and every other city reads as sold out.
 */
function toFilters(
  state: Record<string, unknown>,
  def?: VerticalDef,
): SearchQuery["filters"] {
  const filters: SearchQuery["filters"] = {}
  for (const [key, value] of Object.entries(state)) {
    if (value === undefined || value === "") continue
    /*
     * "Anytime" is an answer, not a filter. Passing the sentinel through once
     * the field was linked to its facet made two verticals search for a value
     * no row has, and both returned nothing before the traveller had touched
     * anything — which reads as an empty catalogue rather than as a bug.
     */
    if (value === ANY) continue
    if (Array.isArray(value) && value.length === 0) continue
    const field = def?.form.find((entry) => entry.id === key)
    filters[field?.facetKey ?? key] = value as SearchQuery["filters"][string]
  }
  return filters
}

interface Chip {
  key: string
  value: string
  name: string
}

function activeChips(state: FacetState, response: SearchResponse): Chip[] {
  const chips: Chip[] = []
  for (const facet of response.facets) {
    const value = state[facet.key]
    if (Array.isArray(value) && typeof value[0] === "string") {
      for (const entry of value as string[]) {
        const match = facet.values.find((candidate) => candidate.value === entry)
        chips.push({ key: facet.key, value: entry, name: match?.name ?? entry })
      }
    } else if (value === true) {
      chips.push({ key: facet.key, value: "true", name: facet.name })
    } else if (typeof value === "string" && value !== "") {
      /*
       * A range or a text box is as removable as a checkbox. Leaving it out of
       * the chip row means the only way to undo a price filter is to find the
       * slider again and drag it back to both ends, which nobody does — they
       * conclude the catalogue is small and leave.
       */
      chips.push({
        key: facet.key,
        value,
        name:
          facet.type === "range"
            ? `${facet.name}: ${value.replace("-", " – ")} €`
            : `${facet.name}: ${value}`,
      })
    }
  }
  return chips
}

function removeChip(
  chip: Chip,
  state: FacetState,
  setState: (next: FacetState) => void,
) {
  const value = state[chip.key]
  if (Array.isArray(value)) {
    setState({
      ...state,
      [chip.key]: (value as string[]).filter((entry) => entry !== chip.value),
    })
  } else {
    setState({ ...state, [chip.key]: undefined })
  }
}
