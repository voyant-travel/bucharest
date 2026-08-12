/**
 * Site-wide settings, navigation and menus.
 *
 * Two rules run through this file. Values that reach a `style` or `data-`
 * attribute are matched against a table the theme owns rather than written
 * into the page, so an unrecognized palette falls back instead of becoming
 * CSS. And provenance is handled the way the rest of the theme handles it:
 * a label that becomes a text node keeps its stega suffix so the editor can
 * select it, while anything that becomes an attribute is cleaned, because
 * provenance in an attribute helps nobody and corrupts a URL.
 */
import { cleanStega } from "@voyant-travel/theme"

export type MenuItem = { label: string; href: string; items?: MenuItem[] }

export const PALETTES = ["forest", "ocean", "sand", "ink", "midnight"] as const
export type Palette = (typeof PALETTES)[number]

export const CORNERS = ["square", "soft", "round"] as const
export const HEADER_STYLES = ["over-hero", "solid", "bordered"] as const
export const WIDTHS = { narrow: "38rem", regular: "44rem", wide: "54rem" } as const

type Settings = Record<string, unknown>

function one<T extends string>(
  settings: Settings,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = settings[key]
  if (typeof value !== "string") return fallback
  const clean = cleanStega(value).trim()
  return (allowed as readonly string[]).includes(clean) ? (clean as T) : fallback
}

/** A settings string with provenance stripped — these are all chrome values. */
function textOf(settings: Settings, key: string): string | undefined {
  const value = settings[key]
  if (typeof value !== "string") return undefined
  const trimmed = cleanStega(value).trim()
  return trimmed === "" ? undefined : trimmed
}

function linkOf(settings: Settings, key: string): string | undefined {
  const value = textOf(settings, key)
  if (!value) return undefined
  return /^\/(?!\/)/.test(value) || /^(?:https?:|mailto:|tel:)/i.test(value)
    ? value
    : undefined
}

export type SiteSettings = ReturnType<typeof readSettings>

export function readSettings(settings: Settings) {
  const requestedAccent = textOf(settings, "accent-color")
  /**
   * The one free-text colour, matched against a strict pattern.
   *
   * This lands inside a `style` attribute. Anything that is not exactly a hex
   * colour is discarded rather than escaped, because a colour that cannot be
   * parsed has no useful degraded form.
   */
  const accent =
    requestedAccent && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(requestedAccent)
      ? requestedAccent
      : undefined

  return {
    palette: one(settings, "palette", PALETTES, "forest"),
    accent,
    corners: one(settings, "corner-style", CORNERS, "square"),
    headerStyle: one(settings, "header-style", HEADER_STYLES, "over-hero"),
    contentWidth:
      WIDTHS[
        one(settings, "content-width", ["regular", "narrow", "wide"] as const, "regular")
      ],
    grain: settings["paper-grain"] !== false,

    headerCtaLabel: textOf(settings, "header-cta-label"),
    headerCtaHref: linkOf(settings, "header-cta-href"),

    phone: textOf(settings, "phone"),
    email: textOf(settings, "email"),
    address: textOf(settings, "address"),
    footerNote: textOf(settings, "footer-note"),

    social: [
      { name: "Instagram", href: linkOf(settings, "social-instagram"), icon: "instagram" },
      { name: "Facebook", href: linkOf(settings, "social-facebook"), icon: "facebook" },
      { name: "YouTube", href: linkOf(settings, "social-youtube"), icon: "youtube" },
      { name: "LinkedIn", href: linkOf(settings, "social-linkedin"), icon: "linkedin" },
    ].filter((entry): entry is { name: string; href: string; icon: string } =>
      Boolean(entry.href),
    ),
  }
}

/** A `tel:` target from however the operator wrote the number. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`
}

function sanitizeItems(items: unknown, depth = 0): MenuItem[] {
  if (!Array.isArray(items) || depth > 1) return []
  return items.flatMap((raw): MenuItem[] => {
    if (typeof raw !== "object" || raw === null) return []
    const record = raw as Record<string, unknown>
    // The label is a text node, so it keeps provenance; the href is an
    // attribute, so it does not.
    const label = typeof record.label === "string" ? record.label : ""
    if (cleanStega(label).trim() === "") return []
    const href =
      typeof record.href === "string" ? cleanStega(record.href).trim() : ""
    if (href === "" || /^(?:javascript|vbscript|data):/i.test(href)) return []
    const children = sanitizeItems(record.items, depth + 1)
    return [{ label, href, ...(children.length > 0 ? { items: children } : {}) }]
  })
}

/**
 * The primary navigation.
 *
 * `primary` is the conventional menu key, but a site that never created a menu
 * still has `navigation`. Falling back to it is what keeps a freshly installed
 * site from rendering a header with nothing in it.
 */
export function primaryMenu(context: {
  menus?: Record<string, unknown>
  navigation?: unknown
}): MenuItem[] {
  const named = sanitizeItems(context.menus?.primary)
  return named.length > 0 ? named : sanitizeItems(context.navigation)
}

/**
 * Footer columns, one per menu whose key begins `footer`.
 *
 * A tour operator's footer is a sitemap — destinations, trip styles, company,
 * legal — so the theme reads however many the operator made rather than fixing
 * a number. The key supplies the column heading when it is more than the bare
 * word `footer`.
 */
export function footerMenus(context: {
  menus?: Record<string, unknown>
}): Array<{ title?: string; items: MenuItem[] }> {
  const menus = context.menus ?? {}
  return Object.keys(menus)
    .filter((key) => key.toLowerCase().startsWith("footer"))
    .sort()
    .map((key) => {
      const items = sanitizeItems(menus[key])
      const label = key.replace(/^footer[-_]?/i, "").replace(/[-_]+/g, " ").trim()
      return {
        ...(label === ""
          ? {}
          : { title: label.charAt(0).toUpperCase() + label.slice(1) }),
        items,
      }
    })
    .filter((column) => column.items.length > 0)
}
