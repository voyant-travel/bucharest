import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const clientScriptFiles = [
  "src/components/TourIndex.astro",
  "src/components/TourDetail.astro",
]

test("tour browser scripts do not contain TypeScript-only variable annotations", async () => {
  for (const file of clientScriptFiles) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), "utf8")
    const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1]

    assert.ok(script, `${file} must contain a processed browser script`)
    assert.doesNotMatch(
      script,
      /\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*:/,
      `${file} must stay parseable by the JavaScript client-script pipeline`,
    )
  }
})
