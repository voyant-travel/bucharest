import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import {
  capabilityEndpoint,
  createShoppingClient,
  formatPresentationMoney,
  messagesFor,
  ShoppingHttpError,
} from "../src/lib/shopping.mjs"

const AVAILABLE = {
  marketIds: ["ro-public"],
  locales: ["ro-RO", "en-GB"],
  currencies: ["RON", "GBP"],
}

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function scope(currency = "GBP") {
  return { marketId: "ro-public", locale: "en-GB", currency, available: AVAILABLE }
}

test("uses only an available same-origin managed capability", () => {
  const live = {
    capabilities: [
      { id: "shopping.search.v1", available: false, methods: ["POST"], endpoint: "/wrong" },
      { id: "shopping.search.v1", available: true, methods: ["POST"], endpoint: "/v1/public/theme/shopping/search" },
    ],
  }
  assert.equal(
    capabilityEndpoint(live, "shopping.search.v1", "POST"),
    "/v1/public/theme/shopping/search",
  )
  assert.equal(capabilityEndpoint(live, "shopping.search.v1", "GET"), undefined)
})

test("accepts server-clamped scope and never calculates presentation FX", async () => {
  const calls = []
  const client = createShoppingClient({
    searchEndpoint: "/v1/public/theme/shopping/search",
    tripsEndpoint: "/v1/public/theme/shopping/trip-selections",
    locale: "ro-RO",
    origin: "https://shop.example",
    fetchImpl: async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) })
      return response({
        data: {
          kind: "stay",
          scope: scope(),
          offers: [{
            offerRef: "opaque-stay-offer-1234",
            accommodationRef: "opaque-accommodation-1234",
            title: "A quiet room",
            checkIn: "2026-09-01",
            checkOut: "2026-09-03",
            price: {
              native: { amount: "80.00", currency: "EUR" },
              presentation: { amount: "71.25", currency: "GBP" },
              fx: { rate: "0.890625", provider: "voyant-data", quotedAt: "2026-08-09T10:00:00Z" },
            },
          }],
          coverage: { status: "complete", succeeded: 1, failed: 0, timedOut: 0 },
        },
      })
    },
  })

  const result = await client.search({
    kind: "stay",
    destination: { query: "London" },
    checkIn: "2026-09-01",
    checkOut: "2026-09-03",
    rooms: [{ adults: 2 }],
  })

  assert.deepEqual(calls[0].body.scope, { locale: "ro-RO" })
  assert.deepEqual(client.scope(), scope())
  assert.equal(result.offers[0].price.presentation.amount, "71.25")
  assert.match(formatPresentationMoney(result.offers[0].price, "en-GB"), /71\.25/)
  assert.doesNotMatch(formatPresentationMoney(result.offers[0].price, "en-GB"), /80/)
  assert.equal("providerId" in calls[0].body, false)
  assert.equal("connectionId" in calls[0].body, false)
  assert.equal("customerId" in calls[0].body, false)
})

test("rejects money that is not in the server-resolved presentation currency", async () => {
  const client = createShoppingClient({
    searchEndpoint: "/search",
    locale: "en-GB",
    origin: "https://shop.example",
    fetchImpl: async () => response({ data: {
      kind: "flight",
      scope: scope("GBP"),
      offers: [{
        offerRef: "opaque-flight-offer-1234",
        itineraries: [{ segments: [{
          origin: { code: "OTP", at: "2026-09-01T08:00:00+03:00" },
          destination: { code: "LHR", at: "2026-09-01T09:30:00+01:00" },
          marketingCarrier: "RO",
          flightNumber: "391",
        }] }],
        price: {
          native: { amount: "100", currency: "EUR" },
          presentation: { amount: "100", currency: "EUR" },
        },
      }],
      coverage: { status: "complete", succeeded: 1, failed: 0, timedOut: 0 },
    } }),
  })
  await assert.rejects(client.search({ kind: "flight" }), /outside the resolved currency/)
})

test("creates and mutates one opaque Trip with compare-and-swap revisions", async () => {
  const calls = []
  const trip = (revision, itemRefs) => ({ data: {
    selectionRef: "opaque-selection-ref-1234",
    revision,
    scope: scope(),
    items: itemRefs.map((itemRef, index) => ({
      itemRef,
      kind: index === 0 ? "flight" : "stay",
      quantity: 1,
    })),
  } })
  const replies = [
    trip(0, ["opaque-item-flight-1234"]),
    trip(1, ["opaque-item-flight-1234", "opaque-item-stay-12345"]),
    trip(2, ["opaque-item-stay-12345", "opaque-item-flight-1234"]),
    trip(3, ["opaque-item-stay-12345"]),
  ]
  const client = createShoppingClient({
    searchEndpoint: "/search",
    tripsEndpoint: "/trips",
    locale: "en-GB",
    origin: "https://shop.example",
    fetchImpl: async (url, init) => {
      calls.push({ url, method: init.method, body: JSON.parse(init.body) })
      return response(replies.shift(), init.method === "POST" ? 201 : 200)
    },
  })

  await client.add("flight", "opaque-flight-offer-1234")
  await client.add("stay", "opaque-stay-offer-12345")
  await client.reorder(["opaque-item-stay-12345", "opaque-item-flight-1234"])
  await client.remove("opaque-item-flight-1234")

  assert.deepEqual(calls.map(({ method }) => method), ["POST", "PATCH", "PATCH", "PATCH"])
  assert.deepEqual(calls[0].body, {
    scope: { locale: "en-GB" },
    offers: [{ kind: "flight", offerRef: "opaque-flight-offer-1234" }],
  })
  assert.deepEqual(calls.slice(1).map(({ body }) => body.expectedRevision), [0, 1, 2])
  assert.equal(client.trip().revision, 3)
  assert.equal(calls.some(({ body }) => "providerId" in body || "bookingId" in body), false)
})

test("fails closed on a CAS conflict instead of replaying a stale mutation", async () => {
  let calls = 0
  const client = createShoppingClient({
    searchEndpoint: "/search",
    tripsEndpoint: "/trips",
    locale: "en",
    origin: "https://shop.example",
    fetchImpl: async (_url, init) => {
      calls += 1
      if (calls === 1) return response({ data: {
        selectionRef: "opaque-selection-ref-1234",
        revision: 0,
        scope: scope(),
        items: [{ itemRef: "opaque-item-flight-1234", kind: "flight", quantity: 1 }],
      } }, 201)
      assert.equal(init.method, "PATCH")
      return response({ error: "trip_selection_revision_conflict" }, 409)
    },
  })
  await client.add("flight", "opaque-flight-offer-1234")
  await assert.rejects(client.remove("opaque-item-flight-1234"), (error) => {
    assert.ok(error instanceof ShoppingHttpError)
    assert.equal(error.status, 409)
    return true
  })
  assert.equal(client.trip(), undefined)
  assert.equal(calls, 2)
})

test("refuses a provider-origin endpoint and keeps authority on the storefront", async () => {
  let called = false
  const client = createShoppingClient({
    searchEndpoint: "https://provider.example/search",
    locale: "en",
    origin: "https://shop.example",
    fetchImpl: async () => {
      called = true
      return response({})
    },
  })
  await assert.rejects(client.search({ kind: "indexed-inspiration", groups: [] }), /storefront origin/)
  assert.equal(called, false)
})

test("localizes common operator languages and falls back without changing result locale", () => {
  assert.equal(messagesFor("ro-RO").search, "Caută")
  assert.equal(messagesFor("fr-FR").tripHeading, "Votre voyage")
  assert.equal(messagesFor("ja-JP").search, "Search")
})

test("gives the global locale and currency controls stable form identities", async () => {
  const source = await readFile(
    new URL("../src/components/ShoppingExperience.astro", import.meta.url),
    "utf8",
  )
  assert.match(source, /id="shopping-locale" name="shoppingLocale"/)
  assert.match(source, /id="shopping-currency" name="shoppingCurrency"/)
})

test("browser code has no account, payment, provider selector, FX math, or opaque-ref persistence", async () => {
  const source = await readFile(new URL("../src/lib/shopping.mjs", import.meta.url), "utf8")
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie|indexedDB/)
  assert.doesNotMatch(source, /providerId|connectionId|paymentMethod|customerAccount|login/)
  assert.doesNotMatch(source, /fx\.rate|native\.amount/)
})
