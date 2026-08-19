/**
 * The listing of every place an operator sells.
 *
 * Same arrangement as a destination page and for the same reason: there is no
 * `destinationIndex` context in the contract, and collections carry no fixture
 * key, so this is a `content` page the platform has assigned the
 * `destination-index` template to, with its structure in that page's free-form
 * `settings` record.
 *
 * Grouped rather than flat. An agency that sells sixty places has to organise
 * them somehow, and the operator's own grouping — by continent, by how far it
 * is, by what people call the region — is better than any the theme could
 * impose. The theme's job is to render whatever grouping arrives and to say
 * nothing when a group turns out to be empty.
 */

export interface IndexedDestination {
  title: string
  href: string
  image?: { src: string; alt: string }
  blurb?: string
  region?: string
  tripCount?: number
  priceFrom?: number
  currency?: string
}

export interface DestinationGroup {
  name: string
  destinations: IndexedDestination[]
}

export interface DestinationIndex {
  heading?: string
  standfirst?: string
  hero?: { src: string; alt: string }
  groups: DestinationGroup[]
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
 * An image, or nothing. Alt defaults to empty rather than to the title: the
 * picture sits beside the name it illustrates, and repeating it makes a screen
 * reader say the place twice.
 */
function image(value: unknown): { src: string; alt: string } | undefined {
  const row = rows([value])[0]
  const src = str(row?.["src"])
  return src ? { src, alt: str(row?.["alt"]) ?? "" } : undefined
}

function destinations(value: unknown): IndexedDestination[] {
  return rows(value).flatMap((row) => {
    const title = str(row["title"])
    const href = str(row["href"])
    /* A place with nowhere to go is a dead card. Drop it rather than render it. */
    if (!title || !href) return []
    return [
      {
        title,
        href,
        ...(image(row["image"]) ? { image: image(row["image"])! } : {}),
        ...(str(row["blurb"]) ? { blurb: str(row["blurb"])! } : {}),
        ...(str(row["region"]) ? { region: str(row["region"])! } : {}),
        ...(num(row["tripCount"]) !== undefined
          ? { tripCount: num(row["tripCount"])! }
          : {}),
        ...(num(row["priceFrom"]) !== undefined
          ? { priceFrom: num(row["priceFrom"])! }
          : {}),
        ...(str(row["currency"]) ? { currency: str(row["currency"])! } : {}),
      },
    ]
  })
}

export function readDestinationIndex(
  settings: Record<string, unknown>,
): DestinationIndex {
  return {
    ...(str(settings["index-heading"]) ? { heading: str(settings["index-heading"])! } : {}),
    ...(str(settings["index-standfirst"])
      ? { standfirst: str(settings["index-standfirst"])! }
      : {}),
    ...(image(settings["index-hero"]) ? { hero: image(settings["index-hero"])! } : {}),
    /*
     * A group whose places all failed to parse is dropped here rather than
     * left for the template to skip. The jump bar is built from this list, and
     * a heading in it that scrolls to an empty section is the one navigation
     * failure a long index page cannot afford.
     */
    groups: rows(settings["index-groups"]).flatMap((row) => {
      const name = str(row["name"])
      if (!name) return []
      const places = destinations(row["destinations"])
      return places.length > 0 ? [{ name, destinations: places }] : []
    }),
    ...(str(settings["index-enquiry"])
      ? { enquiryHref: str(settings["index-enquiry"])! }
      : {}),
  }
}

/** A stable anchor for a group name, so the jump bar and the sections agree. */
export function groupSlug(name: string): string {
  return (
    name
      .toLowerCase()
      /* Romanian diacritics decompose, so this keeps ș/ț/ă out of the fragment. */
      .normalize("NFD")
      .replace(/[̀-̧̦ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "grup"
  )
}
