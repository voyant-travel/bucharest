/**
 * Reading a catalog product.
 *
 * A published tour carries editorial identity only — description, itinerary,
 * media, features, destinations. Price and availability are deliberately
 * absent: the contract strips commercial values from a publication snapshot
 * and serves them live behind capabilities instead. So nothing here invents a
 * "from" price or a departure date, and a template that wants one asks the
 * capability layer rather than the product.
 *
 * Every list arrives with an optional `sortOrder`. The operator arranged them
 * for a reason, so each accessor sorts by it and falls back to the published
 * order rather than re-sorting alphabetically.
 */

type Ordered = { sortOrder?: number | undefined }

/** Stable ordering: authored `sortOrder` first, published order as the tiebreak. */
function byOrder<T extends Ordered>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const left = a.item.sortOrder ?? Number.MAX_SAFE_INTEGER
      const right = b.item.sortOrder ?? Number.MAX_SAFE_INTEGER
      return left === right ? a.index - b.index : left - right
    })
    .map(({ item }) => item)
}

export type ProductMedia = {
  id: string
  mediaType: string
  url: string
  altText?: string | null | undefined
  width?: number | null | undefined
  height?: number | null | undefined
  sortOrder?: number | undefined
}

export type Photo = { src: string; alt: string; width?: number; height?: number }

/**
 * Only a source a browser will fetch from this document.
 *
 * Media URLs come from the operator's own CDN, which this theme knows nothing
 * about, so the check is on the scheme rather than the host.
 */
function isSafeSrc(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("/")
}

function toPhoto(media: ProductMedia): Photo | undefined {
  if (!isSafeSrc(media.url)) return undefined
  return {
    src: media.url,
    alt: media.altText ?? "",
    ...(typeof media.width === "number" ? { width: media.width } : {}),
    ...(typeof media.height === "number" ? { height: media.height } : {}),
  }
}

/** Images only. A product's media list may also carry video and documents. */
export function imagesOf(media: readonly ProductMedia[] = []): Photo[] {
  return byOrder(media)
    .filter((item) => item.mediaType.toLowerCase().includes("image"))
    .map(toPhoto)
    .filter((photo): photo is Photo => photo !== undefined)
}

/**
 * The lead photograph.
 *
 * `coverMedia` when the operator chose one, otherwise the first image in the
 * gallery — a product page led by a grey box when perfectly good photography
 * sits below it is worse than borrowing the first frame.
 */
export function coverOf(product: {
  coverMedia?: ProductMedia | null | undefined
  media?: readonly ProductMedia[] | undefined
}): Photo | undefined {
  const cover = product.coverMedia ? toPhoto(product.coverMedia) : undefined
  return cover ?? imagesOf(product.media)[0]
}

/** Gallery images with the lead one removed, so it is not shown twice. */
export function galleryOf(product: {
  coverMedia?: ProductMedia | null | undefined
  media?: readonly ProductMedia[] | undefined
}): Photo[] {
  const cover = coverOf(product)
  return imagesOf(product.media).filter((photo) => photo.src !== cover?.src)
}

export type Named = { id: string; name: string; slug?: string; sortOrder?: number | undefined }

export function namesOf(items: readonly Named[] = []): string[] {
  return byOrder(items).map((item) => item.name)
}

export type Feature = {
  id: string
  featureType: string
  title: string
  description?: string | null | undefined
  sortOrder?: number | undefined
}

export function featuresOf(features: readonly Feature[] = []): Feature[] {
  return byOrder(features)
}

export type Faq = {
  id: string
  question: string
  answer: string
  sortOrder?: number | undefined
}

export function faqsOf(faqs: readonly Faq[] = []): Faq[] {
  return byOrder(faqs)
}

export type ItineraryDay = {
  id: string
  dayNumber: number
  title?: string | null | undefined
  description?: string | null | undefined
  location?: string | null | undefined
  thumbnailUrl?: string | null | undefined
}

/** Days in the order they are travelled, whatever order they were published in. */
export function daysOf(
  itinerary: { days?: readonly ItineraryDay[] | undefined } | null | undefined,
): ItineraryDay[] {
  if (!itinerary?.days) return []
  return [...itinerary.days].sort((a, b) => a.dayNumber - b.dayNumber)
}

/** A machine value like `small_group` rendered as the words an operator wrote. */
export function humanize(value: string): string {
  const spaced = value.replaceAll("_", " ").replaceAll("-", " ").trim()
  return spaced === "" ? value : spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/**
 * The anchored sections a product page offers, and only the ones it can fill.
 *
 * The in-page nav is built from this rather than hard-coded, so a product with
 * no itinerary does not advertise an "Itinerary" link that scrolls nowhere.
 */
export function productSections(product: {
  descriptionHtml?: string | undefined
  itinerary?: { days?: readonly ItineraryDay[] | undefined } | null | undefined
  destinations?: readonly Named[] | undefined
  features?: readonly Feature[] | undefined
  faqs?: readonly Faq[] | undefined
  coverMedia?: ProductMedia | null | undefined
  media?: readonly ProductMedia[] | undefined
}): Array<{ id: string; label: string }> {
  const sections: Array<{ id: string; label: string }> = []
  if (product.descriptionHtml) sections.push({ id: "overview", label: "Overview" })
  if (daysOf(product.itinerary).length > 0) {
    sections.push({ id: "itinerary", label: "Itinerary" })
  }
  if ((product.features ?? []).length > 0) {
    sections.push({ id: "included", label: "What's included" })
  }
  if ((product.destinations ?? []).length > 0) {
    sections.push({ id: "destinations", label: "Where you go" })
  }
  if (galleryOf(product).length > 0) sections.push({ id: "gallery", label: "Gallery" })
  if ((product.faqs ?? []).length > 0) sections.push({ id: "questions", label: "Questions" })
  return sections
}
