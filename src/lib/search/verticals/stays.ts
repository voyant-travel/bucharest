/**
 * Accommodation, booked the way every hotel site has trained people to book it.
 *
 * Destination and dates are both required because a per-night price without a
 * stay length is not a price, and the range is capped at fourteen nights: past
 * that a hotel quotes a long-stay rate by hand, and a form that accepts the
 * request without honouring it is worse than one that stops.
 *
 * Children are collected with ages, not as a count. Age decides whether a child
 * is free, half price or a third adult, and asking later — at checkout, once
 * the price has been shown — is how a booking flow earns a complaint.
 */
import type { VerticalDef } from "../definition"

export const stays: VerticalDef = {
  id: "stays",
  priceBasis: "per_night",
  /* Priced per night against dates and occupancy, including each child's age — the same availability call as a package, and the same reason to wait. */
  submit: "explicit",
  form: [
    {
      id: "destination",
      kind: "destination",
      label: (copy) => copy.fields.destination,
      placeholder: (copy) => copy.placeholders.whereTo,
      required: true,
      span: 4,
    },
    {
      id: "dates",
      kind: "dateRange",
      label: (copy) => copy.fields.checkInOut,
      required: true,
      span: 4,
      max: { total: 14 },
      help: (copy) => copy.hints.maxNights,
    },
    {
      id: "rooms",
      kind: "rooms",
      label: (copy) => copy.fields.roomsAndGuests,
      span: 3,
      max: { rooms: 3, perRoom: 5 },
      overflowPrompt: (copy) => copy.prompts.tailoredQuote,
      help: (copy) => copy.hints.childAges,
    },
    {
      id: "pets",
      kind: "toggle",
      label: (copy) => copy.fields.pets,
      span: 1,
      default: false,
    },
  ],
  cardSlots: [
    "badge",
    "image",
    "title",
    "place",
    "classification",
    "rating",
    "chips",
    "inclusions",
  ],
  sorts: [
    { key: "recommended", label: (copy) => copy.sorts.recommended },
    { key: "price_asc", label: (copy) => copy.sorts.cheapest },
    { key: "price_desc", label: (copy) => copy.sorts.priciest },
    { key: "rating_desc", label: (copy) => copy.sorts.topRated },
    { key: "classification_desc", label: (copy) => copy.sorts.classification },
  ],
  /** The map answers "how far from the old town" — useful, but not the page. */
  mapMode: "toggle",
}
