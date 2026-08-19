import type { PluralForms } from "~/lib/messages"
import type { AvailabilityState } from "~/lib/product/mode"

import type { ParticipantId } from "./participants"

/**
 * Every word this panel supplies itself.
 *
 * An operator's own text — the name of an option, a badge they wrote — arrives
 * already translated, because the platform resolves a publication per locale.
 * What does not arrive is the scaffolding around it: the step headings, the
 * cancellation sentence, the accessible names on the steppers, the phrase for
 * a duration. Those are the theme's, so the theme translates them, and they
 * live beside the panel rather than in `~/lib/messages` for the same reason
 * `format.ts` keeps its own formatter — they are decisions about one surface.
 *
 * English is the source of truth and everything else is a translation of it. A
 * language this file does not carry falls back to English rather than rendering
 * a key: an operator publishing in a language nobody has translated this theme
 * into should get a working picker with English labels, not a page reading
 * `stepDate`.
 */
export interface Copy {
  /**
   * The tag `Intl` is handed for dates and numbers.
   *
   * The reader's own tag when this file carries their language, and the
   * dictionary's own tag when it does not — a page falling back to English
   * labels must not then print German month names beside them, because half a
   * page in each language reads as a bug rather than as a fallback.
   */
  locale: string
  /**
   * The language the forms below are written in.
   *
   * Plural categories are selected against this and not against `locale`: a
   * German reader gets the English dictionary, and asking `Intl.PluralRules`
   * for a German category would hand back a form these English strings never
   * declared.
   */
  language: string

  /* The panel */
  panelLabel: string
  sheetTitle: string
  /** `{index}` — the panel reveals its steps one at a time and numbers them. */
  step: string
  stepDate: string
  stepOption: string

  /* The date step */
  datesUnavailable: string
  hideCalendar: string
  changeDate: string
  showAllDates: string
  /** Accessible names for the strips, which are read as bare rows of numbers. */
  nearbyDates: string
  nearestDates: string
  nextDatesWithPlaces: string
  nextAvailable: string
  noDates: string

  /* The option step */
  checkingAvailability: string
  /** `{date}` */
  soldOutOn: string
  closestDates: string
  noLaterDates: string
  availabilityFailed: string

  /* The compact trigger */
  reviewBooking: string
  chooseDateAndTime: string
  chooseDate: string
  /** `{time}` — appended to a date, never printed alone. */
  atTime: string

  /* One option's card */
  perPerson: string
  inTotal: string
  /** `{people}` — already counted, so the noun agrees with the number. */
  maxGroup: string
  /** `{people}` */
  overCapacity: string
  soldOutForDate: string
  /** `{date}` — the deadline as a day, never as "48 h before". */
  freeCancellationUntil: string
  freeCancellation: string
  noFreeCancellation: string
  startTime: string
  selected: string
  select: string

  /* Start times */
  slotState: Partial<Record<AvailabilityState, string>>
  seatsLeft: PluralForms

  /* What has been chosen */
  free: string
  totalWithTaxes: string
  bookNow: string
  requestQuote: string
  noRoute: string
  chooseTimeToContinue: string
  instantConfirmation: string
  confirmBeforePayment: string

  /* Who is going */
  participantsHeading: string
  freeBand: string
  /** `{label}` — the accessible names on the two stepper buttons. */
  decrease: string
  increase: string
  participant: Record<ParticipantId, { label: string; counted: PluralForms }>

  /* Counted phrases */
  people: PluralForms
  minutes: PluralForms
  hours: PluralForms

  /** Language codes as words, for the line naming the guide's language. */
  languages: Record<string, string>
}

export const EN: Copy = {
  locale: "en",
  language: "en",

  panelLabel: "Availability and booking",
  sheetTitle: "Availability",
  step: "Step {index}",
  stepDate: "Date",
  stepOption: "Option",

  datesUnavailable: "Available dates cannot be shown right now.",
  hideCalendar: "Hide the calendar",
  changeDate: "Change date",
  showAllDates: "See all dates",
  nearbyDates: "Nearby dates",
  nearestDates: "Nearest available dates",
  nextDatesWithPlaces: "Next dates with places",
  nextAvailable: "Next available",
  noDates: "No dates available",

  checkingAvailability: "Checking availability",
  soldOutOn: "Sold out on {date}",
  closestDates: "The closest days with places:",
  noLaterDates: "There are no later dates available.",
  availabilityFailed: "Availability cannot be checked right now.",

  reviewBooking: "Review your booking",
  chooseDateAndTime: "Choose a date and time",
  chooseDate: "Choose a date",
  atTime: "at {time}",

  perPerson: "/ person",
  inTotal: "total",
  maxGroup: "Max. {people}",
  overCapacity: "Over this option's maximum of {people}.",
  soldOutForDate: "Sold out for the date you chose.",
  freeCancellationUntil: "Free cancellation until {date}",
  freeCancellation: "Free cancellation",
  noFreeCancellation: "No free cancellation",
  startTime: "Start time",
  selected: "Selected",
  select: "Select",

  slotState: {
    sold_out: "sold out",
    not_offered: "not offered",
    expired: "past",
    on_request: "on request",
    waitlist: "waitlist",
  },
  seatsLeft: { one: "Only 1 place left", other: "Only {count} places left" },

  free: "free",
  totalWithTaxes: "Total (taxes included)",
  bookNow: "Book now",
  requestQuote: "Request a quote",
  noRoute: "Contact the agency for availability and pricing.",
  chooseTimeToContinue: "Choose a start time to continue.",
  instantConfirmation: "Nothing charged now · Instant confirmation",
  confirmBeforePayment: "We confirm availability before taking any payment.",

  participantsHeading: "Travellers",
  freeBand: "— free",
  decrease: "Remove one {label}",
  increase: "Add one {label}",
  participant: {
    adult: {
      label: "Adult",
      counted: { one: "{count} adult", other: "{count} adults" },
    },
    child: {
      label: "Child",
      counted: { one: "{count} child", other: "{count} children" },
    },
    infant: {
      label: "Infant",
      counted: { one: "{count} infant", other: "{count} infants" },
    },
  },

  people: { one: "{count} person", other: "{count} people" },
  minutes: { one: "{count} minute", other: "{count} minutes" },
  hours: { one: "{count} hour", other: "{count} hours" },

  languages: {
    RO: "Romanian",
    EN: "English",
    FR: "French",
    DE: "German",
    IT: "Italian",
    ES: "Spanish",
    HU: "Hungarian",
    RU: "Russian",
  },
}

export const RO: Copy = {
  locale: "ro-RO",
  language: "ro",

  panelLabel: "Disponibilitate și rezervare",
  sheetTitle: "Disponibilitate",
  step: "Pasul {index}",
  stepDate: "Data",
  stepOption: "Opțiunea",

  datesUnavailable: "Datele disponibile nu pot fi afișate acum.",
  hideCalendar: "Ascunde calendarul",
  changeDate: "Schimbă data",
  showAllDates: "Vezi toate datele",
  nearbyDates: "Date apropiate",
  nearestDates: "Cele mai apropiate date disponibile",
  nextDatesWithPlaces: "Următoarele date cu locuri",
  nextAvailable: "Următoarea disponibilitate",
  noDates: "Fără date disponibile",

  checkingAvailability: "Se verifică disponibilitatea",
  soldOutOn: "Epuizat pe {date}",
  closestDates: "Cele mai apropiate zile cu locuri:",
  noLaterDates: "Nu mai sunt zile disponibile după această dată.",
  availabilityFailed: "Disponibilitatea nu poate fi verificată acum.",

  reviewBooking: "Vezi rezervarea",
  chooseDateAndTime: "Alege data și ora",
  chooseDate: "Alege data",
  atTime: "ora {time}",

  perPerson: "/ persoană",
  inTotal: "în total",
  maxGroup: "Max. {people}",
  overCapacity: "Peste maximul de {people} pentru această opțiune.",
  soldOutForDate: "Epuizat pentru data aleasă.",
  freeCancellationUntil: "Anulare gratuită până pe {date}",
  freeCancellation: "Anulare gratuită",
  noFreeCancellation: "Fără anulare gratuită",
  startTime: "Ora de început",
  selected: "Selectat",
  select: "Selectează",

  slotState: {
    sold_out: "epuizat",
    not_offered: "nu se oferă",
    expired: "a trecut",
    on_request: "la cerere",
    waitlist: "listă de așteptare",
  },
  seatsLeft: {
    one: "Ultimul loc",
    few: "Ultimele {count} locuri",
    other: "Ultimele {count} de locuri",
  },

  free: "gratuit",
  totalWithTaxes: "Total (taxe incluse)",
  bookNow: "Rezervă acum",
  requestQuote: "Cere ofertă",
  noRoute: "Contactează agenția pentru disponibilitate și preț.",
  chooseTimeToContinue: "Alege o oră ca să continui.",
  instantConfirmation: "Nu se percepe nimic acum · Confirmare imediată",
  confirmBeforePayment: "Confirmăm disponibilitatea înainte de orice plată.",

  participantsHeading: "Participanți",
  freeBand: "— gratuit",
  decrease: "Scade {label}",
  increase: "Adaugă {label}",
  participant: {
    adult: {
      label: "Adult",
      counted: {
        one: "{count} adult",
        few: "{count} adulți",
        other: "{count} de adulți",
      },
    },
    child: {
      label: "Copil",
      counted: {
        one: "{count} copil",
        few: "{count} copii",
        other: "{count} de copii",
      },
    },
    infant: {
      label: "Bebeluș",
      counted: {
        one: "{count} bebeluș",
        few: "{count} bebeluși",
        other: "{count} de bebeluși",
      },
    },
  },

  people: {
    one: "{count} persoană",
    few: "{count} persoane",
    other: "{count} de persoane",
  },
  minutes: {
    one: "{count} minut",
    few: "{count} minute",
    other: "{count} de minute",
  },
  hours: { one: "{count} oră", few: "{count} ore", other: "{count} de ore" },

  languages: {
    RO: "Română",
    EN: "Engleză",
    FR: "Franceză",
    DE: "Germană",
    IT: "Italiană",
    ES: "Spaniolă",
    HU: "Maghiară",
    RU: "Rusă",
  },
}

const DICTIONARIES: Record<string, Copy> = { en: EN, ro: RO }

/**
 * The language subtag, lowercased.
 *
 * A publication may be `en-GB`, `ro-RO` or `de-AT`; these labels do not differ
 * by region, so they are keyed by language alone. Matches the resolver in
 * `src/lib/messages.ts` — two conventions would mean two places to forget a
 * string.
 */
function language(locale: string | undefined): string {
  return typeof locale === "string" ? (locale.split("-")[0] ?? "en").toLowerCase() : "en"
}

export function copyFor(locale: string | undefined): Copy {
  const dictionary = DICTIONARIES[language(locale)]
  if (dictionary === undefined) return EN
  /*
   * The region is carried through only for a language this file translates.
   * `en-GB` and `en-US` order a date differently — 20 Aug against Aug 20 — and
   * this panel prints the same day three times over, so losing the region would
   * hand a British reader an American date beside a British label.
   */
  return locale ? { ...dictionary, locale } : dictionary
}

/**
 * A counted phrase in the reader's language.
 *
 * The category comes from `Intl.PluralRules`, so Romanian's *few* — the reason
 * "19 locuri" is right and "20 locuri" is not, the twentieth taking a "de" the
 * nineteenth does not — is handled by the same call that handles English's two
 * forms. `display` exists for a count that is printed
 * differently from how it is counted: 2.5 hours selects its category from the
 * number and prints as "2,5" in Romanian.
 */
export function counted(
  copy: Copy,
  forms: PluralForms,
  count: number,
  display?: string,
): string {
  let category: Intl.LDMLPluralRule = "other"
  try {
    category = new Intl.PluralRules(copy.language).select(count)
  } catch {
    category = new Intl.PluralRules("en").select(count)
  }
  return (forms[category] ?? forms.other).replaceAll("{count}", display ?? String(count))
}
