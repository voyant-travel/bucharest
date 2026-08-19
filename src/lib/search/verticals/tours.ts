/**
 * Escorted circuits.
 *
 * Nothing on this form is required. Circuit buyers browse — they know they want
 * ten days somewhere in autumn long before they know where — and every required
 * field would turn that into an empty state. The month select leads with
 * "Anytime" for the same reason, and it is a month rather than a date because a
 * circuit has four departures a season, not a calendar.
 *
 * There is deliberately no rating sort. A circuit's score would average a
 * coach, a guide and eleven hotels into one number that means nothing, and
 * offering it would invite a comparison the product cannot support. The sort
 * that matters instead is the departure date.
 */
import type { VerticalDef } from "../definition"
import { DEPARTURE_CITIES, TRANSPORT_TYPES } from "../data/packages"
import { TOUR_DURATIONS, TOUR_MONTHS } from "../data/tours"

export const tours: VerticalDef = {
  id: "tours",
  priceBasis: "per_person",
  form: [
    {
      id: "destination",
      kind: "destination",
      label: (copy) => copy.fields.destination,
      placeholder: (copy) => copy.placeholders.countryOrRoute,
      span: 3,
    },
    {
      id: "month",
      facetKey: "months",
      kind: "select",
      label: (copy) => copy.fields.departureMonth,
      span: 2,
      default: "any",
      options: [
        { value: "any", label: (copy) => copy.choices.anytime },
        ...TOUR_MONTHS,
      ],
    },
    {
      id: "departure",
      facetKey: "departures",
      kind: "select",
      label: (copy) => copy.fields.departureCity,
      span: 3,
      default: "any",
      options: [{ value: "any", label: (copy) => copy.choices.any }, ...DEPARTURE_CITIES],
    },
    {
      id: "transport",
      facetKey: "transport_types",
      kind: "select",
      label: (copy) => copy.fields.transport,
      span: 2,
      default: "any",
      options: [
        { value: "any", label: (copy) => copy.choices.any },
        ...TRANSPORT_TYPES.filter((entry) => entry.value !== "own"),
      ],
    },
    {
      id: "duration",
      facetKey: "durations",
      kind: "durationBands",
      label: (copy) => copy.fields.duration,
      span: 2,
      default: "any",
      options: TOUR_DURATIONS,
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
    { key: "departure_asc", label: (copy) => copy.sorts.departureDate },
    { key: "price_asc", label: (copy) => copy.sorts.cheapest },
    { key: "price_desc", label: (copy) => copy.sorts.priciest },
    { key: "duration_asc", label: (copy) => copy.sorts.duration },
  ],
  mapMode: "off",
}
