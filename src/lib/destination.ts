/**
 * A destination page, read out of a content page's settings.
 *
 * There is no `destinationDetail` context in the contract, and collections have
 * no fixture key, so a destination is a `content` page the platform has
 * assigned the `destination` template to. Its structured content arrives in the
 * context's free-form `settings` record, which is the only place a content page
 * can carry anything beyond a title, a summary and a body.
 *
 * Everything here is parsed defensively. `settings` is `Record<string, unknown>`
 * by contract — it is whatever an operator's CMS mapped into it — so a missing
 * key, a string where an array belongs, or a half-filled row must produce a
 * shorter page rather than a stack trace. A destination that only fills three
 * sections is a legitimate destination.
 */

export interface DestinationLink {
  label: string
  href: string
}

export interface DestinationImage {
  src: string
  alt: string
}

/** One trip merchandised from the destination. */
export interface DestinationTrip {
  title: string
  href: string
  image?: DestinationImage
  /** Duration and a from-price are the two fields every reference card carries. */
  nights?: number
  priceFrom?: number
  currency?: string
  excerpt?: string
  region?: string
}

/** One alternating image/prose block — the editorial body of the page. */
export interface DestinationStory {
  heading: string
  body: string
  image?: DestinationImage
  cta?: DestinationLink
}

/** A place within the destination, or a property in it. */
export interface DestinationTile {
  title: string
  hook?: string
  body?: string
  image?: DestinationImage
  href?: string
}

export interface DestinationExpert {
  name: string
  role?: string
  image?: DestinationImage
}

export interface DestinationQuestion {
  question: string
  answer: string
}

export interface Destination {
  /** The SEO headline, which is not the same string as the place name. */
  heading?: string
  hero?: DestinationImage
  intro?: { standfirst?: string; body?: string; cta?: DestinationLink }
  trips: DestinationTrip[]
  tripsAllHref?: string
  experiences: DestinationTile[]
  stories: DestinationStory[]
  places: DestinationTile[]
  stays: DestinationTile[]
  staysAllHref?: string
  experts: DestinationExpert[]
  expertNote?: string
  questions: DestinationQuestion[]
  siblings: DestinationTile[]
  enquiryHref?: string
}

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined

const num = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined

const rows = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.flatMap((row: unknown) =>
        row !== null && typeof row === "object" && !Array.isArray(row)
          ? [row as Record<string, unknown>]
          : [],
      )
    : []

/**
 * An image, or nothing.
 *
 * Alt text defaults to empty rather than to the title. These pictures sit beside
 * the words they illustrate, so repeating the heading into the alt attribute
 * makes a screen reader say it twice — an empty alt on a decorative photograph
 * is the correct answer, not a missing one.
 */
function image(value: unknown): DestinationImage | undefined {
  const row = rows([value])[0]
  const src = str(row?.["src"])
  return src ? { src, alt: str(row?.["alt"]) ?? "" } : undefined
}

function link(value: unknown): DestinationLink | undefined {
  const row = rows([value])[0]
  const label = str(row?.["label"])
  const href = str(row?.["href"])
  return label && href ? { label, href } : undefined
}

function tiles(value: unknown): DestinationTile[] {
  return rows(value).flatMap((row) => {
    const title = str(row["title"])
    if (!title) return []
    return [
      {
        title,
        ...(str(row["hook"]) ? { hook: str(row["hook"])! } : {}),
        ...(str(row["body"]) ? { body: str(row["body"])! } : {}),
        ...(image(row["image"]) ? { image: image(row["image"])! } : {}),
        ...(str(row["href"]) ? { href: str(row["href"])! } : {}),
      },
    ]
  })
}

export function readDestination(settings: Record<string, unknown>): Destination {
  const get = (key: string): unknown => settings[key]

  return {
    ...(str(get("destination-heading")) ? { heading: str(get("destination-heading"))! } : {}),
    ...(image(get("destination-hero")) ? { hero: image(get("destination-hero"))! } : {}),
    intro: {
      ...(str(get("destination-standfirst"))
        ? { standfirst: str(get("destination-standfirst"))! }
        : {}),
      ...(str(get("destination-intro")) ? { body: str(get("destination-intro"))! } : {}),
      ...(link(get("destination-cta")) ? { cta: link(get("destination-cta"))! } : {}),
    },
    trips: rows(get("destination-trips")).flatMap((row) => {
      const title = str(row["title"])
      const href = str(row["href"])
      if (!title || !href) return []
      return [
        {
          title,
          href,
          ...(image(row["image"]) ? { image: image(row["image"])! } : {}),
          ...(num(row["nights"]) !== undefined ? { nights: num(row["nights"])! } : {}),
          ...(num(row["priceFrom"]) !== undefined
            ? { priceFrom: num(row["priceFrom"])! }
            : {}),
          ...(str(row["currency"]) ? { currency: str(row["currency"])! } : {}),
          ...(str(row["excerpt"]) ? { excerpt: str(row["excerpt"])! } : {}),
          ...(str(row["region"]) ? { region: str(row["region"])! } : {}),
        },
      ]
    }),
    ...(str(get("destination-trips-all"))
      ? { tripsAllHref: str(get("destination-trips-all"))! }
      : {}),
    experiences: tiles(get("destination-experiences")),
    stories: rows(get("destination-stories")).flatMap((row) => {
      const heading = str(row["heading"])
      const body = str(row["body"])
      if (!heading || !body) return []
      return [
        {
          heading,
          body,
          ...(image(row["image"]) ? { image: image(row["image"])! } : {}),
          ...(link(row["cta"]) ? { cta: link(row["cta"])! } : {}),
        },
      ]
    }),
    places: tiles(get("destination-places")),
    stays: tiles(get("destination-stays")),
    ...(str(get("destination-stays-all"))
      ? { staysAllHref: str(get("destination-stays-all"))! }
      : {}),
    experts: rows(get("destination-experts")).flatMap((row) => {
      const name = str(row["name"])
      if (!name) return []
      return [
        {
          name,
          ...(str(row["role"]) ? { role: str(row["role"])! } : {}),
          ...(image(row["image"]) ? { image: image(row["image"])! } : {}),
        },
      ]
    }),
    ...(str(get("destination-expert-note"))
      ? { expertNote: str(get("destination-expert-note"))! }
      : {}),
    questions: rows(get("destination-questions")).flatMap((row) => {
      const question = str(row["question"])
      const answer = str(row["answer"])
      return question && answer ? [{ question, answer }] : []
    }),
    siblings: tiles(get("destination-siblings")),
    ...(str(get("destination-enquiry"))
      ? { enquiryHref: str(get("destination-enquiry"))! }
      : {}),
  }
}

/**
 * The anchors this destination can actually fill.
 *
 * Built from the content, never hard-coded, for the same reason the product
 * page builds its own: a sticky nav is the only navigation on a page this long,
 * and a link in it that scrolls nowhere is worse than one that is absent.
 */
export type DestinationSectionId =
  | "overview"
  | "trips"
  | "experiences"
  | "see"
  | "where"
  | "team"
  | "faqs"

/**
 * The anchors this destination can actually fill.
 *
 * Ids only. The words beside them are the template's, resolved per locale —
 * this module has no language, and a label baked in here would be the one
 * string on the page that could not be translated.
 *
 * Built from the content, never hard-coded, for the same reason the product
 * page builds its own: a sticky nav is the only navigation on a page this long,
 * and a link in it that scrolls nowhere is worse than one that is absent.
 */
export function destinationSections(
  destination: Destination,
): DestinationSectionId[] {
  const sections: DestinationSectionId[] = []
  if (destination.intro?.body) sections.push("overview")
  if (destination.trips.length > 0) sections.push("trips")
  if (destination.experiences.length > 0) sections.push("experiences")
  if (destination.stories.length > 0) sections.push("see")
  if (destination.places.length > 0 || destination.stays.length > 0) sections.push("where")
  if (destination.experts.length > 0) sections.push("team")
  if (destination.questions.length > 0) sections.push("faqs")
  return sections
}
