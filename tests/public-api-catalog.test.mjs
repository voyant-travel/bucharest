import assert from "node:assert/strict"
import test from "node:test"
import {
  isPublicApiCompatibilityUnavailable,
  loadPublicTourAvailability,
  PublicCatalogRequestError,
  searchPublicTours,
} from "../src/lib/public-api-catalog.ts"
import { PublicApiClientCredentialError } from "@voyant-travel/public-api-client"

function response(status = 200) {
  return new Response(null, { status })
}

test("maps the generated product response without guessing envelope or field names", async () => {
  const calls = []
  const client = {
    async GET(path, options) {
      calls.push({ path, options })
      return {
        data: {
          data: [
            {
              id: "product_1",
              slug: "danube",
              name: "The Danube",
              shortDescription: "Seven quiet days",
            },
            {
              id: "product_2",
              slug: null,
              name: "Untitled route",
              shortDescription: null,
            },
          ],
          total: 2,
          limit: 24,
          offset: 0,
        },
        response: response(),
      }
    },
  }

  assert.deepEqual(
    await searchPublicTours(client, {
      query: "  river  ",
      languageTag: "ro",
    }),
    [
      {
        id: "product_1",
        slug: "danube",
        name: "The Danube",
        summary: "Seven quiet days",
      },
      { id: "product_2", name: "Untitled route" },
    ],
  )
  assert.deepEqual(calls, [
    {
      path: "/v1/public/products",
      options: {
        params: {
          query: { search: "river", languageTag: "ro", limit: 24 },
        },
      },
    },
  ])
})

test("maps canonical availability departures", async () => {
  const client = {
    async GET(path, options) {
      assert.equal(path, "/v1/public/products/{productId}/availability")
      assert.deepEqual(options.params, {
        path: { productId: "product_1" },
        query: { locale: "en", limit: 50 },
      })
      return {
        data: {
          data: {
            productId: "product_1",
            availabilityState: "available",
            counts: {},
            departures: [
              {
                id: "departure_1",
                startAt: "2027-04-02T08:00:00Z",
                dateLocal: "2027-04-02",
                remaining: 8,
              },
              {
                id: "departure_2",
                startAt: null,
                dateLocal: "2027-05-03",
                remaining: null,
              },
            ],
            total: 2,
            limit: 50,
            offset: 0,
          },
        },
        response: response(),
      }
    },
  }

  assert.deepEqual(
    await loadPublicTourAvailability(client, {
      productId: "product_1",
      locale: "en",
    }),
    [
      {
        id: "departure_1",
        startsAt: "2027-04-02T08:00:00Z",
        remaining: 8,
      },
      { id: "departure_2", startsAt: "2027-05-03" },
    ],
  )
})

test("surfaces typed-client failures without probing alternate envelopes", async () => {
  const client = {
    async GET() {
      return {
        error: { error: "public_api_unavailable" },
        response: response(503),
      }
    },
  }

  await assert.rejects(
    searchPublicTours(client, { query: "river" }),
    (error) =>
      error instanceof PublicCatalogRequestError && error.status === 503,
  )
})

test("allows fallback only when the managed client or canonical route is unavailable", () => {
  assert.equal(
    isPublicApiCompatibilityUnavailable(
      new PublicApiClientCredentialError("managed mode is unavailable"),
    ),
    true,
  )
  assert.equal(
    isPublicApiCompatibilityUnavailable(new PublicCatalogRequestError(404)),
    true,
  )
  assert.equal(
    isPublicApiCompatibilityUnavailable(new PublicCatalogRequestError(501)),
    true,
  )
})

test("does not mask network, server, or schema failures with a legacy request", () => {
  assert.equal(
    isPublicApiCompatibilityUnavailable(new TypeError("fetch failed")),
    false,
  )
  assert.equal(
    isPublicApiCompatibilityUnavailable(new PublicCatalogRequestError(500)),
    false,
  )
  assert.equal(
    isPublicApiCompatibilityUnavailable(new Error("invalid response shape")),
    false,
  )
})
