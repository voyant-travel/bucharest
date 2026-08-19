import type { PriceBasis } from "~/lib/search/contract"

/**
 * The words `PriceBlock` supplies itself.
 *
 * Everything an operator writes arrives translated; these few labels do not,
 * because the component invents them — the basis suffix beside a figure, and
 * the four sentences it prints when there is no figure to show. They live
 * beside the component rather than in `~/lib/messages` for the same reason each
 * product module keeps its own formatter: they are decisions about one surface,
 * and a shared dictionary invites a second surface to reword them.
 *
 * English is the source of truth. Every other language is a translation of it,
 * and a language this file does not carry falls back to English rather than
 * rendering a key — an operator publishing in a language nobody has translated
 * this theme into should get a working price, not a page reading `basis`.
 */
export interface Copy {
  /** What the figure counts. The same words the search result card uses. */
  basis: Record<PriceBasis, string>
  /** Announced while the figure is a pulsing bar, which reads as nothing. */
  checking: string
  /** Before a date is chosen: there is no price yet, and why. */
  needsDate: string
  /** The operator answered, and the answer was no. */
  unavailable: string
  /** Nobody answered at all. Deliberately not the same sentence as above. */
  failed: string
  /** `{phone}` — the one route that still works when the price does not. */
  call: string
  /** The hedge before an indicative figure. Goes the moment one is chosen. */
  from: string
}

export const EN: Copy = {
  basis: {
    per_night: "/ night",
    per_stay: "/ stay",
    per_person: "/ person",
    per_party: "total",
  },
  checking: "Checking the price",
  needsDate: "Choose a date to see the price",
  unavailable: "Not available for your selection",
  failed: "Prices cannot be shown right now.",
  call: "Call {phone}",
  from: "from",
}

export const RO: Copy = {
  basis: {
    per_night: "/ noapte",
    per_stay: "/ sejur",
    per_person: "/ persoană",
    per_party: "total",
  },
  checking: "Se verifică prețul",
  needsDate: "Alege o dată ca să vezi prețul",
  unavailable: "Nu este disponibil pentru selecția ta",
  failed: "Prețurile nu pot fi afișate acum.",
  call: "Sună la {phone}",
  from: "de la",
}

const DICTIONARIES: Record<string, Copy> = { en: EN, ro: RO }

/**
 * The language subtag, lowercased.
 *
 * A publication may be `en-GB`, `ro-RO` or `de-AT`; these labels do not differ
 * by region, so they are keyed by language alone. Matches the resolver in
 * `src/lib/messages.ts` — two conventions would mean two places to forget a
 * string.
 */
function language(locale: string | undefined): string {
  return typeof locale === "string" ? (locale.split("-")[0] ?? "en").toLowerCase() : "en"
}

export function copyFor(locale: string | undefined): Copy {
  return DICTIONARIES[language(locale)] ?? EN
}
