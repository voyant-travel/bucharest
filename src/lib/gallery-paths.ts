/**
 * Where the gallery lives, and how its state is spelled in a URL.
 *
 * Split out from `gallery.ts` because the React shell needs these and
 * `gallery.ts` imports `theme.config.ts` — importing one from the island would
 * pull the entire theme manifest into the browser bundle. Nothing here imports
 * anything, so both sides can use it freely.
 *
 * Navigation is path, presentation is query. Which section and which variant
 * you are looking at are places: linkable, meaningful in history, worth typing
 * from memory. Palette, corner style, stage width and setting overrides are
 * how that place is being displayed, so they stay in the query string where
 * dropping them changes nothing about what you are looking at.
 *
 * `overview` and `frame` are reserved first segments. No section id may
 * collide with them; `KNOWN_SECTIONS` contains neither, and one that did would
 * be shadowed by Astro's preference for static route segments.
 */

export function variantPath(section: string, variant: string): string {
  return `/dev/gallery/${section}/${variant}`
}

export function sectionPath(section: string): string {
  return `/dev/gallery/${section}`
}

export function overviewPath(mode: string): string {
  return `/dev/gallery/overview/${mode}`
}

export function framePath(section: string, variant: string): string {
  return `/dev/gallery/frame/${section}/${variant}`
}

export interface FrameState {
  palette: string
  corners: string
  stage: string
  grain: boolean
}

/**
 * What a frame needs to render itself.
 *
 * Stage is deliberately absent: the frame is told nothing about how wide its
 * container is, because the stage is the parent cropping the iframe, not
 * something the section should be able to read.
 */
export function frameQuery(
  frame: FrameState,
  overrides: Record<string, unknown> = {},
): string {
  const params = new URLSearchParams({
    palette: frame.palette,
    corners: frame.corners,
    grain: frame.grain ? "1" : "0",
  })
  for (const [id, value] of Object.entries(overrides)) {
    params.set(`s.${id}`, String(value))
  }
  return params.toString()
}

/**
 * What a link needs to preserve. Stage belongs here and not in `frameQuery`,
 * so moving between sections keeps the width you were reviewing at.
 */
export function navQuery(
  frame: FrameState,
  overrides: Record<string, unknown> = {},
): string {
  const params = new URLSearchParams(frameQuery(frame, overrides))
  params.set("stage", frame.stage)
  return params.toString()
}
