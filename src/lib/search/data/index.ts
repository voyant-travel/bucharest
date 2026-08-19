/**
 * Every dataset, keyed by vertical.
 *
 * A demo theme has to be able to show a full result page before an operator has
 * connected anything, and it has to do it with data that looks like the market
 * it is being sold into — Romanian departure cities, euro prices, hotels that
 * exist. Swapping in a live supplier means replacing this map, not the engine
 * and not a single component.
 */
import type { Vertical } from "../contract"
import type { AnyCatalog } from "./catalog"
import { activitiesCatalog } from "./activities"
import { cruisesCatalog } from "./cruises"
import { flightsCatalog } from "./flights"
import { packagesCatalog } from "./packages"
import { staysCatalog } from "./stays"
import { toursCatalog } from "./tours"

export const CATALOGS: Record<Vertical, AnyCatalog> = {
  packages: packagesCatalog,
  tours: toursCatalog,
  stays: staysCatalog,
  activities: activitiesCatalog,
  cruises: cruisesCatalog,
  flights: flightsCatalog,
}
