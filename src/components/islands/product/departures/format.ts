/**
 * The words and figures a departure is read in.
 *
 * Everything is formatted in UTC, for the same reason `~/lib/dates` is: a
 * departure publishes as a date-only string, and reading it in the browser's
 * timezone moves a 14 May departure to 13 May for every reader west of
 * Greenwich — on the one surface where a traveller checks the day twice.
 *
 * Every date here is formatted for the page's locale rather than for Romanian.
 * A hard-coded month list is invisible until the day the theme is published in
 * another language, and then it prints "mai" under an English heading with
 * nothing in the markup to explain why.
 */

const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** The instant a date-only string names, or nothing if it names none. */
export function parseDay(value: string): Date | undefined {
  const date = new Date(DAY_ONLY.test(value) ? `${value}T00:00:00Z` : value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Formatters are built once per locale and kept.
 *
 * A twenty-row table formats a weekday, a day and a barometer label per row;
 * constructing an `Intl.DateTimeFormat` for each of them is the single most
 * expensive thing this module could do on a phone, and it does it during the
 * scroll that reveals the island.
 */
const FORMATTERS = new Map<string, Intl.DateTimeFormat>()

function formatter(locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const tag = locale || "en"
  const key = `${tag}|${JSON.stringify(options)}`
  const cached = FORMATTERS.get(key)
  if (cached) return cached
  let made: Intl.DateTimeFormat
  try {
    made = new Intl.DateTimeFormat(tag, { ...options, timeZone: "UTC" })
  } catch {
    /* An operator can publish a locale tag ICU rejects. A table that throws
     * while printing a date is a worse answer than one printed in English. */
    made = new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" })
  }
  FORMATTERS.set(key, made)
  return made
}

/**
 * The twelve month chips of the filter header.
 *
 * Trailing full stops are dropped: ICU abbreviates some months and not others
 * ("ian.", "mai", "sept."), and a row of chips where half carry a full stop
 * reads as a rendering fault rather than as a season.
 */
export function monthsShort(locale: string | undefined): string[] {
  const short = formatter(locale, { month: "short" })
  return Array.from({ length: 12 }, (_, month) =>
    short.format(new Date(Date.UTC(2021, month, 15))).replace(/\.+$/, ""),
  )
}

/**
 * The weekday, capitalised.
 *
 * Romanian — like French, Spanish and Italian — writes weekdays lowercase in a
 * sentence, but this one is a label above a date rather than part of a
 * sentence, and a lowercase word at the top of a column reads as a typo.
 */
export function weekdayOf(value: string, locale: string | undefined): string {
  const date = parseDay(value)
  if (!date) return ""
  const word = formatter(locale, { weekday: "long" }).format(date)
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/** `14 mai 2026` in Romanian, `14 May 2026` in English — the locale's own form. */
export function formatDay(value: string, locale: string | undefined): string {
  const date = parseDay(value)
  if (!date) return value
  return formatter(locale, { day: "numeric", month: "short", year: "numeric" }).format(date)
}

/**
 * The two ends of a departure as one range.
 *
 * `formatRange` rather than two formatted dates and a dash: collapsing a shared
 * month or year is a per-language decision — English says "May 14 – 21, 2026",
 * Romanian "14–21 mai 2026" — and reimplementing that collapse by hand is how
 * the Romanian rule ends up printed under an English heading.
 */
export function formatDayRange(from: string, to: string, locale: string | undefined): string {
  const start = parseDay(from)
  const end = parseDay(to)
  if (!start || !end) return `${formatDay(from, locale)} – ${formatDay(to, locale)}`
  return formatter(locale, { day: "numeric", month: "short", year: "numeric" }).formatRange(
    start,
    end,
  )
}

export function monthOf(value: string): number | undefined {
  return parseDay(value)?.getUTCMonth()
}

export function yearOf(value: string): number | undefined {
  return parseDay(value)?.getUTCFullYear()
}

/**
 * A secondary money figure — a supplement, a barometer bar.
 *
 * The same `de-DE` grouping with no decimals as `PriceBlock`, which does not
 * export its formatter. Duplicated deliberately and only here: these are
 * figures beside a headline price, and one written `1,515.00 €` next to a
 * headline written `1.515 €` reads as two different numbers. It does not follow
 * the reader's language for the same reason — the theme prices in one shape
 * everywhere, and a total that regroups itself per locale invites the reader to
 * check whether the number changed too.
 */
export function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
