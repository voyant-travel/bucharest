/**
 * One search implementation for six verticals.
 *
 * The whole point of the contract is that the results side of a travel search
 * is one thing, and this is where that claim is either true or a lie. Nothing
 * below knows what a board basis or an escale is: it intersects selections,
 * counts values, sorts, pages, and hands back the envelope. Everything
 * product-shaped arrives from the vertical's catalogue.
 *
 * Two rules do most of the work, and both are the standard the big OTAs set,
 * because a traveller arrives already trained by them:
 *
 * A facet counts against its siblings, never against itself. Ticking "Flight"
 * must not collapse "Coach" to zero — the other transport values are still
 * live alternatives to the choice just made, and a rail that zeroes them makes
 * the traveller believe they have exhausted the catalogue when they have only
 * narrowed it.
 *
 * Zero-count values stay. Dropping them looks tidier and is actively hostile:
 * a rail that silently loses "5 stars" when the price ceiling is too low leaves
 * the traveller unable to see which of their own choices emptied the page.
 *
 * The locale comes in with the query because the envelope going out carries
 * words: facet headings, value names, the label beside the cheapest sort. The
 * engine does not know any of them — it asks the dictionary the reader's
 * language resolves to, and the dataset says which entry to ask for.
 */
import type {
  Facet,
  FacetValue,
  ResultItem,
  SearchQuery,
  SearchResponse,
  SortOption,
} from "./contract"
import type { Copy } from "./copy"
import { copyFor, fill, labelOf } from "./copy"
import type { AnyCatalog, FacetSpec } from "./data/catalog"
import { CATALOGS } from "./data"
import { contains, money } from "./data/catalog"
import { VERTICALS } from "./verticals"

const DEFAULT_PER_PAGE = 12

type Row = unknown

/**
 * What the traveller has chosen on one facet, normalised.
 *
 * A selection arrives as an array from the rail, as a bare string off a URL
 * with one value, and as a boolean from a toggle. All three mean the same
 * thing, and the engine is the right place to stop caring which happened.
 */
function selectionOf(facet: FacetSpec<Row>, query: SearchQuery): string[] {
  const raw = query.filters[facet.key]
  if (raw === undefined || raw === null || raw === "") {
    // A text facet also answers to the query's own free-text field, so a
    // "Hotel" box and a `?q=` land in the same place.
    return facet.type === "text" && typeof query.q === "string" && query.q !== ""
      ? [query.q]
      : []
  }
  /*
   * Everything is coerced to a string on the way in. A selection arriving as a
   * number — a slider handing over `[430, 1100]` rather than `"430-1100"` —
   * used to reach `parseRange` and throw on `.split`, which unmounted the whole
   * search rather than ignoring one filter. A filter rail is not worth a blank
   * page, so the boundary is where the shape is made certain.
   */
  if (Array.isArray(raw)) {
    return raw.filter((value) => value !== "" && value != null).map(String)
  }
  if (typeof raw === "boolean") return raw ? ["true"] : []
  return [String(raw)]
}

/** `"200-900"`, the one token a slider, a URL and a chip can all carry. */
function parseRange(value: string): { min: number; max: number } {
  const [min, max] = value.split("-")
  return {
    min: min === undefined || min === "" ? Number.NEGATIVE_INFINITY : Number(min),
    max: max === undefined || max === "" ? Number.POSITIVE_INFINITY : Number(max),
  }
}

function matches(facet: FacetSpec<Row>, row: Row, selection: string[]): boolean {
  if (selection.length === 0) return true
  const first = selection[0] ?? ""
  if (facet.type === "range") {
    if (!facet.measure) return true
    const { min, max } = parseRange(first)
    const value = facet.measure(row)
    return value >= min && value <= max
  }
  if (facet.type === "text") {
    return facet.text ? contains(facet.text(row), first) : true
  }
  // Values inside one facet are alternatives, so they OR together; facets
  // themselves AND. Anything else and a two-value selection returns nothing.
  return facet.match ? selection.some((value) => facet.match?.(row, value)) : true
}

/**
 * The rows that survive every facet except one.
 *
 * Passing `undefined` gives the result set; passing a key gives the pool that
 * facet's own counts are computed against.
 */
function poolFor(
  rows: Row[],
  facets: FacetSpec<Row>[],
  selections: Map<string, string[]>,
  except: string | undefined,
): Row[] {
  return rows.filter((row) =>
    facets.every(
      (facet) =>
        facet.key === except || matches(facet, row, selections.get(facet.key) ?? []),
    ),
  )
}

function buildFacet(
  facet: FacetSpec<Row>,
  pool: Row[],
  selection: string[],
  price: (row: Row) => number,
  copy: Copy,
  locale: string,
): Facet {
  const shared = {
    key: facet.key,
    name: facet.name(copy),
    type: facet.type,
    ...(facet.expanded ? { expanded: true } : {}),
    ...(facet.searchable ? { searchable: true } : {}),
    ...(facet.truncateAt !== undefined ? { truncateAt: facet.truncateAt } : {}),
  }

  if (facet.type === "range") {
    const measure = facet.measure ?? price
    const measured = pool.map(measure)
    const selected = selection[0]
    return {
      ...shared,
      values: [],
      ...(measured.length > 0
        ? { min: Math.floor(Math.min(...measured)), max: Math.ceil(Math.max(...measured)) }
        : {}),
      ...(selected
        ? {
            values: [
              {
                value: selected,
                name: selected.replace("-", " – "),
                total: pool.filter((row) => matches(facet, row, [selected])).length,
                selected: true,
              },
            ],
          }
        : {}),
    }
  }

  if (facet.type === "text") {
    const term = selection[0]
    return {
      ...shared,
      values: term
        ? [
            {
              value: term,
              name: term,
              total: pool.filter((row) => matches(facet, row, [term])).length,
              selected: true,
            },
          ]
        : [],
    }
  }

  const values: FacetValue[] = (facet.values ?? []).map((spec) => {
    const matching = pool.filter((row) => facet.match?.(row, spec.value) ?? false)
    const hint = facet.hint?.(matching, copy)
    return {
      value: spec.value,
      name: labelOf(spec, copy, locale),
      // A hinted facet reports no count on purpose: the contract allows `null`
      // exactly where a total would be the wrong number to put in front of
      // someone, and the hint carries the information that changes the click.
      total: facet.hint ? null : matching.length,
      ...(hint ? { hint } : {}),
      ...(spec.parent ? { parent: spec.parent } : {}),
      ...(selection.includes(spec.value) ? { selected: true } : {}),
    }
  })

  return { ...shared, values }
}

export function search(query: SearchQuery, locale: string = "en"): SearchResponse {
  const copy = copyFor(locale)
  const catalog: AnyCatalog = CATALOGS[query.vertical]
  const definition = VERTICALS[query.vertical]
  const facets = catalog.facets as FacetSpec<Row>[]

  const base: Row[] = catalog.base
    ? catalog.items.filter((row: Row) => catalog.base?.(row, query) ?? true)
    : catalog.items

  const selections = new Map<string, string[]>(
    facets.map((facet) => [facet.key, selectionOf(facet, query)]),
  )

  const filtered = poolFor(base, facets, selections, undefined)

  const prices = filtered.map((row) => catalog.price(row))
  const cheapest = prices.length > 0 ? Math.min(...prices) : undefined

  const fallbackSort = definition.sorts[0]?.key ?? "recommended"
  const requested = query.sort
  const appliedSort =
    requested && catalog.compare[requested] !== undefined ? requested : fallbackSort
  const compare = catalog.compare[appliedSort]
  const sorted = compare ? [...filtered].sort(compare) : filtered

  const perPage = Math.max(1, Math.min(60, query.perPage ?? DEFAULT_PER_PAGE))
  const pages = Math.max(1, Math.ceil(sorted.length / perPage))
  const page = Math.max(1, Math.min(pages, query.page ?? 1))
  const items: ResultItem[] = sorted
    .slice((page - 1) * perPage, page * perPage)
    .map((row) => catalog.result(row, copy, locale))

  /**
   * The price floor is labelled on the cheapest sort rather than left to the
   * traveller to discover by switching to it — it is the one sort where the
   * answer is knowable before the click.
   */
  const sorts: SortOption[] = definition.sorts.map((sort) => ({
    key: sort.key,
    name: sort.label(copy),
    ...(cheapest !== undefined && (sort.key === "price_asc" || sort.key === "best")
      ? { label: fill(copy.from, { price: money(cheapest) }) }
      : {}),
  }))

  return {
    vertical: query.vertical,
    total: filtered.length,
    page,
    perPage,
    ...(cheapest !== undefined
      ? {
          priceFrom: {
            amount: cheapest,
            currency: "EUR",
            basis: definition.priceBasis,
          },
        }
      : {}),
    items,
    facets: facets.map((facet) =>
      buildFacet(
        facet,
        poolFor(base, facets, selections, facet.key),
        selections.get(facet.key) ?? [],
        catalog.price,
        copy,
        locale,
      ),
    ),
    sorts,
    appliedSort,
  }
}
