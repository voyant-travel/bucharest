/**
 * Things to do, sold as tickets.
 *
 * The date is optional and defaults to "anytime". Most of this stock runs
 * daily, and a required date would hide the entire catalogue from someone who
 * has not booked the flight yet — which is precisely when they are browsing.
 *
 * Travellers are counted flat. Four people on a walking tour are four tickets;
 * there is no room to put them in, and borrowing the hotel occupancy control
 * would ask a question the product cannot use.
 */
import type { VerticalDef } from "../definition"

export const activities: VerticalDef = {
  id: "activities",
  priceBasis: "per_person",
  form: [
    {
      id: "destination",
      kind: "destination",
      label: (copy) => copy.fields.where,
      placeholder: (copy) => copy.placeholders.where,
      required: true,
      span: 4,
    },
    {
      id: "dates",
      kind: "dateRange",
      label: (copy) => copy.fields.when,
      span: 3,
      default: "anytime",
      help: (copy) => copy.hints.anytimeIfFlexible,
    },
    {
      id: "pax",
      kind: "pax",
      label: (copy) => copy.fields.participants,
      span: 2,
      max: { total: 12 },
      overflowPrompt: (copy) => copy.prompts.groupQuote,
      default: 2,
    },
    {
      id: "q",
      kind: "text",
      label: (copy) => copy.fields.search,
      placeholder: (copy) => copy.placeholders.whatToDo,
      span: 3,
    },
  ],
  cardSlots: ["badge", "image", "eyebrow", "title", "place", "rating", "chips", "inclusions"],
  sorts: [
    { key: "recommended", label: (copy) => copy.sorts.recommended },
    { key: "rating_desc", label: (copy) => copy.sorts.topRated },
    { key: "price_asc", label: (copy) => copy.sorts.cheapest },
    { key: "price_desc", label: (copy) => copy.sorts.priciest },
    { key: "duration_asc", label: (copy) => copy.sorts.duration },
  ],
  /**
   * Here the map is a peer view, not an overlay: what is walkable from the hotel
   * tonight is the whole question, and answering it in a drawer over the results
   * makes the traveller choose between the two things they need at once.
   */
  mapMode: "peer",
}
