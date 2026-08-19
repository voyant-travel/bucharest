import { useEffect, useState } from "react"

import { cn } from "~/lib/cn"

export interface Announcement {
  text: string
  href?: string
  linkLabel?: string
  tone: "accent" | "quiet"
}

/**
 * The strip above the navigation.
 *
 * Dismissible, and the dismissal is remembered. A campaign line that cannot be
 * closed stops being read within a visit or two and becomes a band of color
 * the reader has trained themselves past — at which point it is costing a row
 * of every page and returning nothing. Keyed by the text so that changing the
 * message brings it back for everyone who dismissed the last one.
 *
 * Rendered inside the fixed header rather than above it, because a strip in
 * normal flow would sit underneath a header that is pinned to the top of the
 * viewport.
 */
export default function SiteAnnouncement({
  announcement,
  closeLabel,
  defaultLinkLabel,
}: {
  announcement: Announcement
  /*
   * Handed in rather than resolved here. This island is `client:only`, so it
   * never sees the server's dictionary — a string baked in would be the one
   * word on the page that stayed English when the rest turned Romanian.
   */
  closeLabel: string
  defaultLinkLabel: string
}) {
  const key = `announcement:${hash(announcement.text)}`
  /*
   * Starts hidden and is revealed once storage has been read. The opposite
   * order flashes the strip for a frame on every page a returning reader
   * loads, which is a worse artifact than arriving a frame late.
   */
  const [state, setState] = useState<"unknown" | "shown" | "dismissed">("unknown")

  useEffect(() => {
    try {
      setState(window.localStorage.getItem(key) ? "dismissed" : "shown")
    } catch {
      /* Private mode, or storage disabled. The message still deserves showing. */
      setState("shown")
    }
  }, [key])

  if (state !== "shown") return null

  const dismiss = () => {
    setState("dismissed")
    try {
      window.localStorage.setItem(key, "1")
    } catch {
      /* Nothing to do: it will reappear next visit, which is the safe failure. */
    }
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-3 px-12 py-2 text-center text-[0.8125rem]",
        announcement.tone === "accent"
          ? "bg-accent text-accent-ink"
          : "border-b border-line bg-surface-sunk text-ink-muted",
      )}
    >
      <p className="min-w-0">
        {announcement.text}
        {announcement.href && (
          <a
            href={announcement.href}
            className="ml-2 underline underline-offset-2 hover:opacity-80"
          >
            {announcement.linkLabel ?? defaultLinkLabel}
          </a>
        )}
      </p>

      <button
        type="button"
        onClick={dismiss}
        aria-label={closeLabel}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-pill px-2 py-1 text-[1rem] leading-none opacity-70 transition-opacity duration-300 hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}

/** Enough to tell one message from the next; not a checksum. */
function hash(value: string): string {
  let total = 0
  for (let index = 0; index < value.length; index += 1) {
    total = (total * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(total).toString(36)
}
