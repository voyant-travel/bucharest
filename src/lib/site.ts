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

/**
 * A list authored one per line as `code|Label = /href`.
 *
 * The code is what the closed switcher shows and the label is what the open
 * one does — "RO" in a bar that has room for two characters, "Română" in a
 * list that has room for the word. The code is optional and derived from the
 * label when it is missing, because an operator who writes only "Română"
 * should still get a switcher rather than an error.
 *
 * Forgiving on purpose: someone typing into a textarea will use a colon, drop
 * the spaces, or leave a blank line, and none of that should cost them the
 * feature. A leading `*` marks the entry that is current.
 */
export function pairs(
  value: string | undefined,
): Array<{ code: string; label: string; href: string; current: boolean }> {
  if (!value) return []
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const current = line.startsWith("*")
      const body = current ? line.slice(1).trim() : line
      const [rawLeft, rawHref] = body.split(/\s*[=:]\s*/, 2)
      const href = rawHref?.trim()
      if (!rawLeft || !href) return []
      if (!/^\/(?!\/)/.test(href) && !/^https?:/i.test(href)) return []

      /* `ro|Română`, or just `Română` and the code is taken from it. */
      const [maybeCode, maybeLabel] = rawLeft.split("|")
      const label = (maybeLabel ?? maybeCode).trim()
      if (!label) return []
      const code = (maybeLabel ? maybeCode.trim() : label.slice(0, 2)).toUpperCase()

      return [{ code, label, href, current }]
    })
}

export type PolicyStatus = "valid" | "expiring" | "lapsed" | "unknown"

/**
 * How much life is left in the insolvency policy.
 *
 * Thirty days is the warning window because renewing one takes weeks, not
 * days. An unparseable date is `unknown` rather than `lapsed`: the theme
 * should not accuse an operator of trading uninsured because they typed the
 * date in the wrong format.
 */
export function policyStatus(value: string | undefined): PolicyStatus {
  if (!value) return "unknown"
  const expires = Date.parse(value)
  if (Number.isNaN(expires)) return "unknown"
  const days = (expires - Date.now()) / 86_400_000
  if (days < 0) return "lapsed"
  return days < 30 ? "expiring" : "valid"
}

export type SiteSettings = ReturnType<typeof readSettings>

export function readSettings(settings: Settings) {
  const requestedAccent = textOf(settings, "accent-color")
  /**
   * The one free-text color, matched against a strict pattern.
   *
   * This lands inside a `style` attribute. Anything that is not exactly a hex
   * color is discarded rather than escaped, because a color that cannot be
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

    /*
     * Where booking buttons send a traveller. Bookings are taken by the
     * managed booking engine, so this is a destination, not an endpoint the
     * theme posts to. Unset is a supported state: the page then offers an
     * enquiry rather than a button that pretends to sell.
     */
    bookingUrl: textOf(settings, "booking-url"),

    phone: textOf(settings, "phone"),
    email: textOf(settings, "email"),
    address: textOf(settings, "address"),
    footerNote: textOf(settings, "footer-note"),

    /**
     * The compliance furniture.
     *
     * Grouped rather than spread through the settings object because it is one
     * subject with one audience: a regulator, or a traveller checking whether
     * this agency is real. Every field is optional — the theme also has to
     * serve markets with none of these duties — but a Romanian operator
     * leaving them blank gets a visibly incomplete footer, which is the right
     * kind of pressure.
     */
    legal: {
      name: textOf(settings, "legal-name"),
      registration: textOf(settings, "legal-registration"),
      address: textOf(settings, "legal-address"),
      capital: textOf(settings, "legal-capital"),
      licence: textOf(settings, "licence-line"),
      licenceUrl: linkOf(settings, "licence-register-url"),
      insolvency: textOf(settings, "insolvency-line"),
      insolvencyUrl: linkOf(settings, "insolvency-url"),
      /**
       * Whether the insolvency policy has lapsed or is about to.
       *
       * A footer advertising cover that expired last month is worse than one
       * advertising none, so this is surfaced rather than left to be noticed.
       */
      insolvencyStatus: policyStatus(textOf(settings, "insolvency-expires")),
      emergencyPhone: textOf(settings, "emergency-phone"),
      travellerRights: linkOf(settings, "traveller-rights-url"),
    },

    /**
     * Consumer-protection marks.
     *
     * `ro-2022` still carries SOL, which is why it is selectable at all: a site
     * that has not migrated should be able to say so truthfully rather than
     * silently render the current set. It is not the default, and the theme
     * marks it as withdrawn wherever it appears.
     */
    marks: one(settings, "anpc-marks", ["ro-2026", "ro-2022", "none"] as const, "ro-2026"),

    payment: (textOf(settings, "payment-methods") ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    paymentNote: textOf(settings, "payment-secured-by"),

    footerColumns: one(
      settings,
      "footer-columns",
      ["auto", "3", "4", "5", "6"] as const,
      "auto",
    ),

    /**
     * The strip above everything.
     *
     * Only rendered when there is something to say; an empty announcement bar
     * is a band of color that pushes the page down for no reason.
     */
    announcement: textOf(settings, "announcement")
      ? {
          text: textOf(settings, "announcement")!,
          href: linkOf(settings, "announcement-href"),
          linkLabel: textOf(settings, "announcement-link-label"),
          tone: one(settings, "announcement-tone", ["accent", "quiet"] as const, "accent"),
        }
      : undefined,

    utilityBar: settings["utility-bar"] !== false,
    phoneNote: textOf(settings, "phone-note"),
    locator: pairFrom(settings, "locator-label", "locator-href"),
    account: pairFrom(settings, "account-label", "account-href"),
    languages: pairs(textOf(settings, "languages")),

    /**
     * Currency, and whether the visitor may change it.
     *
     * `fixed` by default because a switcher is a promise: it says the agency
     * prices in those currencies, and a package quoted in EUR and settled in
     * RON at a rate nobody published is a complaint waiting to happen.
     */
    currencyMode: one(settings, "currency-mode", ["fixed", "switcher"] as const, "fixed"),
    currencies: (textOf(settings, "currencies") ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),

    secondaryCtaLabel: textOf(settings, "header-cta2-label"),
    secondaryCtaHref: linkOf(settings, "header-cta2-href"),

    /**
     * Uploaded marks, in two groups that must not be mixed.
     *
     * Payment marks say how you can pay; membership marks say who vouches for
     * the agency. Rendering them as one row invites the reader to read a card
     * scheme as an accreditation, which is a trust claim nobody made.
     */
    paymentBadges: badges(settings, "payment-badge", 6, false),
    partnerBadges: badges(settings, "partner-badge", 4, true),

    newsletter: textOf(settings, "newsletter-heading")
      ? {
          heading: textOf(settings, "newsletter-heading")!,
          body: textOf(settings, "newsletter-body"),
          cta: textOf(settings, "newsletter-cta") ?? "Subscribe",
          consent: textOf(settings, "newsletter-consent"),
        }
      : undefined,

    footerLocaleControls: settings["footer-locale-controls"] !== false,

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
export interface Badge {
  src: string
  alt: string
  href?: string
}

/**
 * The badge slots an operator filled, in order, skipping the ones they did not.
 *
 * Numbered slots rather than a repeater because site settings are flat, and an
 * image picker is the affordance that matters here — the operator has to be
 * able to upload the artwork their scheme or association licensed them, not
 * paste a URL and hope. A slot with no image is simply absent; a slot with an
 * image and no description is still rendered, with an empty `alt`, because a
 * decorative mark is better than a missing one and far better than a filename
 * read aloud.
 */
function badges(
  settings: Settings,
  prefix: string,
  count: number,
  linkable: boolean,
): Badge[] {
  const found: Badge[] = []
  for (let index = 1; index <= count; index += 1) {
    const src = imageOf(settings, `${prefix}-${index}`)
    if (!src) continue
    found.push({
      src,
      alt: textOf(settings, `${prefix}-${index}-alt`) ?? "",
      href: linkable ? linkOf(settings, `${prefix}-${index}-href`) : undefined,
    })
  }
  return found
}

/** An image the operator picked, checked the way every other URL here is. */
function imageOf(settings: Settings, key: string): string | undefined {
  const value = textOf(settings, key)
  if (!value) return undefined
  return /^\/(?!\/)/.test(value) || /^https:\/\//i.test(value) ? value : undefined
}

/** A label and a link that are only worth anything together. */
function pairFrom(
  settings: Settings,
  labelKey: string,
  hrefKey: string,
): { label: string; href: string } | undefined {
  const label = textOf(settings, labelKey)
  const href = linkOf(settings, hrefKey)
  return label && href ? { label, href } : undefined
}

/**
 * The utility menu, read the way the footer's menus are.
 *
 * These are links, so they live in a menu rather than in settings: an operator
 * edits them where they edit every other menu, and the list is as long as they
 * need rather than as long as the theme guessed.
 */
export function utilityMenu(context: { menus?: Record<string, unknown> }): MenuItem[] {
  return sanitizeItems(context.menus?.utility)
}

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
  /*
   * Publication order, not alphabetical.
   *
   * Sorting the keys put "Client" before "Companie" and buried "Rezervări"
   * last, which is not the order anybody authored — a footer is a sitemap and
   * its columns are an argument, made in sequence. Object keys preserve the
   * order they were written in, so honouring that is both simpler and what the
   * operator meant.
   */
  return Object.keys(menus)
    .filter((key) => key.toLowerCase().startsWith("footer"))
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
