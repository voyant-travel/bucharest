import assert from "node:assert/strict"
import test from "node:test"
import { themeRouteSchema } from "@voyant-travel/theme"
import {
  ARTICLE_TEMPLATE_ID,
  COLLECTION_ENTRY_TEMPLATE_ID,
  COLLECTION_INDEX_TEMPLATE_ID,
  collectionRoutes,
  resolveCollectionRenderer,
} from "../src/lib/collection-routes.ts"

test("the manifest declares one default route template per Collection context", () => {
  assert.deepEqual(collectionRoutes.map((route) => themeRouteSchema.parse(route)), [
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
  ])
  assert.equal(
    collectionRoutes.filter((route) => route.context === "collectionIndex").length,
    1,
  )
  assert.equal(
    collectionRoutes.filter((route) => route.context === "collectionEntry").length,
    1,
  )
})

test("the catch-all selects only declared Collection templates", () => {
  assert.equal(
    resolveCollectionRenderer({
      kind: "collectionIndex",
      templateId: COLLECTION_INDEX_TEMPLATE_ID,
    }),
    "index",
  )
  assert.equal(
    resolveCollectionRenderer({
      kind: "collectionEntry",
      templateId: COLLECTION_ENTRY_TEMPLATE_ID,
    }),
    "entry",
  )
  assert.equal(
    resolveCollectionRenderer({
      kind: "collectionEntry",
      templateId: ARTICLE_TEMPLATE_ID,
    }),
    "article",
  )
  assert.equal(
    resolveCollectionRenderer({
      kind: "collectionEntry",
      templateId: COLLECTION_INDEX_TEMPLATE_ID,
    }),
    null,
  )
})
