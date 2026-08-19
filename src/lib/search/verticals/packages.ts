/**
 * Charter packages — the product a Romanian operator lives on.
 *
 * Departure city is required and comes first, before the destination, because
 * it changes the price more than anything else on the form: the same hotel from
 * Cluj and from Bucharest are two different offers with two different charters.
 * The date carries a ±3 day option rather than a range, since charter rotations
 * are weekly and "the Saturday either side" is the real flexibility a traveller
 * has.
 */
import type { VerticalDef } from "../definition"
import { DEPARTURE_CITIES, PACKAGE_DURATIONS } from "../data/packages"

export const packages: VerticalDef = {
  id: "packages",
  priceBasis: "per_stay",
  /* Charter seats and hotel allocation are priced against the departure, the dates and the room composition; the call is real and it is slow. */
  submit: "explicit",
  form: [
    {
      id: "departure",
      facetKey: "departures",
      kind: "origin",
      label: (copy) => copy.fields.departureCity,
      placeholder: (copy) => copy.placeholders.whereFrom,
      required: true,
      span: 3,
      options: DEPARTURE_CITIES,
      default: "bucharest",
    },
    {
      id: "destination",
      kind: "destination",
      label: (copy) => copy.fields.destination,
      placeholder: (copy) => copy.placeholders.whereTo,
      required: true,
      span: 3,
    },
    {
      id: "date",
      kind: "date",
      label: (copy) => copy.fields.departureDate,
      flexible: true,
      span: 2,
      help: (copy) => copy.hints.flexibleDays,
    },
    {
      id: "duration",
      kind: "durationBands",
      label: (copy) => copy.fields.duration,
      span: 2,
      options: PACKAGE_DURATIONS,
      default: "7",
    },
    {
      id: "rooms",
      kind: "rooms",
      label: (copy) => copy.fields.roomsAndTravellers,
      span: 2,
      /**
       * Three rooms is where self-service stops being useful: a fourth room is
       * a group, and a group is quoted by a person, not by a form.
       */
      max: { rooms: 3, perRoom: 5 },
      overflowPrompt: (copy) => copy.prompts.tailoredQuote,
    },
  ],
  cardSlots: [
    "badge",
    "image",
    "eyebrow",
    "title",
    "place",
    "classification",
    "rating",
    "inclusions",
    "chips",
    "otherDates",
  ],
  sorts: [
    { key: "recommended", label: (copy) => copy.sorts.recommended },
    { key: "price_asc", label: (copy) => copy.sorts.cheapest },
    { key: "price_desc", label: (copy) => copy.sorts.priciest },
    { key: "rating_desc", label: (copy) => copy.sorts.topRated },
    { key: "departure_asc", label: (copy) => copy.sorts.departureDate },
  ],
  mapMode: "off",
}
