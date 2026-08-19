import { useId, useState } from "react"

import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "~/components/ui/combobox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import type { Copy } from "~/lib/search/copy"
import { counted, fill, labelOf } from "~/lib/search/copy"
import type { FieldDef } from "~/lib/search/definition"
import { cn } from "~/lib/utils"

/**
 * Every value a search form can hold, in the shape the query carries.
 *
 * Rooms are the awkward one and the reason this is not `Record<string,string>`:
 * a hotel needs to know that room two holds two adults and a nine-year-old,
 * because the child's age changes both the price and whether the room is
 * bookable at all. A stepper that only counts children produces prices that
 * are wrong on arrival, which is worse than refusing to quote.
 */
export interface Room {
  adults: number
  childAges: number[]
}

export type FieldValue = string | string[] | number | boolean | Room[] | undefined

export type FormState = Record<string, FieldValue>

interface FieldProps {
  field: FieldDef
  value: FieldValue
  onChange: (value: FieldValue) => void
  /**
   * The reader's words, resolved once by the search shell.
   *
   * Passed down rather than looked up per field: a form is eleven controls and
   * three nested panels, and resolving the dictionary in each of them makes the
   * locale eleven independent decisions that can disagree.
   */
  copy: Copy
  /** Also carried, because plural rules and month names need the full tag. */
  locale: string
  /** Destination and origin suggestions, grouped by what they are. */
  suggestions?: { value: string; label: string; note?: string }[]
}

/**
 * One field, as a segment of a single instrument.
 *
 * Not a box. A row of outlined fields inside an outlined panel reads as
 * scaffolding; one panel holds the border and hairlines divide the fields, so
 * the row reads left to right as one sentence.
 *
 * The label owns its line outright. Sharing it with a hint was what reduced
 * "Check-in and check-out" to "Check-in and c…" and "When" to "W…" — the hint
 * ate the room and the field stopped saying what it was for. Hints now travel
 * with the control they qualify, into the panel where the choice is actually
 * made, which is also the only place they can be acted on.
 */
function FieldShell({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-1 px-5 py-3.5">
      <Label
        htmlFor={id}
        title={label}
        className="flex items-baseline gap-1 truncate text-[0.75rem] font-normal text-ink-subtle"
      >
        <span className="truncate">{label}</span>
        {required && <span className="shrink-0 text-accent">*</span>}
      </Label>
      <div className="flex min-w-0 items-center">{children}</div>
    </div>
  )
}

/** A hint, where the choice is made rather than where it is displayed. */
function Hint({ children }: { children?: string }) {
  if (!children) return null
  return (
    <p className="mb-3 border-b border-line pb-3 text-[0.75rem] text-ink-subtle">
      {children}
    </p>
  )
}

/**
 * The control wears no chrome: the panel around it already is the chrome.
 *
 * Height follows content rather than a fixed value — a fixed height is what
 * put the alignment problems back each time they were fixed somewhere else.
 */
const CONTROL = cn(
  /*
   * A fixed one-line box, and `!` because it has to win.
   *
   * Every control here comes from a different component with its own opinion
   * about height — the button variants ship `h-9`, the input group pads itself
   * to 40px around a 24px field. Left to those defaults the values in one row
   * sit at three different heights, which is the misalignment you can see but
   * cannot name. One line box, stated once, settles all of them.
   */
  "!h-6 w-full min-w-0 truncate border-0 bg-transparent !p-0 shadow-none outline-none",
  /*
   * `md:text-[1rem]` because shadcn's input ships `text-base md:text-sm`, and
   * a bare `text-[1rem]` loses to it above the breakpoint — which is every
   * screen this bar is laid out for. One value in the row rendering a size
   * smaller than its neighbours is the kind of difference nobody can name and
   * everybody sees.
   */
  "text-[1rem] leading-6 font-medium text-ink md:text-[1rem]",
  "placeholder:font-normal placeholder:text-ink-subtle",
  "focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none",
)

/**
 * A place, chosen by typing.
 *
 * Grouped and annotated rather than a flat list, because "Creta" means one
 * thing as a region and another as a resort, and a traveller who picks the
 * wrong one gets results they cannot explain. The empty state is popular
 * destinations rather than nothing: an empty dropdown teaches people the
 * field is broken.
 */
function DestinationField({ field, value, onChange, copy, suggestions = [] }: FieldProps) {
  const id = useId()
  const selected = typeof value === "string" ? value : ""

  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      {/*
        * Base UI reads its display text from `items`, so the list handed to it
        * carries only label and value. The note is rendered per row instead —
        * passed through `items` it becomes part of what the input echoes back,
        * and the field reads "Belek country / region".
        */}
      <Combobox
        items={suggestions.map((entry) => ({
          label: entry.label,
          value: entry.value,
        }))}
        value={selected}
        onValueChange={(next) => onChange(String(next ?? ""))}
        /*
         * The query filters on a slug and the traveller reads a name, so the
         * field has to be told how to turn one into the other. Without this it
         * echoes back "bucuresti", which tells them they are looking at a
         * database rather than at a departure city.
         */
        itemToStringLabel={(item: unknown) =>
          typeof item === "string"
            ? (suggestions.find((entry) => entry.value === item)?.label ?? item)
            : ((item as { label?: string } | null)?.label ?? "")
        }
      >
        {
          /*
           * Styled through the wrapper, because `ComboboxInput` puts the
           * className it is given on the input *group*, not on the input. The
           * inner field therefore kept the group's own `h-9 px-3 text-base` —
           * which is why this one value sat twelve pixels in from its label,
           * two pixels lower than its neighbours, and a size and weight
           * lighter than every other value in the row. Three symptoms, one
           * cause, and none of them fixable from the props.
           */
        }
        <ComboboxInput
          id={id}
          placeholder={field.placeholder?.(copy) ?? copy.placeholders.anywhere}
          className={cn(
            /*
             * `h-auto min-h-0`: the input group reserves 36px and centres a
             * 23px input inside it, which floated this value six pixels below
             * every button in the row.
             */
            "!h-6 min-h-0 border-0 bg-transparent !p-0 shadow-none",
            "[&_input]:!h-6 [&_input]:rounded-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:!px-0 [&_input]:!py-0",
            "[&_input]:text-[1rem] [&_input]:leading-6 [&_input]:font-medium [&_input]:text-ink md:[&_input]:text-[1rem]",
            "[&_input]:placeholder:font-normal [&_input]:placeholder:text-ink-subtle",
          )}
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {/*
             * A destination the operator does not sell is a lead, not a dead
             * end — the one thing an agency can do that a marketplace cannot.
             */}
            {copy.noSuchDestination}
          </ComboboxEmpty>
          <ComboboxList>
            {suggestions.map((entry) => (
              <ComboboxItem key={entry.value} value={entry.value}>
                <span className="flex w-full items-baseline justify-between gap-3">
                  <span>{entry.label}</span>
                  {entry.note && (
                    <span className="text-[0.75rem] text-ink-subtle">{entry.note}</span>
                  )}
                </span>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FieldShell>
  )
}

/**
 * A chosen date, in the reader's language.
 *
 * Through `Intl` against the reader's tag rather than a fixed one: a form that
 * echoes "14 sept. 2026" back at an English publication has answered in a
 * language nobody on that page asked for.
 */
function formatDate(value: string | undefined, locale: string): string {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toLocaleDateString(locale || "en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function DateField({ field, value, onChange, copy, locale }: FieldProps) {
  const id = useId()
  const current = typeof value === "string" ? value : ""
  const [open, setOpen] = useState(false)

  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="ghost"
              className={cn(CONTROL, "justify-start hover:bg-transparent")}
            />
          }
        >
          <span className="truncate">
            {formatDate(current, locale) || (
              <span className="text-ink-subtle">
                {field.placeholder?.(copy) ?? copy.placeholders.pickDate}
              </span>
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <Hint>{field.help?.(copy)}</Hint>
          <Calendar
            mode="single"
            selected={current ? new Date(current) : undefined}
            onSelect={(next: Date | undefined) => {
              onChange(next ? next.toISOString().slice(0, 10) : undefined)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}

function DateRangeField({ field, value, onChange, copy, locale }: FieldProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const range = Array.isArray(value) ? (value as string[]) : []
  const [from, to] = range

  /*
   * Nights, not dates, is what a traveller is deciding. Showing the count as
   * the range is dragged is the difference between a date picker and a
   * booking control.
   */
  const nights =
    from && to
      ? Math.max(
          0,
          Math.round(
            (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000,
          ),
        )
      : 0

  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="ghost"
              className={cn(CONTROL, "justify-start hover:bg-transparent")}
            />
          }
        >
          {from ? (
            <span>
              {formatDate(from, locale)} — {formatDate(to, locale) || "…"}
              {nights > 0 && (
                <span className="ml-2 text-ink-subtle">
                  {counted(locale, copy.plurals.nights, nights)}
                </span>
              )}
            </span>
          ) : (
            <span className="text-ink-subtle">
              {field.placeholder?.(copy) ?? copy.placeholders.pickDates}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <Hint>{field.help?.(copy)}</Hint>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={
              from ? { from: new Date(from), to: to ? new Date(to) : undefined } : undefined
            }
            onSelect={(next: { from?: Date; to?: Date } | undefined) => {
              onChange(
                next?.from
                  ? [
                      next.from.toISOString().slice(0, 10),
                      next.to ? next.to.toISOString().slice(0, 10) : "",
                    ]
                  : undefined,
              )
            }}
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}

/**
 * Months, not dates.
 *
 * A cruise sells eighteen months out and a circuit runs on fixed departures.
 * A date picker defaulted to next week returns nothing for either, and an
 * empty first result teaches the traveller the site is broken rather than that
 * their dates were wrong.
 */
/**
 * Months, chosen from a panel.
 *
 * A cruise sells eighteen months out and a circuit runs on fixed departures, so
 * a date picker defaulted to next week returns nothing for either and teaches
 * the traveller the site is broken. Months are the right unit — but a rail of
 * eighteen chips inline is the wrong container for them: it was the one field
 * that did not look like the others, it clipped at every width, and it pushed
 * the submit button onto its own line. Behind a trigger it costs one click and
 * behaves like every other field in the row.
 */
function MonthSetField({ field, value, onChange, copy, locale }: FieldProps) {
  const id = useId()
  const chosen = Array.isArray(value) ? (value as string[]) : []
  const [open, setOpen] = useState(false)
  const now = new Date()

  /*
   * Month names from `Intl`, not from a list.
   *
   * A hand-kept array is one language's twelve months hard-coded into a control
   * that every publication renders, and the second language to arrive gets
   * English chips inside its own form. The chip is short and the summary is
   * long, so both forms are asked for by name.
   */
  const short = new Intl.DateTimeFormat(locale || "en", { month: "short" })
  const long = new Intl.DateTimeFormat(locale || "en", { month: "long", year: "numeric" })

  const months = Array.from({ length: 18 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1)
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: long.format(date),
      short: short.format(date),
      year: date.getFullYear(),
    }
  })

  /*
   * One month reads as itself; several read as a count. Listing three in a
   * cell this wide only means clipping them.
   */
  const picked = months.filter((month) => chosen.includes(month.key))
  const summary =
    picked.length === 0
      ? undefined
      : picked.length === 1
        ? picked[0].label
        : counted(locale, copy.plurals.months, picked.length)

  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="ghost"
              className={cn(CONTROL, "justify-start hover:bg-transparent")}
            />
          }
        >
          <span className="truncate">
            {summary ?? (
              <span className="font-normal text-ink-subtle">
                {field.placeholder?.(copy) ?? copy.choices.anytime}
              </span>
            )}
          </span>
        </PopoverTrigger>

        <PopoverContent className="w-[20rem] p-4">
          <Hint>{field.help?.(copy)}</Hint>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month) => {
              const active = chosen.includes(month.key)
              return (
                <button
                  key={month.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange(
                      active
                        ? chosen.filter((entry) => entry !== month.key)
                        : [...chosen, month.key],
                    )
                  }
                  className={cn(
                    "rounded-card border px-2 py-2 text-[0.8125rem] transition-colors duration-300",
                    active
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-line text-ink-muted hover:border-ink/40 hover:text-ink",
                  )}
                >
                  <span className="block">{month.short}</span>
                  <span className="block text-[0.6875rem] opacity-70">
                    {month.year}
                  </span>
                </button>
              )
            })}
          </div>

          {picked.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-3 text-[0.8125rem] text-ink-subtle underline underline-offset-2 hover:text-ink"
            >
              {copy.clearSelection}
            </button>
          )}
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}

function BandsField({ field, value, onChange, copy, locale }: FieldProps) {
  const id = useId()
  const options = field.options ?? []
  const current = typeof value === "string" ? value : (options[0]?.value ?? "")

  /*
   * Three bands fit as a segmented row and read faster than a menu. Four do
   * not: at a quarter of the form's width "10-14 nights" and "Any length"
   * collide, and a control whose labels overlap is worse than one extra click.
   */
  if (options.length > 3) {
    return (
      <FieldShell id={id} label={field.label(copy)} required={field.required}>
        <Select
          value={current}
          onValueChange={(next) => onChange(String(next ?? ""))}
          items={options.map((option) => ({
            label: labelOf(option, copy, locale),
            value: option.value,
          }))}
        >
          <SelectTrigger id={id} className={cn(CONTROL, "gap-1")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {labelOf(option, copy, locale)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldShell>
    )
  }

  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      <ToggleGroup
        value={[current]}
        onValueChange={(next: string[]) => onChange(next[0] ?? "")}
        className="h-12 w-full rounded-card border border-line bg-surface p-1"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="flex-1 rounded-card text-[0.875rem]"
          >
            {labelOf(option, copy, locale)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FieldShell>
  )
}

function SelectField({ field, value, onChange, copy, locale }: FieldProps) {
  const id = useId()
  const current = typeof value === "string" ? value : (field.options?.[0]?.value ?? "")

  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      <Select
        value={current}
        onValueChange={(next) => onChange(String(next ?? ""))}
        items={(field.options ?? []).map((option) => ({
          label: labelOf(option, copy, locale),
          value: option.value,
        }))}
      >
        <SelectTrigger id={id} className={cn(CONTROL, "gap-1")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {labelOf(option, copy, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}

function ToggleField({ field, value, onChange, copy }: FieldProps) {
  const id = useId()
  /*
   * Wrapped like every other field rather than floated in the row. A bare
   * switch beside five labelled cells has nothing to align to, so it sat at a
   * different height and its own label wrapped to two lines.
   */
  return (
    <FieldShell id={`${id}-label`} label={field.label(copy)}>
      <span className="flex items-center gap-2.5">
        <Switch
          id={id}
          checked={value === true}
          onCheckedChange={(next) => onChange(Boolean(next))}
        />
        <span className="truncate text-[0.9375rem] font-medium text-ink">
          {value === true ? copy.yes : copy.no}
        </span>
      </span>
    </FieldShell>
  )
}

function TextField({ field, value, onChange, copy }: FieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      <Input
        id={id}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder?.(copy)}
        onChange={(event) => onChange(event.target.value)}
        className={CONTROL}
      />
    </FieldShell>
  )
}

function Stepper({
  label,
  note,
  value,
  min,
  max,
  copy,
  onChange,
}: {
  label: string
  note?: string
  value: number
  min: number
  max: number
  copy: Copy
  onChange: (next: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-[0.875rem] text-ink">{label}</span>
        {note && <span className="block text-[0.75rem] text-ink-subtle">{note}</span>}
      </span>
      <span className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-pill"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={fill(copy.oneFewer, { label })}
        >
          –
        </Button>
        <span className="w-5 text-center text-[0.9375rem] tabular-nums">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-pill"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label={fill(copy.oneMore, { label })}
        >
          +
        </Button>
      </span>
    </div>
  )
}

/**
 * Rooms, with an age for every child.
 *
 * The ceilings are business rules rather than validation: past three rooms or
 * five to a room an operator quotes by hand, so the control stops and offers
 * that instead of refusing. An unsatisfiable search is the most qualified lead
 * on the site, and treating it as an error throws it away.
 */
function RoomsField({ field, value, onChange, copy, locale }: FieldProps) {
  const id = useId()
  const rooms: Room[] = Array.isArray(value) && typeof value[0] === "object"
    ? (value as Room[])
    : [{ adults: 2, childAges: [] }]

  const maxRooms = field.max?.rooms ?? 3
  const maxPerRoom = field.max?.perRoom ?? 5
  const [open, setOpen] = useState(false)

  const people = rooms.reduce(
    (total, room) => total + room.adults + room.childAges.length,
    0,
  )
  /* Short on purpose: this is the longest value in the bar, and a cell that
   * has to clip it is a cell that looks broken. The full wording lives in the
   * popover, where there is room for it. */
  const summary = `${counted(locale, copy.plurals.guests, people)} · ${counted(
    locale,
    copy.plurals.rooms,
    rooms.length,
  )}`

  const update = (index: number, next: Room) =>
    onChange(rooms.map((room, position) => (position === index ? next : room)))

  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="ghost"
              className={cn(CONTROL, "justify-start hover:bg-transparent")}
            />
          }
        >
          <span className="truncate">{summary}</span>
        </PopoverTrigger>
        <PopoverContent className="w-[22rem] p-4">
          <Hint>{field.help?.(copy)}</Hint>
          {rooms.map((room, index) => (
            <div
              key={index}
              className={cn("pb-3", index > 0 && "border-t border-line pt-3")}
            >
              <div className="flex items-center justify-between">
                <p className="u-eyebrow text-ink-subtle">
                  {fill(copy.room, { number: index + 1 })}
                </p>
                {rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange(rooms.filter((_, position) => position !== index))
                    }
                    className="text-[0.75rem] text-ink-subtle underline"
                  >
                    {copy.removeRoom}
                  </button>
                )}
              </div>

              <Stepper
                label={copy.adults}
                copy={copy}
                value={room.adults}
                min={1}
                max={maxPerRoom - room.childAges.length}
                onChange={(adults) => update(index, { ...room, adults })}
              />
              <Stepper
                label={copy.children}
                note={copy.childAgesNote}
                copy={copy}
                value={room.childAges.length}
                min={0}
                max={maxPerRoom - room.adults}
                onChange={(count) =>
                  update(index, {
                    ...room,
                    childAges:
                      count > room.childAges.length
                        ? [...room.childAges, 8]
                        : room.childAges.slice(0, count),
                  })
                }
              />

              {room.childAges.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {room.childAges.map((age, childIndex) => (
                    <select
                      key={childIndex}
                      value={age}
                      aria-label={fill(copy.childAge, { number: childIndex + 1 })}
                      onChange={(event) =>
                        update(index, {
                          ...room,
                          childAges: room.childAges.map((entry, position) =>
                            position === childIndex ? Number(event.target.value) : entry,
                          ),
                        })
                      }
                      className="h-9 rounded-card border border-line bg-surface px-2 text-[0.8125rem] text-ink"
                    >
                      {Array.from({ length: 18 }, (_, year) => (
                        <option key={year} value={year}>
                          {counted(locale, copy.plurals.years, year)}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              )}
            </div>
          ))}

          {rooms.length < maxRooms ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 w-full"
              onClick={() => onChange([...rooms, { adults: 2, childAges: [] }])}
            >
              {copy.addRoom}
            </Button>
          ) : (
            <p className="mt-2 rounded-card border border-dashed border-line p-3 text-[0.8125rem] text-ink-muted">
              {field.overflowPrompt?.(copy) ?? copy.prompts.largerGroups}
            </p>
          )}
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}

/** Flat headcount, for the verticals where a room is not the unit. */
function PaxField({ field, value, onChange, copy, locale }: FieldProps) {
  const id = useId()
  const pax = Array.isArray(value) && typeof value[0] === "object"
    ? (value as Room[])[0]
    : { adults: 2, childAges: [] }
  const [open, setOpen] = useState(false)
  const total = pax.adults + pax.childAges.length

  return (
    <FieldShell id={id} label={field.label(copy)} required={field.required}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="ghost"
              className={cn(CONTROL, "justify-start hover:bg-transparent")}
            />
          }
        >
          <span className="truncate">
            {counted(locale, copy.plurals.travellers, total)}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-[19rem] p-4">
          <Hint>{field.help?.(copy)}</Hint>
          <Stepper
            label={copy.adults}
            note={copy.adultsNote}
            copy={copy}
            value={pax.adults}
            min={1}
            max={field.max?.total ?? 9}
            onChange={(adults) => onChange([{ ...pax, adults }])}
          />
          <Stepper
            label={copy.children}
            note={copy.childrenNote}
            copy={copy}
            value={pax.childAges.length}
            min={0}
            max={Math.max(0, (field.max?.total ?? 9) - pax.adults)}
            onChange={(count) =>
              onChange([
                {
                  ...pax,
                  childAges:
                    count > pax.childAges.length
                      ? [...pax.childAges, 8]
                      : pax.childAges.slice(0, count),
                },
              ])
            }
          />
          {total >= (field.max?.total ?? 9) && (
            <p className="mt-2 rounded-card border border-dashed border-line p-3 text-[0.8125rem] text-ink-muted">
              {field.overflowPrompt?.(copy) ?? copy.prompts.largerGroups}
            </p>
          )}
        </PopoverContent>
      </Popover>
    </FieldShell>
  )
}

/** One field, chosen by kind. The form knows nothing about verticals. */
export function SearchField(props: FieldProps) {
  switch (props.field.kind) {
    case "destination":
    case "origin":
      return <DestinationField {...props} />
    case "date":
      return <DateField {...props} />
    case "dateRange":
      return <DateRangeField {...props} />
    case "monthSet":
      return <MonthSetField {...props} />
    case "durationBands":
      return <BandsField {...props} />
    case "select":
      return <SelectField {...props} />
    case "toggle":
      return <ToggleField {...props} />
    case "rooms":
      return <RoomsField {...props} />
    case "pax":
      return <PaxField {...props} />
    case "text":
      return <TextField {...props} />
    default:
      return null
  }
}

export { FieldShell }
