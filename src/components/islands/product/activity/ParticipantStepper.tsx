import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { fill } from "~/lib/messages"
import { cn } from "~/lib/utils"

import type { Copy } from "./copy"
import {
  CATEGORIES,
  countOf,
  labelOf,
  type ParticipantId,
  type Participants,
  summaryOf,
} from "./participants"

interface Props {
  value: Participants
  onChange: (next: Participants) => void
  copy: Copy
  className?: string
}

/**
 * How many are going, by age band.
 *
 * Sits in the resting state, above the calendar, because it is the one answer
 * the reader already knows before they have thought about a date — and because
 * every price on the panel below depends on it. Hiding it behind a step would
 * mean quoting a party of one to a family until they found the control.
 */
export default function ParticipantStepper({ value, onChange, copy, className }: Props) {
  function set(id: ParticipantId, next: number) {
    onChange({ ...value, [id]: next })
  }

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="u-eyebrow text-ink-subtle">{copy.participantsHeading}</p>
        <p className="text-[0.8125rem] text-ink-muted">{summaryOf(copy, value)}</p>
      </div>

      <ul className="mt-3 divide-y divide-line border-y border-line">
        {CATEGORIES.map((category) => {
          const count = value[category.id]
          const label = labelOf(copy, category.id)
          return (
            <li key={category.id} className="flex items-center justify-between gap-4 py-3">
              <p className="text-[0.9375rem] text-ink">
                {label} <span className="text-ink-subtle">({category.band})</span>
                {!category.chargeable && (
                  /*
                   * On the row itself, not in a footnote. A total that silently
                   * charged for the baby is a complaint; one that visibly did
                   * not is the reason the band exists.
                   */
                  <span className="text-ink-subtle"> {copy.freeBand}</span>
                )}
              </p>

              <div className="flex items-center gap-1">
                <StepButton
                  label={fill(copy.decrease, { label: label.toLowerCase() })}
                  icon={MinusSignIcon}
                  disabled={count <= category.min}
                  onClick={() => set(category.id, count - 1)}
                />
                {/*
                 * Announced on change so a screen-reader user is told the new
                 * count, which is otherwise only legible as a visual jump.
                 */}
                <span
                  className="w-8 text-center text-[0.9375rem] tabular-nums text-ink"
                  aria-live="polite"
                  aria-label={countOf(copy, category.id, count)}
                >
                  {count}
                </span>
                <StepButton
                  label={fill(copy.increase, { label: label.toLowerCase() })}
                  icon={PlusSignIcon}
                  disabled={count >= category.max}
                  onClick={() => set(category.id, count + 1)}
                />
              </div>
            </li>
          )
        })}
      </ul>
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
        "flex size-8 items-center justify-center rounded-pill border border-line text-ink",
        "transition-colors duration-300 hover:border-ink/30 hover:bg-surface-sunk",
        "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:bg-transparent",
      )}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
    </button>
  )
}
