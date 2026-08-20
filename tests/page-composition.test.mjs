import assert from "node:assert/strict"
import test from "node:test"

import { composedPageSections } from "../src/lib/sections.ts"

const hero = {
  type: "hero",
  data: {
    id: "hero-1",
    settings: { heading: "Summer, planned around you" },
    blocks: [],
  },
}

test("home and agency-authored content pages share the section renderer", () => {
  assert.deepEqual(composedPageSections({ kind: "home", sections: [hero] }), [
    hero,
  ])
  assert.deepEqual(
    composedPageSections({ kind: "content", sections: [hero] }),
    [hero],
  )
})

test("fixed system and catalog contexts do not become page-builder canvases", () => {
  assert.deepEqual(
    composedPageSections({ kind: "notFound", sections: [hero] }),
    [],
  )
  assert.deepEqual(
    composedPageSections({ kind: "tourDetail", sections: [hero] }),
    [],
  )
})
