import * as Dialog from "@radix-ui/react-dialog"
import { useState } from "react"

/**
 * The small-screen navigation drawer.
 *
 * This is one of the few places a React island earns its weight. A drawer that
 * is correct needs a focus trap, an escape handler, inert background content
 * and a restored scroll position; the CSS-only versions of this pattern get
 * the appearance right and leave a keyboard user tabbing through links behind
 * an opaque panel.
 */

export type NavItem = {
  label: string
  href: string
  items?: NavItem[]
}

type Props = {
  items: NavItem[]
  siteName: string
  ctaLabel?: string
  ctaHref?: string
  phone?: string
  closeLabel?: string
  menuLabel?: string
}

export default function MobileNav({
  items,
  siteName,
  ctaLabel,
  ctaHref,
  phone,
  closeLabel = "Close menu",
  menuLabel = "Menu",
}: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={menuLabel}
        className="grid h-11 w-11 place-items-center rounded-pill text-current transition-opacity duration-300 hover:opacity-65 lg:hidden"
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
          <path d="M3.5 7.5h17M3.5 12h17M3.5 16.5h17" />
        </svg>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[3px] data-[state=closed]:animate-[fade_0.25s_ease-in_reverse] data-[state=open]:animate-[fade_0.35s_var(--ease-out-expo)]" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-[26rem] flex-col bg-canvas text-ink shadow-[-24px_0_60px_-30px_rgba(0,0,0,0.45)] duration-400 data-[state=closed]:animate-[drawer-out_0.3s_var(--ease-in-out-soft)] data-[state=open]:animate-[drawer-in_0.45s_var(--ease-out-expo)]"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{siteName}</Dialog.Title>

          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="u-eyebrow text-ink-subtle">{menuLabel}</span>
            <Dialog.Close
              aria-label={closeLabel}
              className="grid h-10 w-10 place-items-center rounded-pill transition-colors duration-300 hover:bg-ink/[0.06]"
            >
              <svg
                className="h-4 w-4"
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

          <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-3">
            <ul>
              {items.map((item, index) => {
                const children = item.items ?? []
                const isOpen = expanded === `${index}`
                return (
                  <li key={`${item.href}-${index}`} className="border-b border-line/70">
                    <div className="flex items-center">
                      <a
                        href={item.href}
                        className="u-display-sm flex-1 py-4 text-[1.375rem] leading-tight"
                      >
                        {item.label}
                      </a>
                      {children.length > 0 && (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`${item.label} — submenu`}
                          onClick={() => setExpanded(isOpen ? null : `${index}`)}
                          className="grid h-10 w-10 place-items-center rounded-pill transition-colors duration-300 hover:bg-ink/[0.06]"
                        >
                          <svg
                            className={`h-4 w-4 transition-transform duration-400 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.25}
                            strokeLinecap="round"
                            aria-hidden="true"
                          >
                            <path d="m8 10 4 4 4-4" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {children.length > 0 && isOpen && (
                      <ul className="pb-4 pl-1">
                        {children.map((child, childIndex) => (
                          <li key={`${child.href}-${childIndex}`}>
                            <a
                              href={child.href}
                              className="block py-2 text-[0.9375rem] text-ink-muted transition-colors duration-200 hover:text-ink"
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          {(ctaLabel && ctaHref) || phone ? (
            <div className="border-t border-line px-5 py-5">
              {ctaLabel && ctaHref && (
                <a
                  href={ctaHref}
                  className="flex h-12 items-center justify-center rounded-pill bg-accent px-6 text-[0.875rem] font-medium text-accent-ink"
                >
                  {ctaLabel}
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                  className="mt-3 flex items-center justify-center gap-2 text-[0.875rem] text-ink-muted"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                    aria-hidden="true"
                  >
                    <path d="M8.2 3.8 5.6 4.9a2 2 0 0 0-1.2 2.2c.8 4.9 6.6 11.4 12 12.6a2 2 0 0 0 2.3-1.2l1-2.5-4.1-2.3-1.9 1.9c-2-1-4.1-3.2-5.1-5.3l2-1.9-2.4-4.6Z" />
                  </svg>
                  {phone}
                </a>
              )}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
