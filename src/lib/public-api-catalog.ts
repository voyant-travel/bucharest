import {
  type createPublicApiClient,
  PublicApiClientCredentialError,
} from "@voyant-travel/public-api-client"

type ClientResult<Body> = {
  data?: Body
  error?: unknown
  response: Response
}

/**
 * The generated client is injected by the caller. Bucharest therefore knows
 * neither development-session capabilities nor deployment credentials.
 */
export type PublicCatalogClient = ReturnType<typeof createPublicApiClient>

export class PublicCatalogRequestError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Voyant Public API request failed with status ${status}.`)
    this.name = "PublicCatalogRequestError"
    this.status = status
  }
}

/**
 * Whether this installation predates the managed client or canonical route.
 * All operational failures must remain visible instead of triggering a second
 * request through the legacy capability.
 */
export function isPublicApiCompatibilityUnavailable(error: unknown): boolean {
  return (
    error instanceof PublicApiClientCredentialError ||
    (error instanceof PublicCatalogRequestError &&
      (error.status === 404 || error.status === 501))
  )
}

function responseData<Body>(result: ClientResult<Body>): Body {
  if (result.error !== undefined || result.data === undefined) {
    throw new PublicCatalogRequestError(result.response.status)
  }
  return result.data
}

export type TourSearchCard = {
  id: string
  slug?: string
  name: string
  summary?: string
}

/** Thin presentation mapping over the generated `getPublicProducts` shape. */
export async function searchPublicTours(
  client: PublicCatalogClient,
  input: { query?: string; languageTag?: string; limit?: number },
): Promise<TourSearchCard[]> {
  const query = input.query?.trim()
  const result = await client.GET("/v1/public/products", {
    params: {
      query: {
        ...(query ? { search: query } : {}),
        ...(input.languageTag ? { languageTag: input.languageTag } : {}),
        limit: input.limit ?? 24,
      },
    },
  })

  return responseData(result).data.map((product) => ({
    id: product.id,
    ...(product.slug ? { slug: product.slug } : {}),
    name: product.name,
    ...(product.shortDescription
      ? { summary: product.shortDescription }
      : {}),
  }))
}

export type TourDeparture = {
  id: string
  startsAt?: string
  remaining?: number
}

/** Thin presentation mapping over the generated availability response. */
export async function loadPublicTourAvailability(
  client: PublicCatalogClient,
  input: { productId: string; locale?: string; limit?: number },
): Promise<TourDeparture[]> {
  const result = await client.GET(
    "/v1/public/products/{productId}/availability",
    {
      params: {
        path: { productId: input.productId },
        query: {
          ...(input.locale ? { locale: input.locale } : {}),
          limit: input.limit ?? 50,
        },
      },
    },
  )

  return responseData(result).data.departures.map((departure) => ({
    id: departure.id,
    ...(departure.startAt || departure.dateLocal
      ? { startsAt: departure.startAt ?? departure.dateLocal ?? undefined }
      : {}),
    ...(departure.remaining === null
      ? {}
      : { remaining: departure.remaining }),
  }))
}
