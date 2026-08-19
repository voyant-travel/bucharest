/**
 * The groups this index can actually show, and the anchors they answer to.
 *
 * Resolved once, at the top of the page, so the jump bar and the sections it
 * points at are literally the same list. Deriving an anchor in the nav and
 * again in the section is how the two drift apart: one of them starts trimming
 * differently, the links keep rendering, and nothing happens when the reader
 * clicks — on a page that is mostly photographs they cannot even see that
 * nothing happened. `groupSlug` comes from the reader for the same reason, so
 * anything else that ever links into a region agrees with this page.
 *
 * Everything is filtered again here even though the reader already filters.
 * This template is handed a `DestinationIndex`, not necessarily one that came
 * out of `readDestinationIndex` — a fixture, a preview payload or a future
 * caller can hand it a region with nothing left in it, and that must produce a
 * shorter page rather than an empty heading.
 */
import {
  groupSlug,
  type DestinationIndex,
  type IndexedDestination,
} from "~/lib/destination-index"

export interface IndexGroup {
  /** The `grup-…` anchor, unique across the page. */
  id: string
  name: string
  destinations: IndexedDestination[]
}

const filled = (value: string | undefined): boolean => Boolean(value?.trim())

export function indexGroups(
  groups: DestinationIndex["groups"] | undefined,
): IndexGroup[] {
  /*
   * Anchors are claimed as they are handed out. Two regions can reduce to the
   * same slug — "Asia" and "Asia.", two names differing only in a diacritic, or
   * any two that `groupSlug` falls back to "grup" for — and duplicate ids do
   * not fail loudly: the browser silently scrolls to whichever came first, so
   * the second half of the jump bar quietly stops working.
   */
  const claimed = new Set<string>()

  return (groups ?? []).flatMap((group) => {
    const name = group?.name?.trim()
    const destinations = (group?.destinations ?? []).filter(
      (row) => filled(row?.title) && filled(row?.href),
    )

    /*
     * An empty region is dropped rather than rendered as a heading over
     * nothing. A heading with no cards under it reads as a failed import, and
     * it would also put a link in the jump bar that scrolls to blank canvas.
     */
    if (!name || destinations.length === 0) return []

    const base = groupSlug(name)
    let id = `grup-${base}`
    for (let suffix = 2; claimed.has(id); suffix += 1) id = `grup-${base}-${suffix}`
    claimed.add(id)

    return [{ id, name, destinations }]
  })
}
