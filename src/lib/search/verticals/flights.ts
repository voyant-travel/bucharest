/**
 * Bare flights.
 *
 * Trip type leads the form because it decides whether the return field means
 * anything, and a disabled field a traveller has already typed into is a bug
 * report. Both airports are required: a flight search without an origin is not
 * an under-specified search, it is a different product.
 *
 * "Direct flights only" sits on the form as well as in the rail. It is the one
 * filter people apply before they look at anything, and making them run a
 * search first to find it is a wasted round trip.
 */
import type { VerticalDef } from "../definition"
import { CABINS } from "../data/flights"

export const flights: VerticalDef = {
  id: "flights",
  priceBasis: "per_party",
  /* Live availability and fares per route, date and cabin — the most expensive query here, and the one nobody wants re-run mid-sentence. */
  submit: "explicit",
  form: [
    {
      id: "tripType",
      kind: "select",
      label: (copy) => copy.fields.tripType,
      span: 2,
      default: "round",
      options: [
        { value: "round", label: (copy) => copy.choices.roundTrip },
        { value: "oneway", label: (copy) => copy.choices.oneWay },
      ],
    },
    {
      id: "origin",
      kind: "origin",
      label: (copy) => copy.fields.from,
      placeholder: (copy) => copy.placeholders.city,
      required: true,
      span: 3,
    },
    {
      id: "destination",
      kind: "destination",
      label: (copy) => copy.fields.to,
      placeholder: (copy) => copy.placeholders.city,
      required: true,
      span: 3,
    },
    { id: "depart", kind: "date", label: (copy) => copy.fields.outbound, span: 2 },
    {
      id: "return",
      kind: "date",
      label: (copy) => copy.fields.inbound,
      span: 2,
      showWhen: { field: "tripType", equals: ["round"] },
    },
    {
      id: "pax",
      kind: "pax",
      label: (copy) => copy.fields.passengers,
      span: 2,
      max: { total: 9 },
      overflowPrompt: (copy) => copy.prompts.groupQuote,
      default: 1,
    },
    {
      id: "cabin",
      kind: "select",
      label: (copy) => copy.fields.cabin,
      span: 2,
      default: "economy",
      options: CABINS,
    },
    {
      id: "direct",
      kind: "toggle",
      label: (copy) => copy.fields.directOnly,
      span: 2,
      default: false,
    },
  ],
  /** No image slot: a stock photo of a wing has never sold a fare. */
  cardSlots: ["badge", "eyebrow", "title", "place", "chips", "inclusions"],
  sorts: [
    { key: "best", label: (copy) => copy.sorts.best },
    { key: "price_asc", label: (copy) => copy.sorts.cheapest },
    { key: "duration_asc", label: (copy) => copy.sorts.duration },
    { key: "departure_asc", label: (copy) => copy.sorts.departureTime },
  ],
  mapMode: "off",
}
