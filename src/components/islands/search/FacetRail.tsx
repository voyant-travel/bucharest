import { useState } from "react"

import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Slider } from "~/components/ui/slider"
import { Switch } from "~/components/ui/switch"
import type { Facet } from "~/lib/search/contract"
import type { Copy } from "~/lib/search/copy"
import { fill } from "~/lib/search/copy"
import { cn } from "~/lib/utils"

export type FacetState = Record<string, string[] | boolean | number[] | string | undefined>

interface Props {
  facets: Facet[]
  state: FacetState
  onChange: (key: string, value: FacetState[string]) => void
  onReset: () => void
  /**
   * The reader's words. Facet headings and value names arrive already resolved
   * on the response — the rail only supplies its own chrome, and the search
   * shell hands it the same dictionary the response was built with.
   */
  copy: Copy
}

/**
 * The filter rail.
 *
 * It renders whatever the response describes and knows nothing about which
 * vertical it is filtering. That is deliberate: the moment the theme hard-codes
 * a facet list, a value the operator adds in November — a Black Friday tag, a
 * new departure city — needs a theme release before anyone can filter by it.
 */
export function FacetRail({ facets, state, onChange, onReset, copy }: Props) {
  const active = countActive(state)

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="u-display-sm text-[1.125rem]">{copy.filters}</h2>
        {active > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[0.8125rem] text-ink-subtle underline underline-offset-2 hover:text-ink"
          >
            {copy.clearFilters}
          </button>
        )}
      </div>

      {facets.map((facet) => (
        <FacetBlock
          key={facet.key}
          facet={facet}
          value={state[facet.key]}
          onChange={(next) => onChange(facet.key, next)}
          copy={copy}
        />
      ))}
    </div>
  )
}

export function countActive(state: FacetState): number {
  return Object.values(state).filter((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  ).length
}

function FacetBlock({
  facet,
  value,
  onChange,
  copy,
}: {
  facet: Facet
  value: FacetState[string]
  onChange: (next: FacetState[string]) => void
  copy: Copy
}) {
  const [open, setOpen] = useState(facet.expanded ?? false)
  const [showAll, setShowAll] = useState(false)
  const [needle, setNeedle] = useState("")

  const chosen = Array.isArray(value) ? (value as string[]) : []

  const matching = facet.searchable && needle
    ? facet.values.filter((entry) =>
        entry.name.toLowerCase().includes(needle.toLowerCase()),
      )
    : facet.values

  const limit = facet.truncateAt ?? 8
  const visible = showAll || matching.length <= limit ? matching : matching.slice(0, limit)

  return (
    <section className="border-t border-line pt-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="u-eyebrow text-ink-subtle">{facet.name}</span>
        <span className="text-ink-subtle">{open ? "–" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4">
          {facet.type === "boolean" && (
            <div className="flex items-center gap-2.5">
              <Switch
                id={`facet-${facet.key}`}
                checked={value === true}
                onCheckedChange={(next) => onChange(Boolean(next) || undefined)}
              />
              <Label htmlFor={`facet-${facet.key}`} className="text-[0.875rem] text-ink-muted">
                {facet.values[0]?.name ?? facet.name}
              </Label>
            </div>
          )}

          {facet.type === "range" && (
            <RangeFacet facet={facet} value={value} onChange={onChange} />
          )}

          {facet.type === "text" && (
            <Input
              value={typeof value === "string" ? value : ""}
              placeholder={facet.values[0]?.name ?? copy.facetSearch}
              onChange={(event) => onChange(event.target.value || undefined)}
              className="h-10 rounded-card border-line bg-surface"
            />
          )}

          {facet.type === "array" && (
            <>
              {facet.searchable && (
                <Input
                  value={needle}
                  placeholder={copy.facetSearch}
                  onChange={(event) => setNeedle(event.target.value)}
                  className="mb-3 h-9 rounded-card border-line bg-surface text-[0.8125rem]"
                />
              )}

              <ul className="space-y-2.5">
                {visible.map((entry) => {
                  const id = `facet-${facet.key}-${entry.value}`
                  const checked = chosen.includes(entry.value)
                  /*
                   * A value that would return nothing stays on screen, greyed
                   * rather than removed. Silently dropping it leaves the reader
                   * unable to see why their combination is empty, and unable to
                   * work out which choice to undo.
                   */
                  const empty = entry.total === 0 && !checked

                  return (
                    <li
                      key={entry.value}
                      className={cn(
                        "flex items-center gap-2.5",
                        entry.parent && "ml-4",
                        empty && "opacity-45",
                      )}
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        disabled={empty}
                        onCheckedChange={(next) =>
                          onChange(
                            next
                              ? [...chosen, entry.value]
                              : chosen.filter((item) => item !== entry.value),
                          )
                        }
                      />
                      <Label
                        htmlFor={id}
                        className="flex flex-1 items-baseline justify-between gap-3 text-[0.875rem] font-normal text-ink-muted"
                      >
                        <span className={cn(empty && "line-through")}>{entry.name}</span>
                        <span className="text-[0.75rem] text-ink-subtle tabular-nums">
                          {entry.hint ?? (entry.total !== null ? entry.total : "")}
                        </span>
                      </Label>
                    </li>
                  )
                })}
              </ul>

              {matching.length > limit && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="mt-3 text-[0.8125rem] text-ink-subtle underline underline-offset-2 hover:text-ink"
                >
                  {showAll
                    ? copy.showFewer
                    : fill(copy.showMore, { count: matching.length - limit })}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

function RangeFacet({
  facet,
  value,
  onChange,
}: {
  facet: Facet
  value: FacetState[string]
  onChange: (next: FacetState[string]) => void
}) {
  const min = facet.min ?? 0
  const max = facet.max ?? 100

  /*
   * A range travels as one `"430-1100"` token, because that is the only shape
   * a slider, a URL and a removable chip can all carry. The slider wants two
   * numbers, so the parsing happens here rather than leaking a second
   * representation into the query.
   */
  const current = parseToken(value, min, max)

  return (
    <div>
      <Slider
        value={current}
        min={min}
        max={max}
        onValueChange={(next: number | readonly number[]) => {
          const [lo, hi] = Array.isArray(next) ? next : [min, next as number]
          /* The full span is not a filter; sending it would pin a chip that
           * removes nothing and count as an active filter forever. */
          onChange(lo <= min && hi >= max ? undefined : `${Math.round(lo)}-${Math.round(hi)}`)
        }}
      />
      <div className="mt-3 flex items-center justify-between text-[0.8125rem] text-ink-subtle tabular-nums">
        <span>{Math.round(current[0])} €</span>
        <span>{Math.round(current[1])} €</span>
      </div>
    </div>
  )
}

/** `"430-1100"` back into the two numbers the slider needs. */
export function parseToken(
  value: FacetState[string],
  min: number,
  max: number,
): [number, number] {
  if (typeof value !== "string" || !value.includes("-")) return [min, max]
  const [lo, hi] = value.split("-")
  const low = Number(lo)
  const high = Number(hi)
  return [
    Number.isFinite(low) ? low : min,
    Number.isFinite(high) ? high : max,
  ]
}
