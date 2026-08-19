/**
 * The section types this release knows how to render.
 *
 * Kept beside the renderer rather than inline in the page, because the page
 * filters on it and the renderer switches on it, and the two silently
 * disagreeing means an operator places a section that renders as nothing with
 * no error anywhere. Adding a section is one entry here plus one branch in
 * `HomeSections.astro`.
 *
 * A type this build has never heard of is dropped rather than surfaced: a page
 * is served from a publication snapshot that may have been materialized
 * against a later release of this theme than the Worker running it, so an
 * unknown type is an ordinary consequence of two artifacts moving
 * independently — not an error worth breaking a page over.
 */
export const KNOWN_SECTIONS = [
  "hero",
  "travel-search",
  "feature-grid",
  "callout",
  "journey-cards",
  "destination-grid",
  "alternating-features",
  "stat-band",
  "testimonials",
  "quote-feature",
  "gallery",
  "steps",
  "faq",
  "logo-strip",
  "text-media",
  "prose",
  "newsletter",
  "contact-cards",
  "divider",
] as const

export type KnownSection = (typeof KNOWN_SECTIONS)[number]

export function isKnownSection(type: string): type is KnownSection {
  return (KNOWN_SECTIONS as readonly string[]).includes(type)
}

/**
 * Section types that open a page with a full-bleed photograph.
 *
 * The header may only sit over the page when the first section is one of
 * these and actually carries an image; over anything else it would be white
 * type on the ivory canvas.
 */
export function opensFullBleed(type: string, settings: Record<string, unknown>): boolean {
  if (type !== "hero") return false
  const image = settings.image
  return typeof image === "string" && image.trim() !== ""
}
