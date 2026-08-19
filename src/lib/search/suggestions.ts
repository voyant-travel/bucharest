/**
 * What the place fields offer before anyone types.
 *
 * Derived from the catalogue rather than authored, for one reason: a
 * suggestion the operator cannot sell is worse than no suggestion. A hand-kept
 * list drifts the first time a destination is dropped, and the traveller
 * discovers it by picking something that returns nothing — which reads as a
 * broken site rather than as a discontinued product.
 *
 * Where a facet already covers the dimension, its declared values are used
 * instead of the rows. A facet carries both the slug the filter matches on and
 * the name a person reads; rows carry only the slug, and a field offering
 * "bucharest" has told the traveller they are looking at a database.
 *
 * These are resolved on the server, once per vertical, and they are place names
 * — the same string in every language. What is *not* the same in every language
 * is the two-word note that says whether a suggestion is a country or a resort,
 * so that note travels as a key and the island spells it in the reader's
 * language. Sending the word itself from here would put an English note under a
 * Romanian field, which is the mixed page this whole pass exists to prevent.
 */
import type { Vertical } from "./contract"
import { CATALOGS } from "./data"

export interface Suggestion {
  value: string
  label: string
  /** A place the row already names — the country a resort sits in. */
  note?: string
  /** What the theme has to say itself, resolved against the reader's copy. */
  noteKey?: "country" | "countryOrRegion"
}

/** A row, seen only through the fields a place field cares about. */
interface PlaceRow {
  country?: string
  countries?: string[]
  destination?: string
  destinationCity?: string
  resort?: string
  region?: string
  area?: string
  city?: string
  originCity?: string
}

/** The facets that answer "where to", and "where from", per vertical. */
const DESTINATION_FACETS = ["destinations", "countries"]
const ORIGIN_FACETS = ["departures", "departure_ports"]

function fromFacet(vertical: Vertical, keys: string[]): Suggestion[] {
  const facets = CATALOGS[vertical]?.facets ?? []
  for (const key of keys) {
    const facet = facets.find((candidate) => candidate.key === key)
    if (facet?.values?.length) {
      return facet.values.map((entry) => ({
        value: entry.value,
        label: entry.name ?? entry.value,
      }))
    }
  }
  return []
}

function push(
  into: Map<string, Suggestion>,
  label: string | undefined,
  note?: Pick<Suggestion, "note" | "noteKey">,
) {
  if (!label) return
  const key = label.toLowerCase()
  if (into.has(key)) return
  into.set(key, { value: label, label, ...note })
}

/**
 * Places this vertical can be searched by.
 *
 * Broad first, specific second — a list that opens with forty resorts and
 * buries the six countries makes the common case the hard one. The resort
 * carries its country as a note, because "Belek" means nothing to someone who
 * has not already decided on Turkey.
 */
export function destinationsFor(vertical: Vertical): Suggestion[] {
  const declared = fromFacet(vertical, DESTINATION_FACETS)
  if (declared.length > 0) return declared

  const rows = (CATALOGS[vertical]?.items ?? []) as PlaceRow[]
  const broad = new Map<string, Suggestion>()
  const specific = new Map<string, Suggestion>()

  for (const row of rows) {
    /* A circuit crosses several countries, and each is a way to find it. */
    for (const country of row.countries ?? []) push(broad, country, { noteKey: "country" })
    push(broad, row.country ?? row.region, { noteKey: "countryOrRegion" })
    push(specific, row.resort ?? row.area ?? row.city ?? row.destinationCity, {
      note: row.country ?? row.region,
    })
  }

  /* A place already offered as a country should not reappear as a resort. */
  for (const key of broad.keys()) specific.delete(key)

  return [...broad.values(), ...specific.values()]
}

/** Where a journey can start. Only the verticals that ask carry one. */
export function originsFor(vertical: Vertical): Suggestion[] {
  const declared = fromFacet(vertical, ORIGIN_FACETS)
  if (declared.length > 0) return declared

  const rows = (CATALOGS[vertical]?.items ?? []) as PlaceRow[]
  const origins = new Map<string, Suggestion>()
  for (const row of rows) push(origins, row.originCity)
  return [...origins.values()]
}

/**
 * Both lists, keyed the way the form asks for them.
 *
 * The island looks up by field kind, so an origin field never offers a resort
 * and a destination field never offers a departure airport.
 */
export function suggestionsFor(vertical: Vertical): Record<string, Suggestion[]> {
  return {
    destination: destinationsFor(vertical),
    origin: originsFor(vertical),
  }
}
