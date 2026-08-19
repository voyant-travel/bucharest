import type { Slot } from "~/lib/product/adapter"
import { cn } from "~/lib/utils"

import { isBookable } from "./availability"
import { counted, type Copy } from "./copy"

interface Props {
  slots: Slot[]
  value?: string | undefined
  onSelect: (time: string) => void
  label: string
  copy: Copy
}

/**
 * The start times of one option.
 *
 * Sold-out times stay in the row, struck through and disabled, rather than
 * being filtered out. A row that silently drops them reads as "these are the
 * times" and leaves the reader wondering why the 17:00 they were told about is
 * missing; a struck-through 17:00 answers that before they ask.
 */
export default function SlotPicker({ slots, value, onSelect, label, copy }: Props) {
  if (slots.length === 0) return null

  return (
    <div>
      <p className="u-eyebrow text-ink-subtle">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {slots.map((slot) => {
          const bookable = isBookable(slot)
          const active = bookable && slot.time === value
          /*
           * `few_left` is worded from its count rather than from the state —
           * it is the one state with a real number behind it — and every other
           * state that needs saying out loud comes from the dictionary.
           */
          const note =
            slot.state === "few_left" && slot.seatsLeft !== undefined
              ? counted(copy, copy.seatsLeft, slot.seatsLeft)
              : copy.slotState[slot.state]

          return (
            <li key={slot.time}>
              <button
                type="button"
                disabled={!bookable}
                aria-pressed={active}
                onClick={() => onSelect(slot.time)}
                className={cn(
                  "flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-card border px-3 py-2",
                  "transition-colors duration-300",
                  "disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent",
                  active
                    ? "border-ink bg-ink text-canvas"
                    : "border-line bg-surface hover:border-ink/30 hover:bg-surface-sunk",
                )}
              >
                <span
                  className={cn(
                    "text-[0.9375rem] font-medium tabular-nums leading-none",
                    !bookable && "text-ink-subtle line-through",
                  )}
                >
                  {slot.time}
                </span>
                {note && (
                  <span
                    className={cn(
                      "text-[0.6875rem] leading-none",
                      active ? "opacity-70" : bookable ? "text-brass" : "text-ink-subtle",
                    )}
                  >
                    {note}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
