import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useMemo, useState } from "react"

import { Badge } from "~/components/ui/badge"
import { Input } from "~/components/ui/input"
import type { ShellData, ShellSection } from "~/lib/gallery"
import { overviewPath, variantPath } from "~/lib/gallery-paths"
import { cn } from "~/lib/utils"

interface Props {
  sections: ShellData["sections"]
  chrome: ShellData["chrome"]
  foundations: ShellData["foundations"]
  overviews: ShellData["overviews"]
  query: string
  activeSection?: string
  activeVariant?: string
  activeOverview?: string
}

/**
 * The navigation rail: everything the gallery can open, expanding to variants.
 *
 * Thing is to variant what a component is to a story — the thing is what
 * exists, the variant is one state worth looking at. Sections come from the
 * manifest, so that group needs no maintenance of its own.
 *
 * These are real links, not client-side state. A variant is a place, so
 * clicking one changes the address bar, works with the back button, and
 * survives being pasted into someone else's window.
 */
export function GalleryRail({
  sections,
  chrome,
  foundations,
  overviews,
  query,
  activeSection,
  activeVariant,
  activeOverview,
}: Props) {
  const [search, setSearch] = useState("")
  const [opened, setOpened] = useState<Record<string, boolean>>({})

  const term = search.trim().toLowerCase()
  const keep = (entry: ShellSection) =>
    !term || entry.id.includes(term) || entry.name.toLowerCase().includes(term)

  const foundationMatches = useMemo(
    () => foundations.filter(keep),
    [foundations, term],
  )
  const chromeMatches = useMemo(() => chrome.filter(keep), [chrome, term])
  const sectionMatches = useMemo(() => sections.filter(keep), [sections, term])

  const renderEntry = (entry: ShellSection) => {
    const current = entry.id === activeSection
    /* A search narrows to what you meant, so matches open themselves. */
    const open = term ? true : (opened[entry.id] ?? current)

    return (
      <li key={entry.id}>
        <button
          type="button"
          onClick={() => setOpened((prev) => ({ ...prev, [entry.id]: !open }))}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
            current && "font-medium text-primary",
          )}
          aria-expanded={open}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              !open && "-rotate-90",
            )}
          />
          <span className="truncate">{entry.name}</span>
        </button>

        {open && (
          <ul className="mb-1 ml-4 border-l pl-2">
            {entry.variants.map((variant) => (
              <li key={variant.id}>
                <a
                  href={`${variantPath(entry.id, variant.id)}?${query}`}
                  className={cn(
                    "block truncate rounded-md px-2 py-1 text-[13px] hover:bg-muted",
                    current &&
                      variant.id === activeVariant &&
                      "bg-primary/10 font-medium text-primary",
                  )}
                >
                  {variant.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2.5 border-b p-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-semibold">Theme gallery</h1>
          <span className="text-xs text-muted-foreground">
            {sections.length + chrome.length + foundations.length}
          </span>
        </div>
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Find anything"
          aria-label="Filter the gallery"
          className="h-8"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Overview
        </p>
        <ul className="mb-3">
          {overviews.map((overview) => (
            <li key={overview.id}>
              <a
                href={`${overviewPath(overview.id)}?${query}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                  overview.id === activeOverview &&
                    "bg-primary/10 font-medium text-primary",
                )}
              >
                {overview.label}
                {overview.hint && (
                  <span className="text-[10px] text-muted-foreground">
                    {overview.hint}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        {foundationMatches.length > 0 && (
          <>
            <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Foundations
            </p>
            <ul className="mb-3">{foundationMatches.map(renderEntry)}</ul>
          </>
        )}

        {/*
         * Chrome comes next, in its own group. The header and footer are
         * not sections — an operator never places them — but they are the two
         * pieces most likely to be wrong and hardest to catch, because on a
         * real page they are always someone else's backdrop.
         */}
        {chromeMatches.length > 0 && (
          <>
            <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Site chrome
            </p>
            <ul className="mb-3">{chromeMatches.map(renderEntry)}</ul>
          </>
        )}

        {sectionMatches.length > 0 && (
          <>
            <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Sections
            </p>
            <ul>{sectionMatches.map(renderEntry)}</ul>
          </>
        )}

        {sectionMatches.length === 0 &&
          chromeMatches.length === 0 &&
          foundationMatches.length === 0 && (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            Nothing matches “{search}”.
          </p>
        )}
      </div>

      <div className="border-t p-3">
        <Badge variant="secondary" className="font-mono text-[10px]">
          dev only
        </Badge>
      </div>
    </div>
  )
}
