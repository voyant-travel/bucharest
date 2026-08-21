import type {
  CollectionEntryContext,
  CollectionIndexContext,
  ThemeRoute,
} from "@voyant-travel/theme"

export const COLLECTION_INDEX_TEMPLATE_ID = "collection-index"
export const COLLECTION_ENTRY_TEMPLATE_ID = "collection-entry"
export const ARTICLE_TEMPLATE_ID = "article"

/**
 * Route ids are the default template ids in the Theme contract. The patterns
 * describe renderer shapes only; the Site-owned Content route supplies the
 * actual localized path at publication time.
 */
export const collectionRoutes = [
  {
    id: COLLECTION_INDEX_TEMPLATE_ID,
    pattern: "/[collection]",
    context: "collectionIndex",
  },
  {
    id: COLLECTION_ENTRY_TEMPLATE_ID,
    pattern: "/[collection]/[slug]",
    context: "collectionEntry",
  },
] satisfies ThemeRoute[]

type CollectionRenderContext =
  | Pick<CollectionIndexContext, "kind" | "templateId">
  | Pick<CollectionEntryContext, "kind" | "templateId">

/** Fail closed if the platform sends a Collection template we did not declare. */
export function resolveCollectionRenderer(
  context: CollectionRenderContext,
): "index" | "entry" | "article" | null {
  if (
    context.kind === "collectionIndex" &&
    context.templateId === COLLECTION_INDEX_TEMPLATE_ID
  ) {
    return "index"
  }
  if (
    context.kind === "collectionEntry" &&
    context.templateId === COLLECTION_ENTRY_TEMPLATE_ID
  ) {
    return "entry"
  }
  if (
    context.kind === "collectionEntry" &&
    context.templateId === ARTICLE_TEMPLATE_ID
  ) {
    return "article"
  }
  return null
}
