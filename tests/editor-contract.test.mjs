import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { injectThemeEditorBridge } from "@voyant-travel/astro"
import {
  decodeStega,
  encodeThemeContextProvenance,
  getThemeEditorContext,
} from "@voyant-travel/theme"

function context(editor) {
  return {
    kind: "home",
    path: "/",
    locale: "en",
    site: { name: "Bucharest" },
    navigation: [],
    settings: {},
    title: "Bucharest",
    seo: { title: "Bucharest" },
    sections: [
      {
        type: "hero",
        data: {
          id: "hero-one",
          settings: { heading: "Travel further" },
          blocks: [],
        },
      },
    ],
    ...(editor ? { _voyant: editor } : {}),
  }
}

function renderHeading(pageContext) {
  const heading = pageContext.sections[0].data.settings.heading
  return `<!doctype html><html><body><main><section><h1>${heading}</h1></section></main></body></html>`
}

test("a published context has neither editor bridge nor editor attributes", () => {
  const published = encodeThemeContextProvenance(context())
  const html = injectThemeEditorBridge(
    renderHeading(published),
    getThemeEditorContext(published),
  )

  assert.equal(html.includes("voyant-editor-bridge"), false)
  assert.equal(html.includes("data-voyant-"), false)
  assert.match(html, /<h1>Travel further<\/h1>/)
})

test("a draft context keeps selectable stega text and receives the bridge", () => {
  const draft = encodeThemeContextProvenance(
    context({
      mode: "draft",
      editorOrigin: "https://app.voyant.travel",
    }),
  )
  const heading = draft.sections[0].data.settings.heading

  assert.deepEqual(decodeStega(heading), {
    value: "Travel further",
    pointer: "/sections/0/data/settings/heading",
  })

  const html = injectThemeEditorBridge(
    renderHeading(draft),
    getThemeEditorContext(draft),
  )
  assert.match(html, /<h1>Travel further[^<]+<\/h1>/)
  assert.match(html, /id="voyant-editor-bridge"/)
  assert.match(html, /voyant:edit:select/)
  assert.equal(html.includes("data-voyant-"), false)
})

/*
 * The locale invariant.
 *
 * A theme that presumes English is a theme that will ship an English string
 * into a Romanian page, and the version of this assertion that used to live in
 * `tests/shopping.test.mjs` went with that file. What it was really guarding is
 * narrower and more durable than "the theme is not English": it is that the
 * fixtures and the operator's own `languages` setting cannot drift apart. A
 * fixture carrying `locale: "hu"` when no Hungarian is offered — or a switcher
 * offering Hungarian when no Hungarian page exists — is the same bug seen from
 * either end, and it is the bug that puts two languages on one page.
 *
 * Read as text rather than imported: `theme.config.ts` pulls in the theme SDK
 * and extensionless TypeScript modules, none of which a bare `node --test` can
 * resolve, and the invariant is about what the file says either way.
 *
 * Nothing here counts anything. The predecessor asserted exact totals and
 * broke every time a page was added, which taught people to edit the test
 * rather than read it.
 */
const themeConfig = readFileSync(
  new URL("../theme.config.ts", import.meta.url),
  "utf8",
)

/** Every `languages` textarea in the file, one entry per line within each. */
function languageDeclarations(source) {
  return [...source.matchAll(/languages:\s*"((?:[^"\\]|\\.)*)"/g)].map((match) =>
    match[1]
      .replace(/\\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const isDefault = line.startsWith("*")
        const [left] = (isDefault ? line.slice(1) : line).split(/\s*[=:]\s*/, 1)
        /* `ro|Română`, or just `Română` and the code comes from the label. */
        const [maybeCode, maybeLabel] = left.trim().split("|")
        const code = (maybeLabel ? maybeCode : left.trim().slice(0, 2))
          .trim()
          .toLowerCase()
        return { code, isDefault }
      }),
  )
}

test("every fixture locale is a language the site actually offers", () => {
  const declarations = languageDeclarations(themeConfig)
  assert.ok(
    declarations.length > 0,
    "no `languages` setting found — the regex, not the config, is probably wrong",
  )

  const offered = new Set(
    declarations.flatMap((entries) => entries.map((entry) => entry.code)),
  )
  const locales = [...themeConfig.matchAll(/\blocale:\s*"([^"]+)"/g)].map(
    (match) => match[1].toLowerCase(),
  )
  assert.ok(locales.length > 0, "no fixture locales found")

  for (const locale of new Set(locales)) {
    assert.ok(
      offered.has(locale),
      `fixture locale "${locale}" is not offered by the languages setting (${[...offered].join(", ")})`,
    )
  }
})

test("each languages setting marks a default, and that default has pages", () => {
  const declarations = languageDeclarations(themeConfig)
  const locales = new Set(
    [...themeConfig.matchAll(/\blocale:\s*"([^"]+)"/g)].map((match) =>
      match[1].toLowerCase(),
    ),
  )

  for (const entries of declarations) {
    const defaults = entries.filter((entry) => entry.isDefault)
    assert.equal(
      defaults.length,
      1,
      "a languages setting must mark exactly one entry with a leading *",
    )
    assert.ok(
      locales.has(defaults[0].code),
      `"${defaults[0].code}" is starred as the default but no fixture is published in it`,
    )
  }
})
