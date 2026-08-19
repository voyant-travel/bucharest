import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useId } from "react"

import { cn } from "~/lib/utils"

import { counted, type Copy } from "./copy"

/**
 * One adult is the floor because a cabin with nobody in it is not a booking,
 * and four is the ceiling because that is the largest party the contract's
 * `maxOccupancy` ever describes on a cabin category. Two is the default for the
 * only reason that matters here: every fare on the page is quoted on it.
 */
export const MIN_ADULTS = 1
export const MAX_ADULTS = 4
export const DEFAULT_ADULTS = 2

interface Props {
  value: number
  onChange: (next: number) => void
  copy: Copy
  className?: string
}

/**
 * How many people share the cabin.
 *
 * Sits above the grades, in the resting state, because it changes the meaning
 * of every price below it — a grade that fits a couple and not a family is the
 * first thing the reader needs answered, and putting this behind a step would
 * quote a party of four the price of a party of two until they found it.
 */
export default function OccupancyStepper({ value, onChange, copy, className }: Props) {
  const labelId = useId()

  return (
    <div className={cn("min-w-0", className)} role="group" aria-labelledby={labelId}>
      <p id={labelId} className="u-eyebrow text-ink-subtle">
        {copy.occupancyHeading}
      </p>

      <div className="mt-2.5 flex items-center gap-1">
        <StepButton
          label={copy.fewerGuests}
          icon={MinusSignIcon}
          disabled={value <= MIN_ADULTS}
          onClick={() => onChange(value - 1)}
        />
        {/*
         * Announced on change, because the only other evidence that the button
         * worked is a digit changing somewhere off to the side and four prices
         * quietly re-deciding whether they still apply.
         */}
        <span
          className="w-9 text-center text-[1.0625rem] tabular-nums text-ink"
          aria-live="polite"
          aria-label={counted(copy, copy.people, value)}
        >
          {value}
        </span>
        <StepButton
          label={copy.moreGuests}
          icon={PlusSignIcon}
          disabled={value >= MAX_ADULTS}
          onClick={() => onChange(value + 1)}
        />
      </div>
    </div>
  )
}

function StepButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string
  icon: typeof PlusSignIcon
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-pill border border-line text-ink",
        "transition-colors duration-300 hover:border-ink/30 hover:bg-surface-sunk",
        "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:bg-transparent",
      )}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
    </button>
  )
}
