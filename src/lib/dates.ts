/**
 * Dates, in the reader's language.
 *
 * A departure publishes as an ISO day (`2026-05-14`). Printing that verbatim is
 * both ugly and ambiguous — `05/14` and `14/05` mean different things either
 * side of an ocean — so it is formatted through `Intl` against the
 * publication's locale, which is the same locale the rest of the page is
 * written in.
 *
 * Everything is formatted in UTC. A date-only string has no timezone, so
 * interpreting it in a local one moves a 14 May departure to 13 May for any
 * reader west of Greenwich. The Worker runs in UTC regardless; pinning it makes
 * that explicit rather than incidental.
 */

const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/

function parse(value: string): Date | undefined {
  const date = new Date(DAY_ONLY.test(value) ? `${value}T00:00:00Z` : value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}

/** One date. Falls back to the raw value rather than rendering nothing. */
export function formatDate(locale: string | undefined, value: string): string {
  const date = parse(value)
  if (!date) return value
  try {
    return new Intl.DateTimeFormat(locale || "en", OPTIONS).format(date)
  } catch {
    return new Intl.DateTimeFormat("en", OPTIONS).format(date)
  }
}

/**
 * A departure and its return as one phrase.
 *
 * `formatRange` collapses the shared parts the way each language expects — "14
 * – 21 May 2026" in English, "14–21 de mayo de 2026" in Spanish — which is the
 * whole reason to hand the job to `Intl` rather than joining two strings with
 * an arrow.
 */
export function formatDateRange(
  locale: string | undefined,
  from: string,
  to: string,
): string {
  const start = parse(from)
  const end = parse(to)
  if (!start || !end) return `${formatDate(locale, from)} – ${formatDate(locale, to)}`
  try {
    return new Intl.DateTimeFormat(locale || "en", OPTIONS).formatRange(start, end)
  } catch {
    return `${formatDate(locale, from)} – ${formatDate(locale, to)}`
  }
}
