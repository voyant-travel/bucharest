import { useEffect, useState } from "react"

/**
 * Facet pills over a server-rendered grid.
 *
 * The cards are not re-rendered here. Astro has already written every entry
 * into the document — which is what a crawler and a reader with JavaScript
 * disabled get — and this island only shows and hides them. Rebuilding the
 * grid in React would mean shipping the card markup twice and losing the
 * listing entirely when the island fails to hydrate.
 */

type Props = {
  /** Facet values in the order they should appear. */
  facets: string[]
  allLabel?: string
  /** Element holding the cards; each card carries `data-facet`. */
  target: string
  countLabel?: string
}

export default function FilterBar({
  facets,
  allLabel = "All journeys",
  target,
  countLabel,
}: Props) {
  const [active, setActive] = useState<string | null>(null)
  const [visible, setVisible] = useState<number | null>(null)

  useEffect(() => {
    const container = document.querySelector(target)
    if (!container) return

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-facet]"),
    )
    let shown = 0

    for (const card of cards) {
      const values = (card.dataset.facet ?? "")
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean)
      const matches = active === null || values.includes(active)
      card.hidden = !matches
      if (matches) shown += 1
    }

    setVisible(shown)
  }, [active, target])

  return (
    <div className="flex flex-col gap-4">
      <div
        className="u-no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0"
        role="group"
        aria-label={allLabel}
      >
        <Pill active={active === null} onClick={() => setActive(null)}>
          {allLabel}
        </Pill>
        {facets.map((facet) => (
          <Pill
            key={facet}
            active={active === facet}
            onClick={() => setActive(active === facet ? null : facet)}
          >
            {facet}
          </Pill>
        ))}
      </div>

      {countLabel && visible !== null && (
        <p aria-live="polite" className="text-[0.8125rem] text-ink-subtle">
          {visible} {countLabel}
        </p>
      )}
    </div>
  )
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-pill border px-4 py-2.5 text-[0.8125rem] transition-all duration-300 ease-[var(--ease-out-expo)] ${
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-line bg-transparent text-ink-muted hover:border-ink/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  )
}
