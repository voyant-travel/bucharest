import { useEffect, useState } from "react"

import type { ActivityOption, Slot } from "~/lib/product/adapter"
import type { AvailabilityState, LiveState } from "~/lib/product/mode"

import { seatCount, type Participants } from "./participants"

/**
 * What supply says, and the seam where it will start saying it live.
 *
 * A publication snapshot carries no availability, so what an experience can
 * actually sell on a given day is a fetch that can be in flight, refused or
 * broken — the same arrangement, and the same reasoning, as
 * `src/lib/product/adapter.ts`. Today `offeredOn` answers from the options the
 * page was handed; when an operator's endpoint is reachable, only its body
 * changes and the panel's five states already exist to render the answer.
 */

/**
 * Which supply states may be taken right now.
 *
 * `on_request` and `waitlist` are deliberately excluded. Both are real answers
 * and neither is a booking: routing them through the same control as an
 * instantly confirmed slot would make the panel's promise of instant
 * confirmation false for whoever picked one.
 */
const BOOKABLE: readonly AvailabilityState[] = ["available", "guaranteed", "few_left"]

export function isBookable(slot: Slot): boolean {
  return BOOKABLE.includes(slot.state)
}

/**
 * Whether this party can take this option at all.
 *
 * Capacity is checked against the whole party rather than against the paying
 * half — see `seatCount`. An option that cannot carry the group is left in the
 * list, refused and labelled, because removing it would leave the reader
 * wondering where the private tour went.
 */
export function isTakeable(
  option: ActivityOption,
  party: Participants,
  withTimes: boolean,
): boolean {
  if (option.groupSizeMax !== undefined && seatCount(party) > option.groupSizeMax) return false
  return !withTimes || option.slots.some(isBookable)
}

/**
 * The options an operator can sell on a given day.
 *
 * `date` is not read yet — the fixture prices every day alike — and it is the
 * whole point of the function all the same: it is the argument a live endpoint
 * decides on, and the reason this cannot be a `useMemo` over props.
 */
export function offeredOn(
  date: string,
  options: ActivityOption[],
  withTimes: boolean,
): ActivityOption[] {
  void date
  return options.filter((option) => !withTimes || option.slots.some(isBookable))
}

export interface Availability {
  live: LiveState
  offered: ActivityOption[]
}

/**
 * The availability lookup as a state, not as a value.
 *
 * Every transition the panel has to render is here, and they are distinct on
 * purpose: `unavailable` is the operator answering "not that day", `failed` is
 * nobody answering at all. Collapsing the two is how a page ends up telling a
 * traveller that a tour is sold out when in truth a request timed out.
 */
export function useAvailability(
  date: string | undefined,
  options: ActivityOption[],
  withTimes: boolean,
  /** Whether the page was handed anything to sell in the first place. */
  hasSupply: boolean,
): Availability {
  const [result, setResult] = useState<Availability>({
    live: hasSupply ? "idle" : "failed",
    offered: [],
  })

  useEffect(() => {
    if (!hasSupply) {
      /*
       * Not `unavailable`. This module is only rendered for a bookable
       * product, so an empty commerce payload means the live fetch never
       * arrived — an absence of an answer, which is what `failed` means.
       */
      setResult({ live: "failed", offered: [] })
      return
    }
    if (!date) {
      setResult({ live: "idle", offered: [] })
      return
    }

    let current = true
    setResult({ live: "checking", offered: [] })
    Promise.resolve()
      .then(() => offeredOn(date, options, withTimes))
      .then((offered) => {
        if (current) {
          setResult({ live: offered.length > 0 ? "priced" : "unavailable", offered })
        }
      })
      .catch(() => {
        if (current) setResult({ live: "failed", offered: [] })
      })

    /* A reader who taps three dates in a second must not be shown the answer
     * to the first one because it came back last. */
    return () => {
      current = false
    }
  }, [date, options, withTimes, hasSupply])

  return result
}
