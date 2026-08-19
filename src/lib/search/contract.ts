/**
 * The shape of a travel search, across every vertical.
 *
 * One contract rather than five, because the *results* side of a travel search
 * genuinely is one thing: an operator running packages, stays, tours, cruises
 * and flights serves the same envelope for all of them — facets with labels,
 * values, counts and selection state, a sort list, a total, and a price floor.
 * What differs is the form that produces the query and the slots a card fills,
 * and those live in the per-vertical definitions rather than here.
 *
 * Facet descriptors are supplied by the response, never hard-coded in the
 * theme. That is what lets a `tags` facet gain a "Black Friday" value in
 * November without a theme release, and it is the only arrangement in which
 * counts can be honest — the theme cannot know how many results a value has
 * without asking.
 */

export type Vertical = "packages" | "tours" | "stays" | "activities" | "cruises" | "flights"

/** How a price should be read. Mixing these across one page is the classic tell. */
export type PriceBasis = "per_night" | "per_stay" | "per_person" | "per_party"

export type FacetType = "array" | "boolean" | "range" | "text"

export interface FacetValue {
  value: string
  name: string
  /** Live count. `null` where the vertical labels by price instead — see `hint`. */
  total: number | null
  /**
   * What a flight facet shows instead of a count: "from €189". A count is
   * useless on a stops filter; the cheapest fare is what changes the click.
   */
  hint?: string
  selected?: boolean
  /** Nesting, for ships under their cruise line. One level only. */
  parent?: string
}

export interface Facet {
  key: string
  name: string
  type: FacetType
  values: FacetValue[]
  /** `range` only. */
  min?: number
  max?: number
  /** Rendered open. Everything else starts collapsed. */
  expanded?: boolean
  /** Values past this collapse behind "see more". */
  truncateAt?: number
  /** A long tail — ships, ports — gets a filter box inside the facet. */
  searchable?: boolean
}

export interface SortOption {
  key: string
  name: string
  /** e.g. "from 51 €" beside "cheapest". */
  label?: string
}

/**
 * One result, as slots rather than fields.
 *
 * A package, a cabin and a museum ticket are not the same object, and modelling
 * them as one would mean a card component full of vertical conditionals. They
 * do occupy the same *slots*, so the card renders slots and each vertical
 * decides what goes in them.
 */
export interface ResultItem {
  id: string
  title: string
  href: string
  image?: { src: string; alt: string }
  /** Ribbon, top-left. "Recommended", "Bestseller". */
  badge?: string
  /** Above the title. A departure date, a category, a route. */
  eyebrow?: string
  /** Under the title. Resort and country, ports, airline. */
  place?: string
  /** Star or heart classification, 0–5. Some markets classify in hearts. */
  classification?: number
  rating?: { score: number; label: string; count: number }
  /** What the traveller is buying rather than assembling. */
  inclusions?: string[]
  /** Short chips: board, cancellation, duration. */
  chips?: string[]
  price: {
    amount: number
    currency: string
    basis: PriceBasis
    /** Struck through when a discount applies. */
    was?: number
    discountPct?: number
    /** "per person, two sharing" and friends. */
    footnote?: string
  }
  /** Same itinerary, other departures. Cruises and packages both need this. */
  otherDates?: number
  geo?: { lat: number; lng: number }
}

export interface SearchQuery {
  vertical: Vertical
  /** Free text, where the vertical has a query facet. */
  q?: string
  sort?: string
  page?: number
  perPage?: number
  /** Everything the form produced, plus everything the facet rail toggled. */
  filters: Record<string, string | string[] | boolean | number | undefined>
}

export interface SearchResponse {
  vertical: Vertical
  total: number
  page: number
  perPage: number
  /** "Prices from …" — the floor across the *filtered* set. */
  priceFrom?: { amount: number; currency: string; basis: PriceBasis }
  items: ResultItem[]
  facets: Facet[]
  sorts: SortOption[]
  appliedSort: string
}
