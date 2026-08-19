import { useCallback, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"

import {
  CurrencyPicker,
  LanguagePicker,
} from "~/components/islands/LocalePickers"
import { cn } from "~/lib/cn"
import { fill } from "~/lib/messages"
import {
  behaviourOf,
  type NavCard,
  type NavColumn,
  type NavItem,
  type NavLink,
  type NavPromo,
} from "~/lib/navigation"
import { telHref, type SiteSettings } from "~/lib/site"

/**
 * The site navigation.
 *
 * One island rather than three. A mega panel, a dropdown and a drawer look like
 * separate components until you try to make them behave: only one panel may be
 * open at a time, the drawer has to know the same items the panels do, and the
 * header has to go opaque the moment anything opens over a photograph. Split
 * across islands, that shared state becomes a bus between them.
 *
 * The whole interior of the header lives here — mark, links, calls to action —
 * because the pieces that stay in Astro would otherwise have to be told about
 * open state anyway. What stays in `SiteHeader.astro` is what genuinely does
 * not need React: the fixed shell, the transparency sentinel, and its observer.
 */

/** 120ms is under the threshold where a pointer crossing an item reads as intent. */
/** Movement below this is inertia, not intent. */
const SCROLL_DEAD_ZONE = 10

/** Within this of the top, the bar is always shown. */
const REVEAL_ABOVE = 24

const OPEN_DELAY = 120

/**
 * The reason a mega panel survives a diagonal pointer path. A reader moving
 * from a trigger to a card two columns down leaves the trigger's box for
 * roughly a fifth of a second; anything under a quarter second closes the panel
 * out from under them and they blame themselves for it.
 */
const CLOSE_DELAY = 300

/**
 * Where a link column is cut in two.
 *
 * Past a dozen rows a column is taller than the panel is allowed to be, and the
 * reader is scrolling a panel to read a list that would have fitted beside
 * itself. Splitting is always better than scrolling here, because the columns
 * beside it are already the reader's scanning path.
 */
const COLUMN_LIMIT = 12

export interface NavUtilityLink {
  label: string
  href: string
}

export interface NavLanguage extends NavUtilityLink {
  /** "RO" — what the closed switcher shows. */
  code: string
  current?: boolean
}

/**
 * The bar above the navigation.
 *
 * Everything in it is optional and supplied by the caller, because none of it
 * is universal: a Romanian operator wants the office hours beside the number, a
 * single-market operator has no language switch, and an operator with no
 * account area should not get a link to one.
 */
export interface NavUtility {
  /**
   * The odds and ends: B2B, careers, press, corporate.
   *
   * A menu rather than settings, because that is what they are — and because
   * an operator with eleven of them should not be limited to the four the
   * theme happened to name.
   */
  links: NavUtilityLink[]
  /**
   * Offered only when the operator says they price in them. An empty list is
   * the honest default: a switcher implies a rate, and a package quoted in one
   * currency and settled in another at a rate nobody published is a complaint.
   */
  currencies: string[]
  phone?: string
  /** "Luni–Vineri 9–19" — the line that makes a reader trust the number enough to dial. */
  phoneNote?: string
  locator?: NavUtilityLink
  account?: NavUtilityLink
  languages: NavLanguage[]
}

/**
 * The handful of theme-owned strings this island renders.
 *
 * Narrow on purpose. The full `Messages` dictionary is around a hundred and
 * fifty strings plus nested plural and booking tables, and every one of them
 * was being serialised into this island's props on every page — including the
 * labels of a booking form that no longer exists. The nav needs six.
 */
export interface NavMessages {
  primaryNav: string
  menu: string
  closeMenu: string
  submenu: string
  showAll: string
  backTo: string
  language: string
  currency: string
}

interface Props {
  items: NavItem[]
  siteName: string
  logo?: { src: string; alt: string } | undefined
  settings: SiteSettings
  messages: NavMessages
  /** True only where the header is actually drawing over photography. */
  overHero: boolean
  utility?: NavUtility | undefined
}

/** An item with nothing to open behaves as a link, whatever else it carries. */
function opens(item: NavItem): boolean {
  return behaviourOf(item) !== "link"
}

/**
 * The way out of a panel.
 *
 * The model requires an authored view-all on a mega panel, and this is what
 * happens when one is missing anyway or when the panel is a dropdown: the
 * parent's own page stands in. A panel that swallows the page its trigger names
 * is the single most common way a mega menu loses a reader.
 */
function panelViewAll(item: NavItem, messages: NavMessages): NavLink | undefined {
  if (item.viewAll) return item.viewAll
  return item.href ? { label: messages.showAll, href: item.href } : undefined
}

/**
 * Columns as they are drawn, rather than as they were authored.
 *
 * The continuation of a split column repeats its heading as an invisible
 * spacer, so its first link sits on the same baseline as its neighbours' rather
 * than a line higher. It is repeated silently: a second announcement of the
 * same group name tells a screen-reader user there are two groups.
 */
function drawnColumns(columns: NavColumn[]): Array<NavColumn & { continued: boolean }> {
  return columns.flatMap((column) => {
    if (column.links.length <= COLUMN_LIMIT) return [{ ...column, continued: false }]
    const parts = Math.ceil(column.links.length / COLUMN_LIMIT)
    const size = Math.ceil(column.links.length / parts)
    return Array.from({ length: parts }, (_, part) => ({
      ...column,
      links: column.links.slice(part * size, (part + 1) * size),
      continued: part > 0,
    }))
  })
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m8 10 4 4 4-4" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m10 6 6 6-6 6" />
    </svg>
  )
}

/** The one mark that says a control opens. Drawn to the same hairline set. */
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8.2 3.8 5.6 4.9a2 2 0 0 0-1.2 2.2c.8 4.9 6.6 11.4 12 12.6a2 2 0 0 0 2.3-1.2l1-2.5-4.1-2.3-1.9 1.9c-2-1-4.1-3.2-5.1-5.3l2-1.9-2.4-4.6Z" />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 21c4-4.4 6-7.7 6-10a6 6 0 1 0-12 0c0 2.3 2 5.6 6 10Z" />
      <circle cx="12" cy="11" r="2.25" />
    </svg>
  )
}

function AccountIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8.5" r="3.25" />
      <path d="M5 19.5c1.4-3 3.9-4.5 7-4.5s5.6 1.5 7 4.5" />
    </svg>
  )
}

/** A price, a length and a departure city, in the order a charter buyer reads them. */
function CardMeta({ card }: { card: NavCard }) {
  const parts = [card.priceFrom, card.duration, card.departsFrom].filter(Boolean)
  if (parts.length === 0) return null
  return (
    <p className="mt-1.5 text-[0.75rem] text-ink-subtle">
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 && <span className="px-1.5 opacity-50">·</span>}
          {part}
        </span>
      ))}
    </p>
  )
}

function PanelCard({ card, className }: { card: NavCard; className?: string }) {
  return (
    <a href={card.href} className={cn("group block", className)}>
      {card.image && (
        <div className="u-frame aspect-[4/3] rounded-card">
          <img src={card.image.src} alt={card.image.alt} loading="lazy" decoding="async" />
        </div>
      )}
      <div className={cn(card.image && "mt-3")}>
        {card.badge && (
          <span className="u-eyebrow text-brass">{card.badge}</span>
        )}
        <p className="u-display-sm mt-1 text-[1.0625rem]">{card.title}</p>
        <CardMeta card={card} />
      </div>
    </a>
  )
}

function PanelPromo({ promo }: { promo: NavPromo }) {
  return (
    <a
      href={promo.href}
      className="group block overflow-hidden rounded-card border border-line bg-surface"
    >
      {promo.image && (
        <div className="u-frame aspect-[16/9]">
          <img src={promo.image.src} alt={promo.image.alt} loading="lazy" decoding="async" />
        </div>
      )}
      <div className="p-5">
        {promo.eyebrow && <p className="u-eyebrow text-ink-subtle">{promo.eyebrow}</p>}
        <p className="u-display-sm mt-2 text-[1.25rem]">{promo.headline}</p>
        {promo.body && (
          <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">{promo.body}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-[0.8125rem] font-medium">
          {promo.ctaLabel}
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  )
}

function ColumnLinks({ links }: { links: NavLink[] }) {
  return (
    <ul className="mt-3 space-y-0.5">
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <a
            href={link.href}
            className="flex items-baseline gap-2 rounded-[calc(var(--corner)+2px)] py-1.5 text-[0.875rem] text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            <span>{link.label}</span>
            {link.meta && <span className="text-[0.75rem] text-ink-subtle">{link.meta}</span>}
            {link.badge && <span className="u-eyebrow text-brass">{link.badge}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}

/**
 * The bordered row that ends a mega panel.
 *
 * Deliberately not a link among links. A panel showing thirty-six of two
 * hundred destinations is a dead end unless the way out is obvious, and a
 * seventeenth blue link in the last column is not obvious.
 */
function ViewAll({ link, className }: { link: NavLink; className?: string }) {
  return (
    <a
      href={link.href}
      className={cn(
        "flex h-12 w-full items-center justify-between gap-3 rounded-card border border-line px-4 text-[0.875rem] font-medium transition-colors duration-300 hover:border-ink hover:bg-accent-wash",
        className,
      )}
    >
      {link.label}
      <ChevronRight />
    </a>
  )
}

export default function SiteNav({
  items,
  siteName,
  logo,
  settings,
  messages,
  overHero,
  utility,
}: Props) {
  const baseId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const triggers = useRef(new Map<number, HTMLButtonElement>())
  const timers = useRef<{ open?: number; close?: number }>({})

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const interacting = useRef(false)
  const [hoverable, setHoverable] = useState(false)
  const [mounted, setMounted] = useState(false)

  const clearTimers = useCallback(() => {
    if (timers.current.open) window.clearTimeout(timers.current.open)
    if (timers.current.close) window.clearTimeout(timers.current.close)
    timers.current = {}
  }, [])

  const openAfterDelay = useCallback(
    (index: number) => {
      clearTimers()
      timers.current.open = window.setTimeout(() => setOpenIndex(index), OPEN_DELAY)
    },
    [clearTimers],
  )

  const closeAfterDelay = useCallback(() => {
    clearTimers()
    timers.current.close = window.setTimeout(() => setOpenIndex(null), CLOSE_DELAY)
  }, [clearTimers])

  const closePanel = useCallback(
    (restoreTo?: number) => {
      clearTimers()
      setOpenIndex(null)
      if (restoreTo !== undefined) triggers.current.get(restoreTo)?.focus()
    },
    [clearTimers],
  )

  useEffect(() => {
    setMounted(true)
    return clearTimers
  }, [clearTimers])

  /**
   * Hover-to-open is a capability, not a breakpoint.
   *
   * A tablet is wide enough for the desktop navigation and has no pointer to
   * hover with; a synthesized hover on tap opens a panel the reader then has to
   * dismiss before their tap on the link is heard. `(hover: none)` is the only
   * honest test, and it is re-read on change because a tablet with a keyboard
   * case attached becomes a hover device mid-session.
   */
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)")
    const sync = () => setHoverable(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  /**
   * A window widened past the drawer's breakpoint has to give the drawer up.
   * The sheet is hidden above 1024px, so a reader who rotates a tablet or drags
   * a window wider would otherwise be left looking at a page they cannot
   * scroll, because the drawer is still holding the body locked.
   */
  useEffect(() => {
    if (!drawerOpen) return
    const query = window.matchMedia("(min-width: 1024px)")
    const sync = () => {
      if (query.matches) setDrawerOpen(false)
    }
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [drawerOpen])

  /**
   * A transparent header cannot stay transparent under an open panel: the panel
   * is on the canvas and the row above it would be white type on white. The
   * island tells the shell what it is doing rather than painting its own
   * background, so the header keeps one description of its own opacity.
   */
  useEffect(() => {
    const header = rootRef.current?.closest<HTMLElement>("[data-header]")
    if (header) header.dataset.navOpen = openIndex === null ? "false" : "true"
  }, [openIndex])

  useEffect(() => {
    if (openIndex === null) return
    const index = openIndex

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closePanel(index)
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closePanel()
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [openIndex, closePanel])

  /**
   * The utility bar follows the direction of travel.
   *
   * Collapsing once and staying collapsed until the reader returns to the very
   * top is the wrong model: someone who scrolls back up is looking for
   * something, and what they are looking for is usually the telephone number
   * or the account link that just disappeared. Reading down hides it; reading
   * back up returns it, which is the same contract the browser's own toolbar
   * keeps on a phone and therefore one nobody has to learn.
   *
   * Three details make it feel deliberate rather than twitchy. A dead zone, so
   * a trackpad's inertia and a rubber-band overscroll do not flip it. A floor,
   * so the top of the page always shows it whatever the last direction was.
   * And it freezes while a panel is open: revealing the bar under an open mega
   * menu would push the panel down at the exact moment the reader is aiming at
   * it, and hiding it would pull the panel up. Neither is better than holding
   * still, so it holds still.
   */
  useEffect(() => {
    if (!utility) return

    let frame = 0
    let last = Math.max(0, window.scrollY)

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0

        /* Nothing moves while the reader is inside the header. */
        if (interacting.current) return

        /* Overscroll goes negative on macOS; the top is the top. */
        const y = Math.max(0, window.scrollY)

        if (y <= REVEAL_ABOVE) {
          last = y
          setCompact(false)
          return
        }

        /* Below the dead zone nothing counts, and `last` is left alone so a
         * slow drag still accumulates into a real direction. */
        if (Math.abs(y - last) < SCROLL_DEAD_ZONE) return

        const goingDown = y > last
        last = y
        setCompact(goingDown)
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [utility])

  /*
   * Mirrored into a ref so the scroll handler can read it without being torn
   * down and rebuilt every time a panel opens.
   */
  useEffect(() => {
    interacting.current = openIndex !== null || drawerOpen
  }, [openIndex, drawerOpen])

  const openItem = openIndex === null ? undefined : items[openIndex]
  const openBehaviour = openItem ? behaviourOf(openItem) : undefined
  /** Solid the moment a panel is open, whatever the hero is doing behind it. */
  const clear = overHero && openIndex === null

  return (
    <div ref={rootRef} className="relative">
      {utility && (
        <div
          data-compact={compact ? "true" : "false"}
          className="hidden grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] data-[compact=true]:grid-rows-[0fr] data-[compact=true]:opacity-0 lg:grid"
        >
          <div className="overflow-hidden">
            <div className="u-shell flex h-9 items-center justify-between gap-6 border-b border-current/15 text-[0.75rem] tracking-[0.02em]">
              {
                /*
                 * The quiet links sit left, away from the phone number and the
                 * account: they are the ones nobody came for, and putting them
                 * beside the things people did come for costs those things
                 * attention.
                 */
              }
              <ul className="no-scrollbar flex min-w-0 items-center gap-5 overflow-x-auto">
                {utility.links.map((link) => (
                  <li key={link.href} className="shrink-0">
                    <a
                      href={link.href}
                      className="transition-opacity duration-300 hover:opacity-65"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="flex shrink-0 items-center gap-6">
              {utility.phone && (
                <a
                  href={telHref(utility.phone)}
                  className="inline-flex items-center gap-2 transition-opacity duration-300 hover:opacity-65"
                >
                  <PhoneIcon className="h-3.5 w-3.5 opacity-70" />
                  <span className="font-medium">{utility.phone}</span>
                  {utility.phoneNote && (
                    <span className="opacity-65">{utility.phoneNote}</span>
                  )}
                </a>
              )}
              {utility.locator && (
                <a
                  href={utility.locator.href}
                  className="inline-flex items-center gap-2 transition-opacity duration-300 hover:opacity-65"
                >
                  <PinIcon className="h-3.5 w-3.5 opacity-70" />
                  {utility.locator.label}
                </a>
              )}
              {utility.account && (
                <a
                  href={utility.account.href}
                  className="inline-flex items-center gap-2 transition-opacity duration-300 hover:opacity-65"
                >
                  <AccountIcon className="h-3.5 w-3.5 opacity-70" />
                  {utility.account.label}
                </a>
              )}
              {
                /*
                 * A select, not a row of links.
                 *
                 * Two languages fit beside each other; five do not, and an
                 * agency that adds Hungarian and German should not have to
                 * discover that the bar now wraps. The closed control shows
                 * the code because that is all the room there is, and the open
                 * one shows the language's own name, because "DE" is not what
                 * a German reader is looking for.
                 */
              }
              <LanguagePicker languages={utility.languages} label={messages.language} />

              <CurrencyPicker currencies={utility.currencies} label={messages.currency} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="u-shell flex h-[4.5rem] items-center justify-between gap-6 md:h-[5.25rem]">
        <a href="/" className="flex shrink-0 items-center gap-3" aria-label={siteName}>
          {logo ? (
            <img
              src={logo.src}
              alt={logo.alt || siteName}
              className="h-7 w-auto max-w-[11rem] object-contain md:h-8"
            />
          ) : (
            <span className="u-display-sm text-[1.25rem] tracking-[-0.01em] md:text-[1.375rem]">
              {siteName}
            </span>
          )}
        </a>

        {
          /*
           * A list of links, described as a list of links.
           *
           * `role="menubar"` is the tempting choice and the wrong one: it tells
           * a screen reader these are application commands, which suppresses
           * the link enumeration and the "links list" a reader actually
           * navigates a travel site with. The disclosure pattern — a button
           * that owns a panel — describes what is happening without lying about
           * what the contents are.
           */
        }
        <nav className="hidden lg:block" aria-label={messages.primaryNav}>
          <ul className="flex items-center gap-0.5">
            {items.map((item, index) => {
              const behaviour = behaviourOf(item)
              const isOpen = openIndex === index
              const panelId = `${baseId}-panel-${index}`
              const triggerId = `${baseId}-trigger-${index}`

              if (behaviour === "link") {
                if (!item.href) return null
                return (
                  <li key={`${item.label}-${index}`}>
                    <a
                      href={item.href}
                      className="flex items-center gap-1.5 rounded-pill px-3.5 py-2.5 text-[0.8125rem] font-medium tracking-[0.06em] uppercase transition-opacity duration-300 hover:opacity-60"
                    >
                      {item.label}
                      {item.badge && (
                        <span className="u-eyebrow text-[0.5625rem] text-brass">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </li>
                )
              }

              return (
                <li
                  key={`${item.label}-${index}`}
                  className="relative"
                  onMouseEnter={hoverable ? () => openAfterDelay(index) : undefined}
                  onMouseLeave={hoverable ? closeAfterDelay : undefined}
                >
                  <button
                    type="button"
                    id={triggerId}
                    ref={(node) => {
                      if (node) triggers.current.set(index, node)
                      else triggers.current.delete(index)
                    }}
                    aria-expanded={isOpen}
                    /*
                     * Only while it points at something. A panel is mounted on
                     * demand — a dozen mega panels' worth of photography on
                     * every page load is not a trade worth making — and
                     * `aria-controls` naming an absent id is worse than absent.
                     */
                    aria-controls={isOpen ? panelId : undefined}
                    onClick={() => {
                      clearTimers()
                      setOpenIndex(isOpen ? null : index)
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-pill px-3.5 py-2.5 text-[0.8125rem] font-medium tracking-[0.06em] uppercase transition-opacity duration-300 hover:opacity-60",
                      isOpen && "opacity-60",
                    )}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="u-eyebrow text-[0.5625rem] text-brass">
                        {item.badge}
                      </span>
                    )}
                    <Chevron
                      className={cn(
                        "h-3 w-3 opacity-60 transition-transform duration-400",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {behaviour === "dropdown" && isOpen && (
                    <div
                      className="absolute left-0 top-full z-20 pt-2"
                      onMouseEnter={hoverable ? clearTimers : undefined}
                      onMouseLeave={hoverable ? closeAfterDelay : undefined}
                    >
                      <div
                        id={panelId}
                        aria-labelledby={triggerId}
                        className="w-[16.5rem] animate-fade rounded-card border border-line bg-canvas p-2 text-ink shadow-pop"
                      >
                        <ul>
                          {(item.columns ?? []).flatMap((column) => column.links).map((link) => (
                            <li key={`${link.href}-${link.label}`}>
                              <a
                                href={link.href}
                                className="flex items-baseline justify-between gap-3 rounded-[calc(var(--corner)+2px)] px-3.5 py-2.5 text-[0.875rem] text-ink-muted transition-colors duration-200 hover:bg-accent-wash hover:text-ink"
                              >
                                <span>{link.label}</span>
                                {link.meta && (
                                  <span className="text-[0.75rem] text-ink-subtle">
                                    {link.meta}
                                  </span>
                                )}
                              </a>
                            </li>
                          ))}
                        </ul>
                        {(() => {
                          const viewAll = panelViewAll(item, messages)
                          return viewAll ? (
                            <ViewAll link={viewAll} className="mt-2 h-11" />
                          ) : null
                        })()}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          {
            /* The utility bar already carries the number when there is one. */
            !utility?.phone && settings.phone && (
              <a
                href={telHref(settings.phone)}
                className="hidden rounded-pill px-3 py-2 text-[0.8125rem] tracking-[0.02em] transition-opacity duration-300 hover:opacity-60 xl:block"
              >
                {settings.phone}
              </a>
            )
          }
          {
            /*
             * The secondary action is an outline, never a second solid button.
             * Two filled buttons side by side is two primary actions, which is
             * none: the reader has to decide which one the site meant.
             */
          }
          {settings.secondaryCtaLabel && settings.secondaryCtaHref && (
            <a
              href={settings.secondaryCtaHref}
              className="hidden h-10 shrink-0 items-center rounded-pill border border-current/30 px-5 text-[0.875rem] transition-colors duration-300 hover:border-current/60 xl:inline-flex"
            >
              {settings.secondaryCtaLabel}
            </a>
          )}

          {settings.headerCtaLabel && settings.headerCtaHref && (
            <a
              href={settings.headerCtaHref}
              className={cn(
                "hidden h-10 items-center rounded-pill px-5 text-[0.8125rem] font-medium transition-colors duration-300 lg:inline-flex",
                clear
                  ? "border border-current/40 hover:bg-white hover:text-ink group-data-[stuck=true]/header:border-transparent group-data-[stuck=true]/header:bg-accent group-data-[stuck=true]/header:text-accent-ink"
                  : "bg-accent text-accent-ink hover:bg-accent-hover",
              )}
            >
              {settings.headerCtaLabel}
            </a>
          )}
          <button
            type="button"
            ref={menuRef}
            aria-label={messages.menu}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
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
              focusable="false"
            >
              <path d="M3.5 7.5h17M3.5 12h17M3.5 16.5h17" />
            </svg>
          </button>
        </div>
      </div>

      {
        /*
         * The scrim starts where the panel starts. Dimming the header along
         * with the page would put a grey wash over the trigger the reader is
         * still pointing at, and the panel is the thing that needs the page to
         * recede behind it.
         */
        openIndex !== null && (
          <div
            className="absolute inset-x-0 top-full z-10 h-screen animate-fade bg-black/25"
            onClick={() => closePanel()}
            aria-hidden="true"
          />
        )
      }

      {openItem && openBehaviour === "mega" && openIndex !== null && (
        <MegaPanel
          item={openItem}
          viewAll={panelViewAll(openItem, messages)}
          id={`${baseId}-panel-${openIndex}`}
          labelledBy={`${baseId}-trigger-${openIndex}`}
          onPointerEnter={hoverable ? clearTimers : undefined}
          onPointerLeave={hoverable ? closeAfterDelay : undefined}
        />
      )}

      {
        /*
         * Portalled to the body, and only once mounted.
         *
         * The header carries `backdrop-filter`, which makes it a containing
         * block for fixed descendants — a full-screen sheet rendered inside it
         * would be the size of the header. Portals have no server rendering, so
         * this waits for mount; the drawer is closed at that point anyway, so
         * nothing is lost from the served HTML.
         */
        mounted &&
          drawerOpen &&
          createPortal(
            <NavDrawer
              items={items}
              siteName={siteName}
              settings={settings}
              messages={messages}
              utility={utility}
              onClose={() => {
                setDrawerOpen(false)
                menuRef.current?.focus()
              }}
            />,
            document.body,
          )
      }
    </div>
  )
}

function MegaPanel({
  item,
  viewAll,
  id,
  labelledBy,
  onPointerEnter,
  onPointerLeave,
}: {
  item: NavItem
  viewAll?: NavLink | undefined
  id: string
  labelledBy: string
  onPointerEnter?: (() => void) | undefined
  onPointerLeave?: (() => void) | undefined
}) {
  const columns = drawnColumns(item.columns ?? [])
  const cards = item.cards ?? []
  const aside = cards.length > 0 || Boolean(item.promo)

  return (
    <div
      id={id}
      aria-labelledby={labelledBy}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      className="absolute inset-x-0 top-full z-20 animate-fade border-b border-line bg-canvas text-ink shadow-pop"
    >
      {
        /*
         * Full-bleed background, measured content. The band has to reach both
         * edges or it reads as a very wide dropdown; the reading width has to
         * stop, or on a 27-inch display the first and last column are a head
         * turn apart.
         */
      }
      <div className="mx-auto flex max-h-[min(72vh,640px)] w-full max-w-[1376px] flex-col">
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-9 md:px-10 xl:px-14">
          <div className="flex flex-col gap-10 xl:flex-row xl:gap-14">
            {columns.length > 0 && (
              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-3 gap-x-8 gap-y-9 xl:grid-cols-4 [@media(min-width:1440px)]:grid-cols-5">
                  {columns.map((column, index) => (
                    <div key={`${column.heading ?? "column"}-${index}`} className="min-w-0">
                      {column.heading && column.continued && (
                        <p className="u-eyebrow invisible" aria-hidden="true">
                          {column.heading}
                        </p>
                      )}
                      {column.heading &&
                        !column.continued &&
                        (column.headingHref ? (
                          <a
                            href={column.headingHref}
                            className="u-eyebrow inline-block text-ink-subtle transition-colors duration-200 hover:text-ink"
                          >
                            {column.heading}
                          </a>
                        ) : (
                          <p className="u-eyebrow text-ink-subtle">{column.heading}</p>
                        ))}
                      <ColumnLinks links={column.links} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aside && (
              <aside
                className={cn(
                  "shrink-0 space-y-5",
                  columns.length > 0 ? "xl:w-[21rem]" : "w-full",
                )}
              >
                {cards.length > 0 && (
                  <div
                    className={cn(
                      "flex gap-4 overflow-x-auto overscroll-x-contain pb-1 u-no-scrollbar",
                      columns.length > 0 ? "xl:flex-col xl:overflow-visible" : "xl:gap-6",
                    )}
                  >
                    {cards.map((card) => (
                      <PanelCard
                        key={card.href}
                        card={card}
                        className={cn(
                          "w-[15rem] shrink-0",
                          columns.length > 0 ? "xl:w-auto" : "xl:w-full",
                        )}
                      />
                    ))}
                  </div>
                )}
                {item.promo && <PanelPromo promo={item.promo} />}
              </aside>
            )}
          </div>
        </div>

        {
          /*
           * Pinned rather than scrolled to. The way out of a partial list has
           * to be visible from the top of that list, or the reader has to
           * discover it by exhausting the panel first.
           */
          viewAll && (
            <div className="border-t border-line bg-canvas px-5 py-4 md:px-10 xl:px-14">
              <ViewAll link={viewAll} />
            </div>
          )
        }
      </div>
    </div>
  )
}

type DrawerRow = {
  label: string
  href?: string | undefined
  meta?: string | undefined
  badge?: string | undefined
  /** The panel this row drills into, when it has children of its own. */
  drill?: number[] | undefined
}

type DrawerPanel = {
  key: string
  title?: string
  viewAll?: NavLink | undefined
  rows: DrawerRow[]
  cards: NavCard[]
}

/**
 * The panels along the current path, root first.
 *
 * Every ancestor is rebuilt on each render but never unmounted, which is what
 * makes going back cheap: a reader who scrolled forty destinations down, opened
 * one and came back finds the list where they left it, because the element that
 * holds the scroll offset never left the document.
 */
function drawerPanels(
  items: NavItem[],
  path: number[],
  messages: NavMessages,
): DrawerPanel[] {
  const panels: DrawerPanel[] = [
    {
      key: "root",
      rows: items.flatMap((item, index) => {
        if (!item.href && !opens(item)) return []
        return [
          {
            label: item.label,
            href: item.href,
            badge: item.badge,
            drill: opens(item) ? [index] : undefined,
          },
        ]
      }),
      cards: [],
    },
  ]

  const item = path.length > 0 ? items[path[0] as number] : undefined
  if (!item) return panels

  const columns = item.columns ?? []
  const single = columns.length === 1 ? columns[0] : undefined

  panels.push({
    key: `item-${path[0]}`,
    title: item.label,
    viewAll: panelViewAll(item, messages),
    rows: single
      ? single.links.map((link) => ({ label: link.label, href: link.href, meta: link.meta, badge: link.badge }))
      : columns.flatMap((column, columnIndex): DrawerRow[] =>
          column.heading
            ? [
                {
                  label: column.heading,
                  href: column.headingHref,
                  drill: [path[0] as number, columnIndex],
                },
              ]
            : column.links.map((link) => ({
                label: link.label,
                href: link.href,
                meta: link.meta,
                badge: link.badge,
              })),
        ),
    cards: item.cards ?? [],
  })

  if (path.length < 2) return panels

  const column = columns[path[1] as number]
  if (!column) return panels

  panels.push({
    key: `column-${path[0]}-${path[1]}`,
    title: column.heading,
    viewAll: column.headingHref
      ? { label: messages.showAll, href: column.headingHref }
      : undefined,
    rows: column.links.map((link) => ({
      label: link.label,
      href: link.href,
      meta: link.meta,
      badge: link.badge,
    })),
    cards: [],
  })

  return panels
}

/** Focusable and actually visible — a parked panel is `visibility: hidden`. */
function focusables(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return Array.from(nodes).filter((node) =>
    typeof node.checkVisibility === "function" ? node.checkVisibility() : node.offsetParent !== null,
  )
}

/**
 * The small-screen navigation.
 *
 * A drill-down stack rather than an accordion, and the breakpoint is 1024
 * rather than 768. Both follow from the same measurement: expanding thirty-six
 * countries inline pushes everything the reader was aiming at off the screen,
 * and at 360px there is no indentation budget left to show three levels of
 * nesting. A tablet is a touch device with a desktop-width viewport, so it gets
 * this rather than a hover navigation it cannot open.
 */
function NavDrawer({
  items,
  siteName,
  settings,
  messages,
  utility,
  onClose,
}: {
  items: NavItem[]
  siteName: string
  settings: SiteSettings
  messages: NavMessages
  utility?: NavUtility | undefined
  onClose: () => void
}) {
  const [path, setPath] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)

  const panels = drawerPanels(items, path, messages)
  const depth = panels.length - 1
  const phone = utility?.phone ?? settings.phone

  const pop = useCallback(() => setPath((current) => current.slice(0, -1)), [])

  /**
   * The scroll lock, written the way iOS requires.
   *
   * `overflow: hidden` on the body is ignored by Safari on iOS, which happily
   * scrolls the page behind an open sheet; pinning the body is the only thing
   * that holds. Pinning discards the scroll position, so it is measured before
   * and restored after — without that, closing the drawer sends the reader back
   * to the top of a page they were halfway down.
   */
  useEffect(() => {
    const offset = window.scrollY
    const { body } = document
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    }
    body.style.position = "fixed"
    body.style.top = `-${offset}px`
    body.style.width = "100%"
    body.style.overflow = "hidden"
    return () => {
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      body.style.overflow = previous.overflow
      window.scrollTo(0, offset)
    }
  }, [])

  /** Escape belongs to the level, not the drawer: it undoes one drill at a time. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        if (path.length > 0) pop()
        else onClose()
        return
      }
      if (event.key !== "Tab") return

      const container = containerRef.current
      if (!container) return
      const nodes = focusables(container)
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!first || !last) return

      const active = document.activeElement
      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [path, pop, onClose])

  useEffect(() => {
    if (path.length === 0) closeRef.current?.focus()
    else backRef.current?.focus()
  }, [path])

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={siteName}
      className="fixed inset-0 z-[95] flex flex-col bg-canvas text-ink animate-[drawer-in_0.4s_var(--ease-out-expo)] motion-reduce:animate-fade lg:hidden"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <span className="u-eyebrow text-ink-subtle">{messages.menu}</span>
        <button
          type="button"
          ref={closeRef}
          aria-label={messages.closeMenu}
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-pill transition-colors duration-300 hover:bg-ink/[0.06]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {panels.map((panel, index) => {
          const current = index === depth
          return (
            <div
              key={panel.key}
              className={cn(
                "absolute inset-0 overflow-y-auto overscroll-contain px-5 pb-8 pt-4 transition-[transform,opacity,visibility] duration-400 ease-[var(--ease-out-expo)]",
                current
                  ? "translate-x-0 opacity-100"
                  : "invisible -translate-x-8 opacity-0 motion-reduce:translate-x-0",
                current && index > 0 && "animate-[drawer-in_0.35s_var(--ease-out-expo)]",
                current && index > 0 && "motion-reduce:animate-fade",
              )}
            >
              {index > 0 && (
                <div className="flex items-center gap-1 border-b border-line pb-3">
                  <button
                    type="button"
                    ref={current ? backRef : undefined}
                    onClick={pop}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-pill transition-colors duration-300 hover:bg-ink/[0.06]"
                    aria-label={fill(messages.backTo, {
                      name: panels[index - 1]?.title ?? messages.menu,
                    })}
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </button>
                  <h2 className="u-display-sm text-[1.25rem]">{panel.title}</h2>
                </div>
              )}

              {
                /*
                 * The way through comes first. A reader who opened "Circuite"
                 * wanting the whole catalogue should not have to scroll past
                 * thirty-six countries to find out it exists.
                 */
                panel.viewAll && <ViewAll link={panel.viewAll} className="mt-4" />
              }

              <ul className="mt-2">
                {panel.rows.map((row, rowIndex) => {
                  const drill = row.drill
                  return (
                  <li key={`${row.label}-${rowIndex}`} className="border-b border-line/70">
                    <div className="flex items-stretch">
                      {
                        /*
                         * A parent is a destination too. The label navigates and
                         * the chevron drills, in two separate targets, because
                         * a single row that only ever opens a submenu strands
                         * the reader one tap short of the page they asked for.
                         */
                        row.href ? (
                          <a
                            href={row.href}
                            className="flex min-h-[3.25rem] flex-1 items-center gap-2 py-3 pr-3 text-[1rem]"
                          >
                            <span className={cn(index === 0 && "u-display-sm text-[1.375rem]")}>
                              {row.label}
                            </span>
                            {row.meta && (
                              <span className="text-[0.8125rem] text-ink-subtle">{row.meta}</span>
                            )}
                            {row.badge && <span className="u-eyebrow text-brass">{row.badge}</span>}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => drill && setPath(drill)}
                            className="flex min-h-[3.25rem] flex-1 items-center gap-2 py-3 pr-3 text-left text-[1rem]"
                          >
                            <span className={cn(index === 0 && "u-display-sm text-[1.375rem]")}>
                              {row.label}
                            </span>
                          </button>
                        )
                      }
                      {drill && row.href && (
                        <button
                          type="button"
                          aria-label={`${row.label} — ${messages.submenu}`}
                          onClick={() => setPath(drill)}
                          className="grid w-12 shrink-0 place-items-center border-l border-line/70 transition-colors duration-300 hover:bg-ink/[0.06]"
                        >
                          <ChevronRight />
                        </button>
                      )}
                    </div>
                  </li>
                  )
                })}
              </ul>

              {panel.cards.length > 0 && (
                <div className="mt-6 flex gap-4 overflow-x-auto overscroll-x-contain pb-2 u-no-scrollbar">
                  {panel.cards.map((card) => (
                    <PanelCard key={card.href} card={card} className="w-[13.5rem] shrink-0" />
                  ))}
                </div>
              )}

              {phone && (
                <div className="mt-8 border-t border-line pt-5 text-[0.875rem] text-ink-muted">
                  <a href={telHref(phone)} className="inline-flex items-center gap-2">
                    <PhoneIcon className="opacity-70" />
                    <span className="font-medium text-ink">{phone}</span>
                  </a>
                  {utility?.phoneNote && (
                    <p className="mt-1 text-[0.8125rem] text-ink-subtle">{utility.phoneNote}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {
        /*
         * Visible at every level. A reader four taps into a country list is
         * exactly the reader most likely to want to talk to somebody, and
         * making them walk back out to the root to find the number is how a
         * drill-down loses the call.
         */
        (phone || (settings.headerCtaLabel && settings.headerCtaHref)) && (
          <div className="flex items-center gap-3 border-t border-line px-5 py-4">
            {phone && (
              <a
                href={telHref(phone)}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-pill border border-line"
                aria-label={phone}
              >
                <PhoneIcon className="h-5 w-5" />
              </a>
            )}
            {settings.headerCtaLabel && settings.headerCtaHref && (
              <a
                href={settings.headerCtaHref}
                className="flex h-12 flex-1 items-center justify-center rounded-pill bg-accent px-6 text-[0.875rem] font-medium text-accent-ink"
              >
                {settings.headerCtaLabel}
              </a>
            )}
          </div>
        )
      }
    </div>
  )
}
