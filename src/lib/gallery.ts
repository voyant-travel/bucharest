/**
 * The catalogue behind `/dev/gallery`.
 *
 * Nothing here is authored twice. `theme.config.ts` already declares every
 * section an operator can place — its settings, their types and defaults, its
 * blocks, and the presets they insert from the editor — because that
 * declaration is what the editor renders. A gallery needs the same
 * information, so it reads the manifest rather than carrying a parallel set of
 * stories that drift from it. Adding a section to the manifest adds it to the
 * gallery; there is no second list to remember.
 *
 * Dev-only. Every page that imports this returns 404 outside `astro dev`.
 */
import type { ThemePageContext } from "@voyant-travel/theme"
import {
  frameQuery,
  framePath,
  navQuery,
  overviewPath,
  sectionPath,
  variantPath,
} from "./gallery-paths"
import theme from "../../theme.config"
import { isKnownSection } from "./section-registry"
import { sectionInstances, type SectionInstance, type SectionSettings } from "./sections"

export { frameQuery, framePath, navQuery, overviewPath, sectionPath, variantPath }
export type { FrameState } from "./gallery-paths"

/** One control in a section's `settings`, as the manifest declares it. */
export interface SettingDecl {
  id: string
  label?: string
  type: string
  default?: unknown
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  step?: number
  unit?: string
  info?: string
  placeholder?: string
  required?: boolean
}

export interface BlockDecl {
  type: string
  name?: string
  limit?: number
  settings?: SettingDecl[]
}

export interface PresetDecl {
  name: string
  settings?: SectionSettings
  blocks?: { type: string; settings?: SectionSettings }[]
}

export interface SectionDecl {
  id: string
  name?: string
  description?: string
  settings?: SettingDecl[]
  blocks?: BlockDecl[]
  presets?: PresetDecl[]
  templates?: string[]
  limit?: number
  max_blocks?: number
}

/**
 * The manifest is typed against the contract's own union, which is far more
 * precise than a gallery needs and varies per setting type. One cast at the
 * boundary keeps that precision out of every call site below.
 */
const declared = (theme.manifest.sections ?? []) as unknown as SectionDecl[]

/** The fixture home page, read through the same parser the real page uses. */
const fixtures = sectionInstances(
  (theme.fixtures?.home as { sections?: unknown } | undefined)?.sections,
)

/**
 * Sections this build can actually render.
 *
 * A manifest entry with no branch in `HomeSections.astro` would render as an
 * empty frame and read as a styling bug, so the gallery filters on the same
 * registry the page filters on.
 */
export const GALLERY_SECTIONS: SectionDecl[] = declared.filter((section) =>
  isKnownSection(section.id),
)

export function sectionDecl(id: string | undefined): SectionDecl | undefined {
  return GALLERY_SECTIONS.find((section) => section.id === id)
}

/** One rendering of a section, and the thing looking at it is meant to prove. */
export interface Variant {
  id: string
  label: string
  note: string
}

/**
 * The site chrome, as things you can open on their own.
 *
 * The header and footer are not sections — an operator never places them, so
 * they have no manifest entry and no presets. They are still the two pieces of
 * the theme most likely to be wrong and hardest to catch, because on a real
 * page they are always someone else's backdrop. Given their own frames they
 * can be reviewed for what they are.
 *
 * Their controls come from `manifest.settings`, the site-level declarations
 * the operator actually edits, filtered to the ones each part reads. So the
 * rule holds here too: the manifest declares, the gallery renders.
 */
const siteSettingDecls = (theme.manifest.settings ?? []) as unknown as SettingDecl[]

export interface ChromePart {
  id: string
  name: string
  description: string
  /** Site settings this part responds to, in the order they read best. */
  settingIds: string[]
  variants: Variant[]
  /** Site settings each variant starts from, before your overrides. */
  presets: Record<string, Record<string, unknown>>
}

export const CHROME_PARTS: ChromePart[] = [
  {
    id: "site-header",
    name: "Navigation",
    description:
      "The fixed header: transparency over a hero, the call to action, and the mobile drawer.",
    settingIds: [
      "header-style",
      "header-cta-label",
      "header-cta-href",
      "phone",
      "palette",
      "corner-style",
    ],
    variants: [
      {
        id: "over-hero",
        label: "Over a hero",
        note: "Transparent white type, until the hero scrolls past. Scroll the frame.",
      },
      {
        id: "solid",
        label: "Solid",
        note: "Opaque from the top, which is what every page without a hero gets.",
      },
      {
        id: "bordered",
        label: "Solid with a rule",
        note: "The same, with a hairline under it.",
      },
      {
        id: "with-cta",
        label: "With a call to action",
        note: "The optional button and telephone number, which change the spacing.",
      },
    ],
    presets: {
      "over-hero": { "header-style": "over-hero" },
      solid: { "header-style": "solid" },
      bordered: { "header-style": "bordered" },
      "with-cta": {
        "header-style": "solid",
        "header-cta-label": "Speak to a specialist",
        "header-cta-href": "/pages/about",
        phone: "+40 21 000 0000",
      },
    },
  },
  {
    id: "site-footer",
    name: "Footer",
    description:
      "Menus, contact, trust marks and the legal identity a travel agency has to publish.",
    settingIds: [
      "footer-columns",
      "footer-note",
      "phone",
      "email",
      "address",
      "payment-methods",
      "payment-secured-by",
      "anpc-marks",
      "legal-name",
      "legal-registration",
      "legal-address",
      "licence-line",
      "insolvency-line",
      "insolvency-expires",
      "emergency-phone",
      "traveller-rights-url",
      "social-instagram",
      "social-facebook",
      "palette",
    ],
    variants: [
      {
        id: "default",
        label: "Default",
        note: "What the fixture publishes: menus, and nothing optional filled in.",
      },
      {
        id: "furnished",
        label: "Furnished",
        note: "Contact details and social marks — the shape most agencies ship.",
      },
      {
        id: "compliant",
        label: "Romanian agency",
        note: "Everything a licensed Romanian tour operator must publish.",
      },
      {
        id: "lapsed",
        label: "Lapsed cover",
        note: "The insolvency policy expired. The footer has to say so, not hide it.",
      },
      {
        id: "withdrawn",
        label: "Withdrawn SOL mark",
        note: "The pre-2026 mark set, still serving a badge that links nowhere.",
      },
    ],
    presets: {
      default: {},
      furnished: {
        phone: "+40 21 000 0000",
        email: "hello@example.com",
        address: "14 Strada Lipscani\nBucharest 030033\nRomania",
        "footer-note":
          "Registered in Romania. Client money is held in a separate trust account.",
        "social-instagram": "https://instagram.com/example",
        "social-facebook": "https://facebook.com/example",
      },
      compliant: {
        phone: "+40 21 000 0000",
        email: "rezervari@example.ro",
        address: "14 Strada Lipscani\nBucharest 030033\nRomania",
        "footer-columns": "5",
        "legal-name": "EXAMPLE TOUR S.A.",
        "legal-registration": "CUI RO9617078 · J40/5529/1997",
        "legal-address": "Bd. Nicolae Bălcescu 25, Sector 1, București",
        "licence-line": "Licență de turism nr. 405/21.10.2021",
        "insolvency-line":
          "Poliță asigurare nr. 59100 / 06.12.2025 – 05.12.2026, Omniasig",
        "insolvency-expires": "2027-12-05",
        "emergency-phone": "+40 21 000 0001",
        "traveller-rights-url": "/pages/about",
        "payment-methods":
          "Visa, Mastercard, Plata în rate, Plata în agenție, Transfer bancar",
        "payment-secured-by": "Plăți securizate 3-D Secure",
        "anpc-marks": "ro-2026",
        "social-instagram": "https://instagram.com/example",
      },
      lapsed: {
        "legal-name": "EXAMPLE TOUR S.A.",
        "legal-registration": "CUI RO9617078 · J40/5529/1997",
        "licence-line": "Licență de turism nr. 405/21.10.2021",
        "insolvency-line":
          "Poliță asigurare nr. 59100 / 06.12.2023 – 05.12.2024, Omniasig",
        "insolvency-expires": "2024-12-05",
        "anpc-marks": "ro-2026",
      },
      withdrawn: {
        "legal-name": "EXAMPLE TOUR S.A.",
        "licence-line": "Licență de turism nr. 405/21.10.2021",
        "anpc-marks": "ro-2022",
        "payment-methods": "Visa, Mastercard",
      },
    },
  },
]

export function chromePart(id: string | undefined): ChromePart | undefined {
  return CHROME_PARTS.find((part) => part.id === id)
}

/**
 * The foundations: the decisions every component inherits.
 *
 * A component gallery that stops at components leaves the two things most
 * often argued about undocumented — what the colors actually are, and what the
 * type scale actually is. Both are rendered through the theme's own stylesheet
 * rather than transcribed into a table, so they cannot drift: a swatch is a
 * `var(--accent)`, not a hex someone typed.
 */
export interface FoundationPage {
  id: string
  name: string
  description: string
  variants: Variant[]
}

export const FOUNDATIONS: FoundationPage[] = [
  {
    id: "foundation-color",
    name: "Color",
    description:
      "The palette tokens every section reads, and how they behave across the five palettes.",
    variants: [
      {
        id: "tokens",
        label: "Tokens",
        note: "Every token in the palette selected above, with what it is for.",
      },
      {
        id: "palettes",
        label: "All palettes",
        note: "The five palettes side by side — the fastest way to spot one that breaks.",
      },
      {
        id: "pairs",
        label: "Contrast pairs",
        note: "The foreground and background combinations the theme actually uses.",
      },
    ],
  },
  {
    id: "foundation-type",
    name: "Typography",
    description:
      "Two families and the utilities that place them: display, body, eyebrow and prose.",
    variants: [
      {
        id: "scale",
        label: "Scale",
        note: "Every type utility at the size it renders, in order of weight.",
      },
      {
        id: "specimens",
        label: "Specimens",
        note: "Both families across their weights and italics.",
      },
    ],
  },
]

export function foundationPage(
  id: string | undefined,
): FoundationPage | undefined {
  return FOUNDATIONS.find((page) => page.id === id)
}

/** The declared settings this part reads, in the order the part lists them. */
export function chromeSettings(part: ChromePart): SettingDecl[] {
  return part.settingIds.flatMap((id) => {
    const decl = siteSettingDecls.find((setting) => setting.id === id)
    return decl ? [decl] : []
  })
}

/** The site settings a chrome frame renders with. */
export function chromeSiteSettings(
  part: ChromePart,
  variant: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...(part.presets[variant] ?? {}), ...overrides }
}

/** Control values for a chrome part, read the same way a section's are. */
export function chromeOverridesFrom(
  params: URLSearchParams,
  part: ChromePart,
): Record<string, unknown> {
  const overrides: Record<string, unknown> = {}
  for (const decl of chromeSettings(part)) {
    const raw = params.get(`s.${decl.id}`)
    if (raw === null) continue
    const value = coerce(raw, decl)
    if (value !== undefined) overrides[decl.id] = value
  }
  return overrides
}

export function variantsFor(section: SectionDecl): Variant[] {
  const variants: Variant[] = []

  if (fixtures.some((instance) => instance.type === section.id)) {
    variants.push({
      id: "fixture",
      label: "Fixture",
      note: "The instance the local home page actually renders.",
    })
  }

  section.presets?.forEach((preset, index) => {
    variants.push({
      id: `preset-${index}`,
      label: preset.name,
      note: "What an operator gets the moment they insert this section.",
    })
  })

  variants.push({
    id: "defaults",
    label: "Defaults",
    note: "Declared defaults only — no authored copy, no blocks.",
  })

  /*
   * The empty state is last and always present. `src/theme/sections.ts` states
   * the rule — every section renders with nothing filled in, because an
   * operator places a section before writing its copy and a blank screen reads
   * as broken — and until now nothing showed whether it held.
   */
  variants.push({
    id: "empty",
    label: "Empty",
    note: "Nothing filled in. Must still render as something.",
  })

  return variants
}

export function variantLabel(section: SectionDecl, id: string): string {
  return variantsFor(section).find((variant) => variant.id === id)?.label ?? id
}

function defaultSettings(section: SectionDecl): SectionSettings {
  const settings: SectionSettings = {}
  for (const decl of section.settings ?? []) {
    if (decl.default !== undefined) settings[decl.id] = decl.default
  }
  return settings
}

function baseFor(
  section: SectionDecl,
  variant: string,
): Pick<SectionInstance["data"], "settings" | "blocks"> {
  if (variant === "fixture") {
    const instance = fixtures.find((candidate) => candidate.type === section.id)
    if (instance) {
      return { settings: instance.data.settings, blocks: instance.data.blocks }
    }
  }

  const preset = variant.startsWith("preset-")
    ? section.presets?.[Number(variant.slice("preset-".length))]
    : undefined
  if (preset) {
    return {
      settings: { ...(preset.settings ?? {}) },
      blocks: (preset.blocks ?? []).map((block, index) => ({
        id: `${section.id}-preset-block-${index}`,
        type: block.type,
        settings: { ...(block.settings ?? {}) },
      })),
    }
  }

  if (variant === "defaults") return { settings: defaultSettings(section), blocks: [] }

  return { settings: {}, blocks: [] }
}

/** A renderable instance, in the exact envelope a publication would deliver. */
export function instanceFor(
  section: SectionDecl,
  variant: string,
  overrides: SectionSettings = {},
): SectionInstance {
  const base = baseFor(section, variant)
  return {
    type: section.id,
    data: {
      id: `gallery-${section.id}-${variant}`,
      settings: { ...base.settings, ...overrides },
      blocks: base.blocks,
    },
  }
}

/** The variant worth showing first when only one frame fits. */
export function primaryVariant(section: SectionDecl): string {
  return variantsFor(section)[0]?.id ?? "empty"
}

function coerce(raw: string, decl: SettingDecl): unknown {
  if (decl.type === "range") {
    const value = Number(raw)
    return Number.isFinite(value) ? value : undefined
  }
  if (decl.type === "checkbox") return raw === "true"
  return raw
}

/**
 * Control values from the query string, keyed `s.<setting-id>`.
 *
 * Only declared settings are read. An empty string is kept rather than
 * dropped, because clearing a field is how you check what a section does
 * without it — which is the whole point of having the controls.
 */
export function overridesFrom(
  params: URLSearchParams,
  section: SectionDecl,
): SectionSettings {
  const overrides: SectionSettings = {}
  for (const decl of section.settings ?? []) {
    const raw = params.get(`s.${decl.id}`)
    if (raw === null) continue
    const value = coerce(raw, decl)
    if (value !== undefined) overrides[decl.id] = value
  }
  return overrides
}

/** The sweeps: one variant, pinned across every section at once. */
export const OVERVIEW_MODES = [
  {
    id: "primary",
    label: "Primary",
    note: "Fixture where there is one, otherwise the preset.",
    hint: "",
  },
  {
    id: "defaults",
    label: "Defaults",
    note: "Declared defaults only, across every section.",
    hint: "",
  },
  {
    id: "empty",
    label: "Empty",
    note: "Nothing filled in, across every section.",
    hint: "every section, blank",
  },
] as const

export type OverviewMode = (typeof OVERVIEW_MODES)[number]["id"]

export function overviewMode(value: string | undefined) {
  return OVERVIEW_MODES.find((mode) => mode.id === value)
}

/**
 * What the React shell receives.
 *
 * Everything crossing into the island has to survive `JSON.stringify`, so the
 * manifest's declarations are flattened here rather than passed as the live
 * objects — the shell renders controls from these and never reaches back into
 * `theme.config.ts`.
 */
export interface ShellSection {
  id: string
  name: string
  description?: string
  variants: Variant[]
}

export function shellSections(): ShellSection[] {
  return GALLERY_SECTIONS.map((section) => ({
    id: section.id,
    name: section.name ?? section.id,
    description: section.description,
    variants: variantsFor(section),
  }))
}

export type ShellView =
  | {
      kind: "overview"
      mode: string
      label: string
      note: string
      items: {
        sectionId: string
        name: string
        description?: string
        variant: string
        label: string
        variantCount: number
      }[]
    }
  | {
      kind: "section"
      group: "section" | "chrome" | "foundation"
      sectionId: string
      name: string
      /** Every variant, so the docs tab can list what else there is. */
      variants: Variant[]
      description?: string
      variantId: string
      variantLabel: string
      variantNote: string
      settings: SettingDecl[]
      blocks: BlockDecl[]
      maxBlocks?: number
      resolved: SectionInstance
    }

export interface ShellData {
  sections: ShellSection[]
  chrome: ShellSection[]
  foundations: ShellSection[]
  overviews: typeof OVERVIEW_MODES
  palettes: readonly string[]
  corners: readonly string[]
  stages: { id: string; label: string; width: string }[]
  frame: Frame
  overrides: Record<string, string>
  view: ShellView
}

/** The frame's presentation options, in a form the island can map over. */
export function shellChrome() {
  return {
    sections: shellSections(),
    chrome: CHROME_PARTS.map((part) => ({
      id: part.id,
      name: part.name,
      description: part.description,
      variants: part.variants,
    })),
    foundations: FOUNDATIONS.map((page) => ({
      id: page.id,
      name: page.name,
      description: page.description,
      variants: page.variants,
    })),
    overviews: OVERVIEW_MODES,
    palettes: PALETTES,
    corners: CORNERS,
    stages: Object.entries(STAGES).map(([id, stage]) => ({ id, ...stage })),
  }
}

/** Query overrides as plain strings, which is what the controls bind to. */
export function overrideStrings(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, value] of params.entries()) {
    if (name.startsWith("s.")) out[name.slice(2)] = value
  }
  return out
}

export const PALETTES = ["forest", "ocean", "sand", "ink", "midnight"] as const
export const CORNERS = ["square", "soft", "round"] as const

export const STAGES = {
  phone: { label: "Phone", width: "390px" },
  tablet: { label: "Tablet", width: "768px" },
  full: { label: "Full", width: "100%" },
} as const

export type StageId = keyof typeof STAGES

/** The presentation the whole gallery is pinned to, shared by every frame. */
export interface Frame {
  palette: (typeof PALETTES)[number]
  corners: (typeof CORNERS)[number]
  stage: StageId
  grain: boolean
}

function pick<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = params.get(key)
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

export function readFrame(params: URLSearchParams): Frame {
  return {
    palette: pick(params, "palette", PALETTES, "forest"),
    corners: pick(params, "corners", CORNERS, "square"),
    stage: pick(params, "stage", Object.keys(STAGES) as StageId[], "full"),
    grain: params.get("grain") !== "0",
  }
}

/**
 * The page context a frame renders inside.
 *
 * The fixture home, with the gallery's palette, corners and grain pinned over
 * whatever it declared. Reusing the fixture rather than inventing a context is
 * what gives a frame a real header and footer: the navigation, menus, site
 * name and logo a section actually sits between come from the same place the
 * local home page gets them, so a heading colliding with the fixed header is
 * visible here instead of only on the live page.
 */
export function frameContext(
  frame: Frame,
  site: Record<string, unknown> = {},
): ThemePageContext {
  const home = (theme.fixtures?.home ?? {}) as Record<string, unknown>
  return {
    ...home,
    settings: {
      ...((home.settings as Record<string, unknown>) ?? {}),
      palette: frame.palette,
      "corner-style": frame.corners,
      "paper-grain": frame.grain,
      /*
       * A chrome part's own settings win over the frame's, so opening the
       * header with `palette` in its controls edits the same key the toolbar
       * does rather than fighting it.
       */
      ...site,
    },
  } as unknown as ThemePageContext
}

