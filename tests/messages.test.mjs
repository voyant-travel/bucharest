import assert from "node:assert/strict"
import test from "node:test"
import {
  TRANSLATED_LANGUAGES,
  counted,
  fill,
  messagesFor,
} from "../src/lib/messages.ts"

const english = messagesFor("en")

test("every language carries every string the theme supplies", () => {
  const flat = Object.keys(english).filter(
    (key) => key !== "plurals" && key !== "booking",
  )
  for (const language of TRANSLATED_LANGUAGES) {
    const messages = messagesFor(language)
    for (const key of flat) {
      assert.equal(
        typeof messages[key],
        "string",
        `${language} is missing ${key}`,
      )
    }
    for (const key of Object.keys(english.booking)) {
      assert.equal(
        typeof messages.booking[key],
        "string",
        `${language} is missing booking.${key}`,
      )
    }
    // `other` is the one plural category CLDR guarantees for every language,
    // so it is the one form a dictionary may never omit.
    for (const phrase of Object.keys(english.plurals)) {
      assert.equal(
        typeof messages.plurals[phrase]?.other,
        "string",
        `${language} is missing plurals.${phrase}.other`,
      )
    }
  }
})

test("counted phrases follow each language's own plural rules", () => {
  const ro = messagesFor("ro")
  // Romanian needs three: one, few, and the `de` form from twenty upwards.
  assert.equal(counted("ro-RO", ro, "days", 1), "1 zi")
  assert.equal(counted("ro-RO", ro, "days", 2), "2 zile")
  assert.equal(counted("ro-RO", ro, "days", 20), "20 de zile")

  assert.equal(counted("en", english, "days", 1), "1 day")
  assert.equal(counted("en", english, "days", 3), "3 days")

  const de = messagesFor("de")
  assert.equal(counted("de-AT", de, "nights", 1), "1 Nacht")
  assert.equal(counted("de-AT", de, "nights", 7), "7 Nächte")
})

test("an untranslated language falls back to English rather than to a key", () => {
  assert.equal(messagesFor("zz").overview, english.overview)
  assert.equal(messagesFor(undefined).overview, english.overview)
  // Region subtags never select a different dictionary.
  assert.equal(messagesFor("ro-MD").overview, messagesFor("ro").overview)
})

test("placeholders are substituted and unknown ones left intact", () => {
  assert.equal(fill("Back to {name}", { name: "Cruises" }), "Back to Cruises")
  assert.equal(fill("Day {count}", { count: 3 }), "Day 3")
  assert.equal(fill("{a} and {b}", { a: "one" }), "one and {b}")
})
