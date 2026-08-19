import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useMemo, useState } from "react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import type { ShellData } from "~/lib/gallery"
import { frameQuery, framePath, navQuery, type FrameState } from "~/lib/gallery-paths"

import { GalleryPanel } from "./GalleryPanel"
import { GalleryRail } from "./GalleryRail"
import { GalleryStage, type Report } from "./GalleryStage"

/**
 * The gallery's three-pane frame: nav rail, canvas, controls panel.
 *
 * Two kinds of state, deliberately handled differently. Which section and
 * variant you are looking at is navigation — real links, real routes, real
 * history. Palette, stage width and control values are presentation, so they
 * live here in React and apply without a round trip: an iframe reload is far
 * cheaper than a page reload, and typing into a control should not feel like
 * submitting a form. The URL is kept in step with `replaceState` so the view
 * is still linkable without polluting the back button with every keystroke.
 */
export default function GalleryShell({ data }: { data: ShellData }) {
  const [frame, setFrame] = useState<FrameState>(data.frame)
  const [draft, setDraft] = useState<Record<string, string>>(data.overrides)
  const applied = useDebounced(draft, 300)
  const [reports, setReports] = useState<Record<string, Report>>({})
  /** A frame promoted to the whole window, with no gallery around it. */
  const [expanded, setExpanded] = useState<{ section: string; variant: string } | null>(
    null,
  )

  const src = useMemo(() => frameQuery(frame, applied), [frame, applied])
  const nav = useMemo(() => navQuery(frame, applied), [frame, applied])

  /* Linkable without a history entry per keystroke. */
  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}?${nav}`)
  }, [nav])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = event.data
      if (!message || message.type !== "gallery:height") return
      setReports((prev) => {
        const current = prev[message.key]
        const next: Report = {
          height: message.height,
          empty: Boolean(message.empty),
        }
        if (
          current &&
          current.height === next.height &&
          current.empty === next.empty
        ) {
          return prev
        }
        return { ...prev, [message.key]: next }
      })
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  useEffect(() => {
    if (!expanded) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [expanded])

  const stage =
    data.stages.find((candidate) => candidate.id === frame.stage) ?? data.stages[0]

  /*
   * How tall a frame may get. The single canvas gets the whole pane, so a
   * section that sizes itself against the viewport is reviewed at something
   * close to a real window; the overview gets a shorter preview, because
   * nineteen full-height frames is not a thing anyone scrolls through.
   */
  const viewport = useViewportHeight()
  const maxHeight =
    data.view.kind === "section"
      ? Math.max(360, viewport - 108)
      : Math.max(320, Math.min(680, viewport - 180))

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize="17%" minSize="12%" className="border-r">
        <GalleryRail
          sections={data.sections}
          chrome={data.chrome}
          foundations={data.foundations}
          overviews={data.overviews}
          query={nav}
          activeSection={
            data.view.kind === "section" ? data.view.sectionId : undefined
          }
          activeVariant={
            data.view.kind === "section" ? data.view.variantId : undefined
          }
          activeOverview={data.view.kind === "overview" ? data.view.mode : undefined}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <strong className="text-sm font-semibold">
              {data.view.kind === "section"
                ? data.view.name
                : `Overview · ${data.view.label}`}
            </strong>
            {data.view.kind === "section" && (
              <Badge variant="secondary" className="font-mono text-[10px]">
                {data.view.sectionId}
              </Badge>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {data.view.kind === "section"
                ? data.view.description
                : data.view.note}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <Chooser
              label="Palette"
              value={frame.palette}
              options={data.palettes}
              onChange={(palette) => setFrame((prev) => ({ ...prev, palette }))}
            />
            <Chooser
              label="Corners"
              value={frame.corners}
              options={data.corners}
              onChange={(corners) => setFrame((prev) => ({ ...prev, corners }))}
            />
            <Chooser
              label="Stage"
              value={frame.stage}
              options={data.stages.map((entry) => entry.id)}
              labels={Object.fromEntries(
                data.stages.map((entry) => [entry.id, entry.label]),
              )}
              onChange={(next) => setFrame((prev) => ({ ...prev, stage: next }))}
            />
            <div className="flex items-center gap-2 pb-1.5">
              <Switch
                id="grain"
                checked={frame.grain}
                onCheckedChange={(grain) =>
                  setFrame((prev) => ({ ...prev, grain }))
                }
              />
              <Label htmlFor="grain" className="text-xs">
                Grain
              </Label>
            </div>
          </div>
        </header>

        <div
          className={
            data.view.kind === "section"
              ? "min-h-0 flex-1 overflow-hidden p-4"
              : "flex-1 overflow-y-auto p-4"
          }
        >
          {data.view.kind === "section" ? (
            <GalleryStage
              section={data.view.sectionId}
              variant={data.view.variantId}
              label={data.view.variantLabel}
              note={data.view.variantNote}
              query={src}
              width={stage.width}
              fill
              report={reports[`${data.view.sectionId}--${data.view.variantId}`]}
              onExpand={() =>
                setExpanded({
                  section: (data.view as { sectionId: string }).sectionId,
                  variant: (data.view as { variantId: string }).variantId,
                })
              }
            />
          ) : (
            data.view.items.map((item) => (
              <section key={item.sectionId} id={item.sectionId} className="mb-7">
                <div className="mb-2 flex flex-wrap items-baseline gap-2">
                  <h2 className="text-sm font-semibold">{item.name}</h2>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {item.sectionId}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {item.description} {item.variantCount} variants
                  </p>
                </div>
                <GalleryStage
                  section={item.sectionId}
                  variant={item.variant}
                  label={item.label}
                  query={src}
                  width={stage.width}
                  maxHeight={maxHeight}
                  report={reports[`${item.sectionId}--${item.variant}`]}
                  onExpand={() =>
                    setExpanded({ section: item.sectionId, variant: item.variant })
                  }
                  linkLabel="Open with controls →"
                  linkHref={`/dev/gallery/${item.sectionId}/${item.variant}?${nav}`}
                />
              </section>
            ))
          )}
        </div>
      </ResizablePanel>

      {data.view.kind === "section" && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="23%" minSize="16%" className="border-l">
            <GalleryPanel
              view={data.view}
              draft={draft}
              onChange={(id, value) =>
                setDraft((prev) => ({ ...prev, [id]: value }))
              }
              onReset={() => setDraft({})}
              live={liveInstance(data.view.resolved, applied)}
            />
          </ResizablePanel>
        </>
      )}
      {expanded && (
        <ExpandedFrame
          section={expanded.section}
          variant={expanded.variant}
          query={src}
          onClose={() => setExpanded(null)}
        />
      )}
    </ResizablePanelGroup>
  )
}

/**
 * One frame, the whole window, nothing else.
 *
 * The point of the gallery is to judge a component, and the chrome that helps
 * you find it eventually gets in the way of seeing it. This is the escape
 * hatch: no rail, no panel, no caption — the frame at the real width of the
 * window. Escape closes it.
 */
function ExpandedFrame({
  section,
  variant,
  query,
  onClose,
}: {
  section: string
  variant: string
  query: string
  onClose: () => void
}) {
  const src = `${framePath(section, variant)}?frame=${encodeURIComponent(`${section}--${variant}--full`)}&${query}`
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        src={src}
        title={`${section} — ${variant}, full screen`}
        className="h-full w-full border-0 bg-white"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onClose}
        className="absolute right-3 top-3 gap-1.5 shadow-lg"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
        Close
        <kbd className="ml-1 rounded border px-1 text-[10px] opacity-70">esc</kbd>
      </Button>
    </div>
  )
}

/** A labelled select for one of the frame's presentation options. */
function Chooser({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  labels?: Record<string, string>
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={(next) => onChange(String(next ?? ""))}
        items={options.map((option) => ({
          label: labels?.[option] ?? option,
          value: option,
        }))}
      >
        <SelectTrigger size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {labels?.[option] ?? option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** The instance as it stands with the current control values folded in. */
function liveInstance(resolved: unknown, overrides: Record<string, string>) {
  const instance = resolved as {
    type: string
    data: { id: string; settings: Record<string, unknown>; blocks: unknown[] }
  }
  return {
    ...instance,
    data: {
      ...instance.data,
      settings: { ...instance.data.settings, ...overrides },
    },
  }
}

/** The window height, tracked so the frame clamp survives a resize. */
function useViewportHeight(): number {
  const [height, setHeight] = useState(() =>
    typeof window === "undefined" ? 900 : window.innerHeight,
  )
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return height
}

/**
 * Typing should not reload the iframe on every keystroke, but a dropdown
 * should feel immediate. One delay for both is the simpler thing to reason
 * about, and 300ms is below the point where a select feels laggy.
 */
function useDebounced<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return settled
}
