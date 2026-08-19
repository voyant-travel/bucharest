import type {
  paths,
  PublishablePath,
} from "@voyant-travel/public-api-client"
import type { ThemeCapabilityId } from "@voyant-travel/theme"

type JsonRequest<
  Path extends keyof paths,
  Method extends keyof paths[Path],
> = NonNullable<paths[Path][Method]> extends {
    requestBody: { content: { "application/json": infer Body } }
  }
    ? Body
    : never

type JsonResponse<
  Path extends keyof paths,
  Method extends keyof paths[Path],
  Status extends number,
> = NonNullable<paths[Path][Method]> extends { responses: infer Responses }
  ? Status extends keyof Responses
    ? Responses[Status] extends { content: { "application/json": infer Body } }
      ? Body
      : never
    : never
  : never

export const PUBLIC_API_PATHS = {
  shoppingSearch: "/v1/public/shopping/search",
  tripSelections: "/v1/public/trips/trip-selections",
  tripSelectionBook: "/v1/public/trips/trip-selections/book",
  bookingSessions: "/v1/public/catalog/booking-sessions",
  checkoutStart: "/v1/public/catalog/checkout/start",
} as const satisfies Record<string, PublishablePath>

export type ShoppingSearchRequest = JsonRequest<typeof PUBLIC_API_PATHS.shoppingSearch, "post">
export type ShoppingSearchResponse = JsonResponse<typeof PUBLIC_API_PATHS.shoppingSearch, "post", 200>
export type TripSelectionCreateRequest = JsonRequest<typeof PUBLIC_API_PATHS.tripSelections, "post">
export type TripSelectionUpdateRequest = JsonRequest<typeof PUBLIC_API_PATHS.tripSelections, "patch">
export type TripSelectionBookRequest = JsonRequest<typeof PUBLIC_API_PATHS.tripSelectionBook, "post">
export type BookingSessionCreateRequest = JsonRequest<typeof PUBLIC_API_PATHS.bookingSessions, "post">
export type BookingSessionUpdateRequest = JsonRequest<"/v1/public/catalog/booking-sessions/{sessionId}", "patch">
export type BookingSessionOutcome = JsonResponse<typeof PUBLIC_API_PATHS.bookingSessions, "post", 200>
export type CheckoutStartRequest = JsonRequest<typeof PUBLIC_API_PATHS.checkoutStart, "post">
export type CheckoutStartResponse = JsonResponse<typeof PUBLIC_API_PATHS.checkoutStart, "post", 200>

const CAPABILITY_PATHS = {
  "shopping.search.v1": PUBLIC_API_PATHS.shoppingSearch,
  "shopping.trip-selections.v1": PUBLIC_API_PATHS.tripSelections,
  "shopping.trip-booking.v1": PUBLIC_API_PATHS.tripSelectionBook,
  "booking.session.v1": PUBLIC_API_PATHS.bookingSessions,
  "checkout.v1": PUBLIC_API_PATHS.checkoutStart,
} as const satisfies Partial<Record<ThemeCapabilityId, PublishablePath>>

/**
 * Connected development only proxies canonical `/v1/public/*` routes. The
 * platform still owns availability and method policy; this projection merely
 * replaces historical Theme aliases with their generated Public API paths.
 */
export function canonicalPublicApiPath(
  capabilityId: ThemeCapabilityId,
): PublishablePath | undefined {
  return CAPABILITY_PATHS[capabilityId as keyof typeof CAPABILITY_PATHS]
}
