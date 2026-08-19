/**
 * The navigation model.
 *
 * Three behaviours, and only three: a link, a dropdown, a mega panel. The
 * temptation is a fourth — "a dropdown with a picture" — and refusing it is
 * what keeps the mobile transform tractable, because every panel has to
 * collapse into the same drill-down stack.
 *
 * Which behaviour an item gets is derived, not chosen. An operator who has to
 * decide between "dropdown" and "mega menu" will decide inconsistently across
 * twelve items; the shape of their content already answers it.
 */
import { cleanStega } from "@voyant-travel/theme"

export interface NavLink {
  label: string
  href: string
  /** "11 destinații" — a real conversion signal on a mass-market operator. */
  meta?: string
  /** "Nou", "Ultimele locuri". */
  badge?: string
}

export interface NavColumn {
  heading?: string
  headingHref?: string
  links: NavLink[]
}

export interface NavCard {
  title: string
  href: string
  image?: { src: string; alt: string }
  excerpt?: string
  /** The commercial fields a luxury reference omits and a charter operator needs. */
  priceFrom?: string
  duration?: string
  departsFrom?: string
  badge?: string
}

export interface NavPromo {
  eyebrow?: string
  headline: string
  body?: string
  href: string
  ctaLabel: string
  image?: { src: string; alt: string }
}

export interface NavItem {
  label: string
  /** A parent may be a destination in its own right. */
  href?: string
  badge?: string
  columns?: NavColumn[]
  cards?: NavCard[]
  promo?: NavPromo
  /** Required on any mega panel — a panel showing 36 of 200 is a dead end. */
  viewAll?: NavLink
}

export type NavBehaviour = "link" | "dropdown" | "mega"

/**
 * What an item is, from what it holds.
 *
 * Nothing to open is a link. A single short list of leaves is a dropdown — a
 * panel between the reader and a page they could have reached directly is
 * friction, and the items that matter commercially (Last Minute, Oferte) are
 * exactly the ones operators are tempted to bury. Anything longer, anything
 * with a second level, and anything carrying an image is a mega panel, because
 * all three need width a dropdown cannot give without becoming one.
 */
export function behaviourOf(item: NavItem): NavBehaviour {
  const columns = item.columns ?? []
  const linkCount = columns.reduce((total, column) => total + column.links.length, 0)

  if (linkCount === 0 && !item.cards?.length && !item.promo) return "link"
  if (item.cards?.length || item.promo) return "mega"
  if (columns.length > 1 || linkCount > 8) return "mega"
  return "dropdown"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const clean = cleanStega(value).trim()
  return clean === "" ? undefined : clean
}

/** A link that leads somewhere this theme is willing to send a reader. */
function href(value: unknown): string | undefined {
  const clean = text(value)
  if (!clean) return undefined
  return /^\/(?!\/)/.test(clean) || /^(?:https?:|mailto:|tel:)/i.test(clean)
    ? clean
    : undefined
}

function image(value: unknown): { src: string; alt: string } | undefined {
  if (!isRecord(value)) return undefined
  const src = text(value.src)
  if (!src || !/^\/(?!\/)|^https:\/\//i.test(src)) return undefined
  return { src, alt: text(value.alt) ?? "" }
}

function links(value: unknown): NavLink[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!isRecord(entry)) return []
    const label = text(entry.label)
    const target = href(entry.href)
    if (!label || !target) return []
    return [{ label, href: target, meta: text(entry.meta), badge: text(entry.badge) }]
  })
}

/**
 * Read a published navigation without trusting its shape.
 *
 * The same defensive posture the section parser takes: a menu is authored
 * somewhere else and may have been materialised against a later release of
 * this theme, so an item this build cannot understand is dropped rather than
 * allowed to throw. A navigation that renders eleven of twelve items is a
 * degraded page; one that throws is no page at all.
 */
export function navItems(input: unknown): NavItem[] {
  if (!Array.isArray(input)) return []

  return input.flatMap((entry) => {
    if (!isRecord(entry)) return []
    const label = text(entry.label)
    if (!label) return []

    const columns = Array.isArray(entry.columns)
      ? entry.columns.flatMap((column) => {
          if (!isRecord(column)) return []
          const parsed = links(column.links)
          if (parsed.length === 0) return []
          return [
            {
              heading: text(column.heading),
              headingHref: href(column.headingHref),
              links: parsed,
            },
          ]
        })
      : []

    const cards = Array.isArray(entry.cards)
      ? entry.cards.flatMap((card) => {
          if (!isRecord(card)) return []
          const title = text(card.title)
          const target = href(card.href)
          if (!title || !target) return []
          return [
            {
              title,
              href: target,
              image: image(card.image),
              excerpt: text(card.excerpt),
              priceFrom: text(card.priceFrom),
              duration: text(card.duration),
              departsFrom: text(card.departsFrom),
              badge: text(card.badge),
            },
          ]
        })
      : []

    const promoSource = isRecord(entry.promo) ? entry.promo : undefined
    const promoHeadline = promoSource ? text(promoSource.headline) : undefined
    const promoHref = promoSource ? href(promoSource.href) : undefined
    const promo =
      promoSource && promoHeadline && promoHref
        ? {
            eyebrow: text(promoSource.eyebrow),
            headline: promoHeadline,
            body: text(promoSource.body),
            href: promoHref,
            /* English, because English is the theme's base language: this is the
             * word an operator sees when they have not chosen one themselves. */
            ctaLabel: text(promoSource.ctaLabel) ?? "View",
            image: image(promoSource.image),
          }
        : undefined

    const viewAllSource = isRecord(entry.viewAll) ? entry.viewAll : undefined
    const viewAllLabel = viewAllSource ? text(viewAllSource.label) : undefined
    const viewAllHref = viewAllSource ? href(viewAllSource.href) : undefined

    return [
      {
        label,
        href: href(entry.href),
        badge: text(entry.badge),
        columns,
        cards,
        promo,
        viewAll:
          viewAllLabel && viewAllHref
            ? { label: viewAllLabel, href: viewAllHref }
            : undefined,
      },
    ]
  })
}
