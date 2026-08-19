/**
 * The vertical registry, in the order the tab strip renders.
 *
 * Packages lead because that is what most of these operators sell most of, and
 * the order is a merchandising decision rather than an alphabetical one — the
 * first tab is the default search a visitor lands in.
 */
import type { VerticalRegistry } from "../definition"
import { activities } from "./activities"
import { cruises } from "./cruises"
import { flights } from "./flights"
import { packages } from "./packages"
import { stays } from "./stays"
import { tours } from "./tours"

export const VERTICALS: VerticalRegistry = {
  packages,
  tours,
  stays,
  activities,
  cruises,
  flights,
}

export { activities, cruises, flights, packages, stays, tours }
