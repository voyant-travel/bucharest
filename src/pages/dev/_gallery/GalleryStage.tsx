import { ArrowExpand01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { framePath } from "~/lib/gallery-paths"
import { cn } from "~/lib/utils"

export interface Report {
  height: number
  empty: boolean
}

interface Props {
  section: string
  variant: string
  label: string
  note?: string
  /** Frame state and overrides, already encoded. */
  query: string
  width: string
  /**
   * Fill the pane rather than fit the content.
   *
   * This is what keeps the page to one scrollbar. Filling makes the iframe the
   * only scroll container on screen; fitting (the overview) leaves scrolling to
   * the canvas and crops each frame instead of nesting a second scrollbar in
   * every one of nineteen.
   */
  fill?: boolean
  /** The tallest a fitted frame may grow. Ignored when filling. */
  maxHeight?: number
  report?: Report
  onExpand?: () => void
  linkLabel?: string
  linkHref?: string
}

/**
 * One iframe, pointed at one section in one variant.
 *
 * The gallery renders every frame through an iframe rather than stacking things
 * on one page, for two reasons. Sections style themselves against the document
 * — full-bleed heroes, background tones, sticky behaviour — and a shared page
 * lets one leak into the next, which is exactly the bug a gallery is supposed
 * to catch rather than cause. And a real viewport is the only honest way to
 * look at a responsive section; a CSS-scaled box is not.
 */
export function GalleryStage({
  section,
  variant,
  label,
  note,
  query,
  width,
  fill = false,
  maxHeight = 720,
  report,
  onExpand,
  linkLabel,
  linkHref,
}: Props) {
  /* The key round-trips through `postMessage` so a page holding twenty frames
   * can tell which one just reported its height. */
  const key = `${section}--${variant}`
  const src = `${framePath(section, variant)}?frame=${encodeURIComponent(key)}&${query}`

  /*
   * A fitted frame is clamped, and the clamp is load-bearing rather than
   * cosmetic. A section may size itself against the viewport — the hero is
   * `max(520px, 86svh)` — and inside an iframe the viewport *is* this element.
   * Sizing the iframe from the content it reports therefore feeds back on
   * itself: taller frame, taller hero, taller frame. It ran away past 2400px
   * and kept going. Clamping breaks the loop, because once the height stops
   * growing the content it drives stops growing too. Filling avoids the loop
   * outright, which is why the single view fills.
   */
  const height = fill
    ? "100%"
    : report
      ? report.empty
        ? 0
        : Math.min(report.height, maxHeight)
      : Math.min(420, maxHeight)

  return (
    <figure
      className={cn(
        "mx-auto overflow-hidden rounded-lg border bg-card",
        fill ? "flex h-full min-h-0 flex-col" : "mb-4",
        report?.empty && "border-destructive/50",
      )}
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-1.5 text-xs">
        <span className="flex flex-wrap items-baseline gap-2">
          <strong className="font-medium">{label}</strong>
          {note && <span className="text-muted-foreground">{note}</span>}
        </span>
        <span className="ml-auto flex items-center gap-2">
          {report?.empty && (
            <Badge variant="destructive" className="font-mono text-[10px]">
              renders nothing
            </Badge>
          )}
          {linkHref && (
            <a href={linkHref} className="text-muted-foreground hover:underline">
              {linkLabel}
            </a>
          )}
          {onExpand && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onExpand}
              className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
              title="View full screen without the gallery around it"
            >
              <HugeiconsIcon icon={ArrowExpand01Icon} className="size-3.5" />
              Expand
            </Button>
          )}
        </span>
      </figcaption>

      <div
        className={cn(
          "flex justify-center bg-black",
          fill && "min-h-0 flex-1",
        )}
      >
        <iframe
          src={src}
          title={`${section} — ${label}`}
          data-frame={key}
          /* A fitted frame is cropped, not nested-scrolled. See `fill`. */
          scrolling={fill ? undefined : "no"}
          className="block w-full border-0 bg-white"
          style={{ maxWidth: width, height }}
        />
      </div>
    </figure>
  )
}
