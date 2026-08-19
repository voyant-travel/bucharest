/**
 * What makes one vertical different from another.
 *
 * The shell, the facet rail, the sort control, the chips, the mobile sheet and
 * the card are shared. A vertical contributes a definition: which fields its
 * form has, how its price should be read, and which sorts it offers. That is
 * roughly fifty lines per vertical rather than a fifth implementation of a
 * search page.
 *
 * The split is where the variation actually is. Dates alone take four
 * irreconcilable shapes across these five products — a range for stays, a date
 * plus a duration band for packages, a date pair with flexibility and a trip
 * type for flights, a set of months for cruises — so a single date component
 * would be wrong four times out of five. Traveller counts split two ways for
 * the same reason: rooms with a per-child age matter to a hotel and are
 * meaningless to a museum ticket.
 *
 * A definition names its words rather than spelling them. Every label here is a
 * lookup against the reader's dictionary, because a vertical is a merchandising
 * decision an operator makes once and a translation is a decision made per
 * language — writing "Departure city" into the definition would pin the whole
 * form to English the moment a Romanian publication renders it. What a
 * definition still spells out is the option *values*: a departure city slug and
 * a duration band are the operator's data, not the theme's vocabulary.
 */
import type { PriceBasis, Vertical } from "./contract"
import type { Copy, Labelled } from "./copy"

/** Every input the shared form primitives know how to render. */
export type FieldKind =
  | "destination"
  | "origin"
  | "date"
  | "dateRange"
  | "monthSet"
  | "durationBands"
  | "rooms"
  | "pax"
  | "select"
  | "toggle"
  | "text"

/**
 * The value a field carries when it is deliberately not filtering.
 *
 * "Anytime", "Any" — a select's first option is usually the absence of a
 * choice, and it has to be spelled somehow. Reserved rather than inferred: a
 * facet value legitimately called "any" would otherwise become unselectable.
 */
export const ANY = "any"

export interface FieldDef {
  id: string
  /**
   * The facet this field filters, when they are the same dimension.
   *
   * A departure-city field and a `departures` facet are one axis wearing two
   * names, and the engine cannot tell. Left unlinked, choosing Bucharest in
   * the form counts every other city to zero in the rail — the facet is being
   * counted against a selection it does not know it owns — and the traveller
   * is shown a catalogue that appears to have nothing else in it.
   */
  facetKey?: string
  kind: FieldKind
  label: (copy: Copy) => string
  placeholder?: (copy: Copy) => string
  required?: boolean
  /** `select` and `durationBands`. */
  options?: Labelled[]
  /** `date` — offer "± 3 days" beside it. */
  flexible?: boolean
  /** `rooms` / `pax` ceilings, past which the answer is a lead, not an error. */
  max?: { rooms?: number; perRoom?: number; total?: number }
  /** Shown when a ceiling is hit. An unsatisfiable search is a lead. */
  overflowPrompt?: (copy: Copy) => string
  /**
   * Only show this field while another field holds one of these values.
   *
   * A return date on a one-way flight is not a disabled field with an
   * explanation beside it — it is a field that should not be there. Explaining
   * an input's irrelevance costs a label, a hint and a greyed control; removing
   * it costs nothing and leaves the row shorter.
   */
  showWhen?: { field: string; equals: string[] }
  /** Column span in the desktop form row, out of 12. */
  span?: number
  default?: string | string[] | number | boolean
  help?: (copy: Copy) => string
}

/**
 * When the form's answers reach the query.
 *
 * `live` applies every keystroke and click immediately, which is right for
 * browsing a catalogue that is already loaded: the results are a filtered
 * view, and a button between the reader and a filtered view is a button that
 * does nothing.
 *
 * `explicit` waits for the submit. That is right where a search is a real
 * request — an availability and pricing call against dates, occupancy and
 * routes — because firing one on every keystroke is expensive for the
 * operator and jittery for the reader, who has not finished answering yet.
 *
 * Facets stay live in both: they refine a result set that already exists.
 */
export type SubmitMode = "live" | "explicit"

export interface VerticalDef {
  id: Vertical
  priceBasis: PriceBasis
  form: FieldDef[]
  /** Defaults to `live`; only set `explicit` where the query genuinely costs. */
  submit?: SubmitMode
  /** Which slots the card fills, in priority order, for this vertical. */
  cardSlots: (
    | "badge"
    | "eyebrow"
    | "image"
    | "title"
    | "place"
    | "classification"
    | "rating"
    | "inclusions"
    | "chips"
    | "otherDates"
  )[]
  /** Offered in the sort control, in order. First is the default. */
  sorts: { key: string; label: (copy: Copy) => string }[]
  /** A map panel is a peer view here, not a toggle. */
  mapMode?: "off" | "toggle" | "peer"
}

export type VerticalRegistry = Record<Vertical, VerticalDef>
