import type {
  ThemeCapabilityId,
  ThemeLive,
  ThemeLiveCapability,
} from "@voyant-travel/theme"
import { canonicalPublicApiPath } from "./public-api-contracts"

export function availableCapability(
  live: ThemeLive | undefined,
  id: ThemeCapabilityId,
): ThemeLiveCapability | undefined {
  const capability = live?.capabilities.find(
    (capability) =>
      capability.id === id && capability.available && capability.endpoint,
  )
  if (!capability) return undefined
  const endpoint = canonicalPublicApiPath(id)
  return endpoint ? { ...capability, endpoint } : capability
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

export function responseRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value
      .map(record)
      .filter((row): row is Record<string, unknown> => row !== undefined)
  }
  const envelope = record(value)
  if (!envelope) return []
  for (const key of ["data", "rows", "products", "items"] as const) {
    const rows = envelope[key]
    if (Array.isArray(rows)) {
      return rows
        .map(record)
        .filter((row): row is Record<string, unknown> => row !== undefined)
    }
  }
  return []
}

export function rowText(
  row: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return undefined
}
