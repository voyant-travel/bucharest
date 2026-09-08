import assert from "node:assert/strict"
import test from "node:test"
import {
  unavailableCruiseCommerce,
  unavailableProductCommerce,
} from "../src/lib/product/adapter.ts"

test("published product commerce starts empty instead of inventing fares or availability", () => {
  assert.deepEqual(unavailableProductCommerce(), {
    currency: "EUR",
    departures: [],
    roomTypes: [],
    options: [],
    availableDates: [],
  })
})

test("published sailing commerce starts empty instead of pricing cabin identities", () => {
  assert.deepEqual(unavailableCruiseCommerce(), {
    currency: "EUR",
    grades: [],
  })
})
