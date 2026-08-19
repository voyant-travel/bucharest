/**
 * Where a booking actually happens.
 *
 * Not here. Bookings are taken by the managed booking engine on the Voyant
 * platform, and this theme's job is to hand the reader over to it with enough
 * context that they do not have to re-answer questions the page already knows
 * the answers to. That is a deliberate division: taking card details, holding
 * inventory and honouring a cancellation window are not things a theme should
 * reimplement per operator, and an inline form that looks like a checkout but
 * is not one is worse than an honest link out.
 *
 * The consequence for every CTA in this theme: it is a link, not a submit. It
 * has an href a reader can middle-click, copy, or open in a new tab, and it
 * survives JavaScript failing to load.
 */

/** What the engine needs to know about the product being handed over. */
export interface BookingTarget {
  /** The operator's booking-engine base URL. Absent means it is not set up. */
  base?: string | undefined
  productId: string
  productSlug: string
}

/**
 * A selection, in whatever detail the reader has given it.
 *
 * Deliberately loose: a departure page knows a departure id, a hotel knows a
 * room and a rate, an experience knows a date and a time slot. Undefined and
 * empty values are dropped rather than sent as blanks, so the engine can tell
 * "not chosen" from "chosen as nothing".
 */
export type BookingSelection = Record<string, string | number | undefined | null>

/**
 * The URL to send a reader to, or `undefined` when there is nowhere to send
 * them.
 *
 * Returning `undefined` rather than "#" or the current page is the point: a
 * caller has to decide what to show when an operator has not configured a
 * booking engine, and the honest answers are an enquiry route or a phone
 * number — not a button that looks live and goes nowhere.
 */
export function bookingHref(
  target: BookingTarget,
  selection: BookingSelection = {},
): string | undefined {
  const base = target.base?.trim()
  if (!base) return undefined

  let url: URL
  try {
    url = new URL(base)
  } catch {
    /*
     * A misconfigured setting must not throw during render and take the whole
     * page down with it. A product page that still reads is worth more than a
     * stack trace about a URL an operator can fix in the editor.
     */
    return undefined
  }

  url.searchParams.set("product", target.productId)
  url.searchParams.set("slug", target.productSlug)
  for (const [key, value] of Object.entries(selection)) {
    if (value === undefined || value === null || value === "") continue
    url.searchParams.set(key, String(value))
  }
  return url.toString()
}
