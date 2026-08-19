import type { ResultItem } from "~/lib/search/contract"
import type { Copy } from "~/lib/search/copy"
import { counted, fill } from "~/lib/search/copy"
import { cn } from "~/lib/utils"

/**
 * How a price should be read, said out loud.
 *
 * Never inferred and never omitted. A hotel priced per night beside a package
 * priced per stay beside a cruise priced per person double-occupancy is the
 * single most common tell of a naive travel build — the numbers look
 * comparable and are not, and the traveller discovers it at checkout.
 */
/**
 * A price, written the way the rest of the theme writes prices.
 *
 * `de-DE` with `style: "currency"`, matching the product pages exactly. The
 * obvious `ro-RO` renders the euro as the letters "EUR", so the same fare read
 * "890 EUR" on a result card and "890 €" on the page it linked to — one theme
 * quoting one product two ways, which reads as two different systems.
 *
 * An unrecognised currency code degrades to the number beside the raw code
 * rather than throwing: a card is not worth losing over a currency this build
 * has never heard of.
 */
function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(amount)} ${currency}`
  }
}

interface Props {
  item: ResultItem
  /** Which slots this vertical fills. A cabin has no star rating; a hotel has. */
  slots: string[]
  /**
   * The reader's words. The card invents very little — the row supplies the
   * proper nouns and the sentences around them are the theme's — but the two it
   * does own, the price basis and the call to action, are the two a traveller
   * has to read in their own language to act on.
   */
  copy: Copy
  locale: string
}

export function ResultCard({ item, slots, copy, locale }: Props) {
  const has = (slot: string) => slots.includes(slot)

  return (
    <article className="group grid overflow-hidden rounded-card border border-line bg-surface transition-colors duration-500 hover:border-ink/25 md:grid-cols-[minmax(0,17rem)_1fr]">
      {has("image") && item.image && (
        <a href={item.href} className="u-frame relative aspect-[4/3] md:aspect-auto md:h-full">
          <img
            src={item.image.src}
            alt={item.image.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {has("badge") && item.badge && (
            <span className="absolute left-3 top-3 rounded-pill bg-canvas/92 px-3 py-1 text-[0.6875rem] uppercase tracking-[0.08em] text-ink backdrop-blur">
              {item.badge}
            </span>
          )}
        </a>
      )}

      <div className="flex flex-col gap-3 p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {has("eyebrow") && item.eyebrow && (
            <p className="u-eyebrow text-ink-subtle">{item.eyebrow}</p>
          )}
          {has("classification") && item.classification ? (
            <p
              className="text-[0.8125rem] text-brass"
              aria-label={fill(copy.classification, { count: item.classification })}
            >
              {"♥".repeat(item.classification)}
            </p>
          ) : null}
        </div>

        <h3 className="u-display-sm text-[1.1875rem] leading-snug md:text-[1.3125rem]">
          <a href={item.href} className="transition-opacity duration-300 hover:opacity-70">
            {item.title}
          </a>
        </h3>

        {has("place") && item.place && (
          <p className="text-[0.875rem] text-ink-muted">{item.place}</p>
        )}

        {has("rating") && item.rating && (
          <div className="flex items-center gap-2.5">
            <span className="rounded-card bg-accent px-2 py-1 text-[0.8125rem] font-medium tabular-nums text-accent-ink">
              {item.rating.score.toFixed(1)}
            </span>
            <span className="text-[0.8125rem] text-ink-muted">
              {item.rating.label}
              <span className="text-ink-subtle">
                {" · "}
                {counted(locale, copy.plurals.reviews, item.rating.count)}
              </span>
            </span>
          </div>
        )}

        {has("inclusions") && item.inclusions?.length ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-ink-muted">
            {item.inclusions.map((inclusion) => (
              <li key={inclusion} className="before:mr-1.5 before:content-['✓']">
                {inclusion}
              </li>
            ))}
          </ul>
        ) : null}

        {has("chips") && item.chips?.length ? (
          <ul className="flex flex-wrap gap-2">
            {item.chips.map((chip) => (
              <li
                key={chip}
                className="rounded-pill border border-line px-2.5 py-1 text-[0.75rem] text-ink-subtle"
              >
                {chip}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-2">
          <div>
            {item.price.discountPct ? (
              <p className="flex items-center gap-2">
                <span className="rounded-card bg-accent-wash px-2 py-0.5 text-[0.75rem] font-medium text-accent">
                  −{item.price.discountPct}%
                </span>
                {item.price.was && (
                  <span className="text-[0.8125rem] text-ink-subtle line-through tabular-nums">
                    {money(item.price.was, item.price.currency)}
                  </span>
                )}
              </p>
            ) : null}
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="u-display-sm text-[1.375rem] tabular-nums">
                {money(item.price.amount, item.price.currency)}
              </span>
              <span className="text-[0.8125rem] text-ink-subtle">
                {copy.basis[item.price.basis]}
              </span>
            </p>
            {item.price.footnote && (
              <p className="text-[0.75rem] text-ink-subtle">{item.price.footnote}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {has("otherDates") && item.otherDates ? (
              <a
                href={item.href}
                className="text-[0.8125rem] text-ink-subtle underline underline-offset-2 hover:text-ink"
              >
                {counted(locale, copy.plurals.moreDates, item.otherDates)}
              </a>
            ) : null}
            <a
              href={item.href}
              className={cn(
                "inline-flex h-11 items-center rounded-pill bg-accent px-6 text-[0.875rem] font-medium text-accent-ink",
                "transition-colors duration-300 hover:bg-accent-hover",
              )}
            >
              {copy.viewOffer}
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
