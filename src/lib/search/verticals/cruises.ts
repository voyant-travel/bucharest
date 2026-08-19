/**
 * Cruises, searched by region and month.
 *
 * The destination is a closed list of sailing regions rather than a typeahead:
 * a cruise calls at five countries and belongs to none of them, so "the
 * Mediterranean" is the only answer that is true of the whole itinerary. Months
 * are a set because the flexible half of this audience is shopping shoulder
 * season and wants October or November, whichever is cheaper.
 *
 * The price footnote is not decoration. Every fare here is per person on double
 * occupancy, and a solo traveller pays a supplement that makes the headline
 * number unbuyable — so the basis travels with the price on the card, not in a
 * legal line at the bottom of the page.
 */
import type { VerticalDef } from "../definition"
import {
  CRUISE_DURATIONS,
  CRUISE_LINES,
  CRUISE_MONTHS,
  CRUISE_PORTS,
  CRUISE_REGIONS,
} from "../data/cruises"

export const cruises: VerticalDef = {
  id: "cruises",
  priceBasis: "per_person",
  form: [
    {
      id: "destination",
      kind: "select",
      label: (copy) => copy.fields.destination,
      span: 3,
      default: "any",
      options: [
        { value: "any", label: (copy) => copy.choices.anyRegion },
        ...CRUISE_REGIONS,
      ],
    },
    {
      id: "monthSet",
      kind: "monthSet",
      label: (copy) => copy.fields.departureMonth,
      span: 2,
      options: CRUISE_MONTHS,
    },
    {
      id: "duration",
      facetKey: "durations",
      kind: "durationBands",
      label: (copy) => copy.fields.duration,
      span: 2,
      default: "any",
      options: [
        { value: "any", label: (copy) => copy.choices.anyDuration },
        ...CRUISE_DURATIONS,
      ],
    },
    {
      id: "line",
      facetKey: "cruise_lines",
      kind: "select",
      label: (copy) => copy.fields.cruiseLine,
      span: 2,
      default: "any",
      options: [{ value: "any", label: (copy) => copy.choices.any }, ...CRUISE_LINES],
    },
    {
      id: "port",
      facetKey: "departure_ports",
      kind: "select",
      label: (copy) => copy.fields.departurePort,
      span: 2,
      default: "any",
      options: [{ value: "any", label: (copy) => copy.choices.any }, ...CRUISE_PORTS],
    },
    {
      id: "pax",
      kind: "pax",
      label: (copy) => copy.fields.passengers,
      span: 1,
      max: { total: 8 },
      overflowPrompt: (copy) => copy.prompts.groupQuote,
      default: 2,
      help: (copy) => copy.hints.doubleOccupancy,
    },
  ],
  cardSlots: [
    "badge",
    "image",
    "eyebrow",
    "title",
    "place",
    "inclusions",
    "chips",
    "otherDates",
  ],
  sorts: [
    { key: "recommended", label: (copy) => copy.sorts.recommended },
    { key: "price_asc", label: (copy) => copy.sorts.cheapest },
    { key: "price_desc", label: (copy) => copy.sorts.priciest },
    { key: "departure_asc", label: (copy) => copy.sorts.departureDate },
    { key: "duration_asc", label: (copy) => copy.sorts.duration },
  ],
  mapMode: "off",
}
