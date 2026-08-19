/**
 * Structured data, and nothing the publication has not already said.
 *
 * Three rules run through this file.
 *
 * Nothing is invented. A tour operator's structured data is read by a machine
 * that will happily believe a rating nobody left, a price nobody quoted and a
 * profile nobody owns — and Google's remedy for that belief is a manual action
 * against the operator, not against the theme. So every value here comes from
 * a field the publication actually carries, and a field that is absent stays
 * absent. That is why each builder returns `undefined` rather than a husk with
 * empty strings in it: the caller can then emit no script tag at all, which is
 * the only honest way to say "this page has nothing to declare".
 *
 * Nothing is priced. The contract strips commercial values from a publication
 * snapshot and serves them live behind capabilities, so a `TouristTrip` built
 * from a snapshot has no price it could truthfully carry. `offers` is
 * therefore never emitted — fabricated offer data is the single most common
 * cause of a structured-data manual action, and a "from" price guessed here
 * would also contradict the page, which shows none.
 *
 * Nothing carries provenance. Editor text arrives with invisible stega
 * characters appended so the visual editor can trace a string back to its
 * field. Those characters are meant for a browser rendering a text node, not
 * for a crawler: left in, they turn a product name in JSON-LD into mojibake in
 * a rich result. Every string is cleaned on the way in.
 */
import {
  cleanStega,
  type CatalogProduct,
  type Cruise,
  type CruiseSailing,
  type ThemePageContext,
} from "@voyant-travel/theme"
import { coverOf, galleryOf, type ProductMedia } from "~/lib/catalog"
import type { SiteSettings } from "~/lib/site"

/**
 * A JSON-LD node.
 *
 * Deliberately a bag rather than a modelled type. Schema.org is open-world and
 * these builders emit a small, hand-checked subset of it; a hand-written
 * interface per type would be a second place to keep correct, and the thing
 * that has to be correct is which fields are emitted, not their TypeScript
 * shape.
 */
export type LdNode = Record<string, unknown>

const SCHEMA = "https://schema.org"

/** Only schemes a crawler will follow. `tel:` and `mailto:` are not locations. */
const WEB_SCHEMES = new Set(["http:", "https:"])

/** A crumb in a trail: what it is called, and the path it points at. */
export interface Crumb {
  name: string
  path: string
}

/**
 * A string as a crawler should receive it, or nothing at all.
 *
 * Empty and whitespace-only values become `undefined` rather than `""`, so a
 * caller's conditional spread drops the key. An empty `name` in JSON-LD is not
 * a smaller claim than a wrong one; it is a wrong one.
 */
function text(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined
  const clean = cleanStega(value).trim()
  return clean === "" ? undefined : clean
}

/**
 * A path or URL resolved against the request origin.
 *
 * Structured data is consumed away from the document that carried it, so a
 * relative URL in it is a URL resolved against whatever page the consumer
 * happens to be on. Everything is absolute or it is dropped.
 */
export function absoluteUrl(
  value: string | null | undefined,
  origin: string,
): string | undefined {
  const target = text(value)
  if (!target) return undefined
  try {
    const url = new URL(target, origin)
    return WEB_SCHEMES.has(url.protocol) ? url.toString() : undefined
  } catch {
    /*
     * An operator can type anything into a settings field, and a render that
     * throws takes the whole page down. A missing `image` costs a rich result;
     * a stack trace costs the page.
     */
    return undefined
  }
}

/**
 * A URL that must already be somewhere else.
 *
 * Used for `sameAs`, which claims the target is another profile of the same
 * organization. Resolving a relative path here would point that claim back at
 * this site, which says nothing and looks like a mistake, so a value that is
 * not already absolute is dropped instead.
 */
function externalUrl(value: string | null | undefined): string | undefined {
  const target = text(value)
  if (!target) return undefined
  try {
    const url = new URL(target)
    return WEB_SCHEMES.has(url.protocol) ? url.toString() : undefined
  } catch {
    return undefined
  }
}

/**
 * A date the publication carries, only if it is one.
 *
 * `Date.parse` rather than a format check because the contract does not pin a
 * format; an unparseable string is dropped rather than passed through, because
 * `departureTime: "TBC"` is worse than no departure time.
 */
function dateValue(value: string | null | undefined): string | undefined {
  const candidate = text(value)
  if (!candidate) return undefined
  return Number.isNaN(Date.parse(candidate)) ? undefined : candidate
}

/**
 * A node as the text of a `script` element.
 *
 * The HTML parser stops at the first `</script>` whatever the JSON quoting
 * says, so the angle bracket is escaped rather than trusted: an operator who
 * types a tag into a product description must not be able to close the block
 * early and spill the rest of their copy into the document as markup.
 */
export function ldScript(node: LdNode): string {
  return JSON.stringify(node).replaceAll("<", "\\u003c")
}

/** The site-wide organization node, referenced from every page that needs it. */
export function organizationId(origin: string): string {
  return `${origin}/#organization`
}

/** The site-wide `WebSite` node, referenced by each page's `isPartOf`. */
export function webSiteId(origin: string): string {
  return `${origin}/#website`
}

/**
 * The registered address, as one unparsed line.
 *
 * The operator authors this as a free-text block in whatever shape their
 * market writes an address in. Splitting it into `addressLocality`,
 * `addressRegion` and `postalCode` would be guesswork across every market this
 * theme serves, and a confidently wrong locality is worse for a local result
 * than no locality at all. `streetAddress` is the one field that can carry an
 * unparsed address without asserting something the operator did not write.
 */
function postalAddress(value: string | undefined): LdNode | undefined {
  const authored = text(value)
  if (!authored) return undefined
  const lines = authored
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  return { "@type": "PostalAddress", streetAddress: lines.join(", ") }
}

/**
 * The agency itself.
 *
 * `TravelAgency` rather than `Organization`: it is a `LocalBusiness` subtype,
 * and the extra specificity is free and true — this publication belongs to a
 * travel agency, which is exactly the distinction a local result turns on.
 *
 * No `priceRange`, no `aggregateRating`, no `openingHours`. The contract has
 * no field for any of them, so each would be a number a theme author made up
 * about somebody else's business.
 */
export function organizationLd(
  settings: SiteSettings,
  siteName: string,
  origin: string,
): LdNode | undefined {
  const name = text(settings.legal.name) ?? text(siteName)
  if (!name) return undefined

  const telephone = text(settings.phone)
  const email = text(settings.email)
  const address = postalAddress(settings.legal.address ?? settings.address)
  /*
   * The operator's own profile links, exactly as they configured them in the
   * footer. Not a guess from the site name — a `sameAs` pointing at somebody
   * else's account is a claim about a stranger.
   */
  const sameAs = settings.social
    .map((profile) => externalUrl(profile.href))
    .filter((href): href is string => href !== undefined)
  /*
   * The registration line as free text rather than split into `vatID` and
   * `taxID`. An operator writes it as one string — "J40/1234/2020, CUI
   * RO12345678" — and deciding which half is which would be a parse of a
   * format that differs per market; `identifier` accepts the line as authored.
   */
  const identifier = text(settings.legal.registration)

  return {
    "@context": SCHEMA,
    "@type": "TravelAgency",
    "@id": organizationId(origin),
    name,
    url: `${origin}/`,
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(address ? { address } : {}),
    ...(identifier ? { identifier } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

/**
 * The publication as a whole.
 *
 * No `potentialAction`/`SearchAction`. A sitelinks searchbox is a promise that
 * a query URL template exists and returns results; the theme's search hands
 * off to the managed engine rather than to a route this publication owns, so
 * declaring one would send crawlers to a URL that is not there.
 */
export function webSiteLd(
  siteName: string,
  origin: string,
  locale: string | undefined,
): LdNode | undefined {
  const name = text(siteName)
  if (!name) return undefined
  const inLanguage = text(locale)
  return {
    "@context": SCHEMA,
    "@type": "WebSite",
    "@id": webSiteId(origin),
    name,
    url: `${origin}/`,
    ...(inLanguage ? { inLanguage } : {}),
    publisher: { "@id": organizationId(origin) },
  }
}

/** The page itself, tied to the site so a consumer can walk from one to the other. */
export function webPageLd(
  page: {
    path: string
    title: string
    description?: string | undefined
    locale?: string | undefined
  },
  origin: string,
): LdNode | undefined {
  const url = absoluteUrl(page.path, origin)
  const name = text(page.title)
  if (!url || !name) return undefined
  const description = text(page.description)
  const inLanguage = text(page.locale)
  return {
    "@context": SCHEMA,
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    ...(description ? { description } : {}),
    ...(inLanguage ? { inLanguage } : {}),
    isPartOf: { "@id": webSiteId(origin) },
  }
}

/**
 * The trail, as a `BreadcrumbList`.
 *
 * Fewer than two resolvable crumbs is not a trail, so it returns nothing: a
 * one-item breadcrumb tells a crawler only that the page is itself.
 */
export function breadcrumbLd(
  trail: readonly Crumb[],
  origin: string,
): LdNode | undefined {
  const items = trail.flatMap((crumb) => {
    const name = text(crumb.name)
    const item = absoluteUrl(crumb.path, origin)
    return name && item ? [{ name, item }] : []
  })
  if (items.length < 2) return undefined

  return {
    "@context": SCHEMA,
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  }
}

/**
 * A list of things this page links to.
 *
 * The list is the page: an index that shows twelve journeys declares twelve,
 * in the order they render. Entries the operator has not made routable keep
 * their name and lose their `url`, because they are visibly on the page but
 * there is nowhere honest to point.
 */
export function itemListLd(
  entries: readonly { name: string; path?: string | null | undefined }[],
  origin: string,
): LdNode | undefined {
  const items = entries.flatMap((entry) => {
    const name = text(entry.name)
    if (!name) return []
    const url = absoluteUrl(entry.path, origin)
    return [{ name, ...(url ? { url } : {}) }]
  })
  if (items.length === 0) return undefined

  return {
    "@context": SCHEMA,
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...entry,
    })),
  }
}

/** A named place, with coordinates only when the publication carries them. */
function placeNode(place: {
  name: string
  latitude?: number | null | undefined
  longitude?: number | null | undefined
}): LdNode | undefined {
  const name = text(place.name)
  if (!name) return undefined
  const hasGeo =
    typeof place.latitude === "number" && typeof place.longitude === "number"
  return {
    "@type": "Place",
    name,
    ...(hasGeo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: place.latitude,
            longitude: place.longitude,
          },
        }
      : {}),
  }
}

/**
 * Places as a trip's itinerary.
 *
 * Nested inside a trip node, so no `@context` of its own — a nested node that
 * repeats the context is not wrong, but it is noise in every payload.
 */
function placeListNode(
  places: readonly {
    name: string
    latitude?: number | null | undefined
    longitude?: number | null | undefined
  }[],
): LdNode | undefined {
  const items = places
    .map(placeNode)
    .filter((node): node is LdNode => node !== undefined)
  if (items.length === 0) return undefined

  return {
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item,
    })),
  }
}

/** Every photograph on the page, cover first, as absolute URLs. */
function imageUrls(
  subject: {
    coverMedia?: ProductMedia | null | undefined
    media?: readonly ProductMedia[] | undefined
  },
  origin: string,
): string[] {
  const cover = coverOf(subject)
  const photos = cover ? [cover, ...galleryOf(subject)] : galleryOf(subject)
  return photos
    .map((photo) => absoluteUrl(photo.src, origin))
    .filter((src): src is string => src !== undefined)
}

/**
 * The shared shape of everything this theme sells a journey as.
 *
 * `TouristTrip` for a tour, a cruise and a sailing alike: they differ in what
 * the publication knows about them — a sailing has real dates, a cruise has
 * only ports — not in what they are.
 *
 * **There is no `offers` here, and there must never be one.** The contract
 * strips commercial values from a publication snapshot, so no price, currency,
 * availability or validity date exists to be truthful about; the page itself
 * shows none, and resolves everything commercial live. An `offers` block
 * assembled here would be a price a theme author invented on an operator's
 * behalf — which is precisely the fabrication that earns a structured-data
 * manual action, and it would contradict the visible page while doing it.
 *
 * For the same reason there is no `aggregateRating` and no `review`: the
 * contract has no review shape at all, so any star count would be a number
 * with no source.
 */
function tripNode(
  trip: {
    name: string
    path: string
    description?: string | null | undefined
    images: readonly string[]
    itinerary?: LdNode | undefined
    departureTime?: string | undefined
    arrivalTime?: string | undefined
  },
  origin: string,
): LdNode | undefined {
  const url = absoluteUrl(trip.path, origin)
  const name = text(trip.name)
  if (!url || !name) return undefined
  const description = text(trip.description)

  return {
    "@context": SCHEMA,
    "@type": "TouristTrip",
    "@id": `${url}#trip`,
    name,
    url,
    mainEntityOfPage: url,
    ...(description ? { description } : {}),
    ...(trip.images.length > 0 ? { image: [...trip.images] } : {}),
    ...(trip.departureTime ? { departureTime: trip.departureTime } : {}),
    ...(trip.arrivalTime ? { arrivalTime: trip.arrivalTime } : {}),
    ...(trip.itinerary ? { itinerary: trip.itinerary } : {}),
    provider: { "@id": organizationId(origin) },
  }
}

/**
 * A tour, a hotel stay or an experience — whatever `bookingMode` says it is.
 *
 * `shortDescription` rather than `descriptionHtml`, because `description` is a
 * text property and shipping markup through it produces a rich result with
 * tags read out in it.
 */
export function productLd(
  product: CatalogProduct,
  origin: string,
  path: string,
): LdNode | undefined {
  return tripNode(
    {
      name: product.name,
      path,
      description: product.shortDescription,
      images: imageUrls(product, origin),
      itinerary: placeListNode(product.destinations ?? []),
    },
    origin,
  )
}

/** A cruise: editorial above the sailings, so its itinerary is its ports. */
export function cruiseLd(
  cruise: Cruise,
  origin: string,
  path: string,
): LdNode | undefined {
  return tripNode(
    {
      name: cruise.name,
      path,
      description: cruise.shortDescription,
      images: imageUrls(cruise, origin),
      itinerary: placeListNode(cruise.ports ?? []),
    },
    origin,
  )
}

/**
 * A sailing: the one journey in this theme with real dates.
 *
 * Days at sea carry no port, so they contribute nothing to the itinerary
 * rather than an empty `Place` — a nameless stop is not a stop.
 */
export function sailingLd(
  sailing: CruiseSailing,
  origin: string,
  path: string,
): LdNode | undefined {
  const ports = sailing.itinerary.days.flatMap((day) => day.ports ?? [])
  const departureTime = dateValue(sailing.departure.startsOn)
  const arrivalTime = dateValue(sailing.departure.endsOn)

  return tripNode(
    {
      name: sailing.name,
      path,
      images: imageUrls(sailing, origin),
      itinerary: placeListNode(ports),
      ...(departureTime ? { departureTime } : {}),
      ...(arrivalTime ? { arrivalTime } : {}),
    },
    origin,
  )
}

/**
 * The trail a reader could actually walk from this page.
 *
 * Every crumb corresponds to a link the page renders: the site name is the
 * header wordmark, and each intermediate level is the "back to…" link the
 * template already shows above the title. Nothing is synthesized from the path
 * — `/pages` is not a route in this theme's manifest, so a `Pages` crumb would
 * be a breadcrumb entry that 404s.
 *
 * The index labels come from the theme's own dictionary rather than from the
 * index page's authored title, because a detail context does not carry its
 * parent's title and inventing one would be worse than naming the section.
 */
export function breadcrumbTrail(
  context: ThemePageContext,
  labels: { journeys: string; cruises: string },
): Crumb[] {
  const home: Crumb = { name: context.site.name, path: "/" }

  switch (context.kind) {
    case "home":
    case "notFound":
      return []
    case "tourDetail":
      return [
        home,
        { name: labels.journeys, path: "/tours" },
        { name: context.product.name, path: context.path },
      ]
    case "cruiseDetail":
      return [
        home,
        { name: labels.cruises, path: "/cruises" },
        { name: context.cruise.name, path: context.path },
      ]
    case "shipDetail":
      return [
        home,
        { name: labels.cruises, path: "/cruises" },
        { name: context.ship.name, path: context.path },
      ]
    case "sailingDetail":
      return [
        home,
        { name: labels.cruises, path: "/cruises" },
        { name: context.sailing.name, path: context.path },
      ]
    case "collectionEntry": {
      /*
       * The listing the entry was reached from — the same parent the template
       * renders its back link to. When it collapses to the site root there is
       * no intermediate level to name, only the home crumb already there.
       */
      const parent = context.path.slice(0, context.path.lastIndexOf("/"))
      const current: Crumb = { name: context.title, path: context.path }
      return parent === ""
        ? [home, current]
        : [home, { name: context.collection.name, path: parent }, current]
    }
    default:
      return [home, { name: context.title, path: context.path }]
  }
}

/**
 * The one thing this page is mainly about, when it is mainly about a thing.
 *
 * A content page, a 404 and a ship page return nothing: `WebPage` already
 * describes them, and schema.org has no type for a cruise ship that would not
 * be a stretch — `Product` would imply the vessel is for sale and drag offer
 * and review expectations along with it.
 */
export function pageEntityLd(
  context: ThemePageContext,
  origin: string,
): LdNode | undefined {
  switch (context.kind) {
    case "tourDetail":
      return productLd(context.product, origin, context.path)
    case "cruiseDetail":
      return cruiseLd(context.cruise, origin, context.path)
    case "sailingDetail":
      return sailingLd(context.sailing, origin, context.path)
    case "tourIndex":
      return itemListLd(
        context.products.map((product) => ({
          name: product.name,
          path: `/tours/${product.slug}`,
        })),
        origin,
      )
    case "cruiseIndex":
      return itemListLd(
        context.cruises.map((cruise) => ({
          name: cruise.name,
          path: `/cruises/${cruise.slug}`,
        })),
        origin,
      )
    case "collectionIndex":
      return itemListLd(
        context.entries.map((entry) => ({
          name: entry.title,
          path: entry.path,
        })),
        origin,
      )
    default:
      return undefined
  }
}

/** One `hreflang` alternate: the language, and where that language lives. */
export interface Alternate {
  hreflang: string
  href: string
  current: boolean
}

/**
 * The operator's own language versions, resolved absolute.
 *
 * Exactly the set behind the visible language switcher, and nothing derived
 * from it. The tempting derivation — prefix the current path with each
 * language code — invents routes: this theme's manifest has no locale segment,
 * so every alternate it produced would 404, and a 404 in an `hreflang` cluster
 * costs the whole cluster.
 *
 * One language is not a cluster, so a single entry emits nothing: `hreflang`
 * on a monolingual site is markup that can only ever be wrong later.
 */
export function alternateLinks(
  languages: SiteSettings["languages"],
  origin: string,
): Alternate[] {
  const found = languages.flatMap((language) => {
    const href = absoluteUrl(language.href, origin)
    const hreflang = text(language.code)?.toLowerCase()
    return href && hreflang ? [{ hreflang, href, current: language.current }] : []
  })
  return found.length > 1 ? found : []
}

/**
 * Where a reader whose language the operator does not publish should land.
 *
 * The entry the operator marked current is their default — the one the bare
 * hostname serves — so `x-default` follows that mark rather than guessing at
 * English. Falling back to the first entry keeps the cluster complete when
 * nobody marked one.
 */
export function defaultAlternate(
  alternates: readonly Alternate[],
): Alternate | undefined {
  return alternates.find((entry) => entry.current) ?? alternates[0]
}
