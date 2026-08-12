/**
 * The presentation vocabulary sections share.
 *
 * Reading a setting is `src/lib/sections.ts`'s job — it is the layer that
 * knows about stega provenance, and every value that reaches the page goes
 * through it. This module is the layer above: it turns the handful of choices
 * that recur on almost every section — a background, a vertical rhythm — into
 * the same classes everywhere, which is what keeps an accent band against a
 * sunken band against the canvas reading as one page rather than a stack of
 * unrelated components.
 */
import { choiceSetting, type SectionSettings } from "./sections"

export const TONES = ["canvas", "surface", "sunk", "accent", "accent-wash"] as const
export type Tone = (typeof TONES)[number]

export const SPACINGS = ["regular", "tight", "roomy", "flush"] as const
export type Spacing = (typeof SPACINGS)[number]

/**
 * On an accent background the neutral tokens are re-pointed at the accent's
 * own foreground, so a hairline and a muted paragraph stay legible without a
 * single component branching on the tone it happens to be sitting in.
 */
export function toneClass(tone: Tone): string {
  switch (tone) {
    case "surface":
      return "bg-surface text-ink"
    case "sunk":
      return "bg-surface-sunk text-ink"
    case "accent":
      return "bg-accent text-accent-ink [--line:color-mix(in_oklab,var(--accent-ink)_22%,transparent)] [--ink-muted:color-mix(in_oklab,var(--accent-ink)_74%,transparent)] [--ink-subtle:color-mix(in_oklab,var(--accent-ink)_58%,transparent)]"
    case "accent-wash":
      return "bg-accent-wash text-ink"
    default:
      return "bg-canvas text-ink"
  }
}

export function spacingClass(spacing: Spacing): string {
  switch (spacing) {
    case "tight":
      return "py-12 md:py-16"
    case "roomy":
      return "py-24 md:py-40"
    case "flush":
      return "py-0"
    default:
      return "py-16 md:py-28"
  }
}

/** Reads the `tone` and `spacing` settings every section shares. */
export function frame(settings: SectionSettings): {
  tone: Tone
  spacing: Spacing
} {
  return {
    tone: choiceSetting(settings, "tone", TONES, "canvas"),
    spacing: choiceSetting(settings, "spacing", SPACINGS, "regular"),
  }
}

/**
 * Numbered blocks reduced to the ones an operator actually filled in.
 *
 * `blocks` already arrives as a list, so unlike a flat settings record there
 * are no gaps to collapse — but a block whose required text was left empty
 * still renders as a hole, so each section decides what counts as present.
 */
export function present<T>(items: T[], keep: (item: T) => boolean): T[] {
  return items.filter(keep)
}
