import * as Dialog from "@radix-ui/react-dialog"
import { useCallback, useEffect, useState } from "react"

/**
 * The gallery on a journey page.
 *
 * The thumbnails are rendered here rather than in Astro because each one is a
 * control that opens the viewer — a server-rendered thumbnail would need a
 * click handler attached to it anyway, and the two copies would drift. Without
 * JavaScript the photographs are still reachable: the journey's lead image is
 * server-rendered above this, and each thumbnail falls back to a plain link.
 */

export type Shot = { src: string; alt: string }

type Props = {
  shots: Shot[]
  label?: string
  closeLabel?: string
  previousLabel?: string
  nextLabel?: string
}

export default function Lightbox({
  shots,
  label = "Gallery",
  closeLabel = "Close",
  previousLabel = "Previous photograph",
  nextLabel = "Next photograph",
}: Props) {
  const [index, setIndex] = useState<number | null>(null)
  const open = index !== null

  const step = useCallback(
    (delta: number) => {
      setIndex((current) =>
        current === null
          ? current
          : (current + delta + shots.length) % shots.length,
      )
    },
    [shots.length],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1)
      if (event.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, step])

  if (shots.length === 0) return null

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {shots.map((shot, position) => (
          <li key={`${shot.src}-${position}`}>
            <button
              type="button"
              onClick={() => setIndex(position)}
              className="group u-frame block aspect-[4/3] w-full rounded-card"
              aria-label={`${label} — ${position + 1} of ${shots.length}`}
            >
              <img
                src={shot.src}
                alt={shot.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root
        open={open}
        onOpenChange={(next) => setIndex(next ? (index ?? 0) : null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/90 data-[state=open]:animate-[fade_0.3s_var(--ease-out-expo)]" />
          <Dialog.Content
            className="fixed inset-0 z-[95] flex flex-col p-3 md:p-8"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">{label}</Dialog.Title>

            <div className="flex items-center justify-between text-white/70">
              <span className="u-eyebrow">
                {(index ?? 0) + 1} / {shots.length}
              </span>
              <Dialog.Close
                aria-label={closeLabel}
                className="grid h-11 w-11 place-items-center rounded-pill transition-colors duration-300 hover:bg-white/10 hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.25}
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </Dialog.Close>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center">
              {index !== null && (
                <img
                  src={shots[index]!.src}
                  alt={shots[index]!.alt}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {shots.length > 1 && (
              <div className="flex items-center justify-center gap-3 pt-3">
                <Arrow label={previousLabel} onClick={() => step(-1)} rotate />
                <Arrow label={nextLabel} onClick={() => step(1)} />
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

function Arrow({
  label,
  onClick,
  rotate = false,
}: {
  label: string
  onClick: () => void
  rotate?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-pill border border-white/25 text-white/80 transition-colors duration-300 hover:border-white/60 hover:text-white"
    >
      <svg
        className={`h-4 w-4 ${rotate ? "rotate-180" : ""}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </button>
  )
}
