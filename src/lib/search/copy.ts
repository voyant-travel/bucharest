/**
 * The words the travel search supplies itself.
 *
 * Everything an operator writes arrives translated: the platform resolves a
 * publication per locale, so headings and body copy are already in the reader's
 * language by the time a component sees them. The search is different. It
 * invents most of what it says — a facet heading, a board basis, the sentence
 * printed when nothing matched — and those strings ship with the theme, so the
 * theme has to translate them.
 *
 * English is the source of truth and every other language is a translation of
 * it. A language this file does not carry falls back to English rather than
 * rendering a key: an operator publishing in a language nobody has translated
 * this theme into should get a working search with English labels, not a page
 * reading `facets.board`.
 *
 * What is *not* here is the catalogue. A hotel name, a resort, a port and a
 * cruise line are demo content standing in for a supplier feed, and putting
 * them in a dictionary would say the theme owns them — it does not, and the day
 * a live catalogue is wired in every one of those keys would be dead. The line
 * is ownership, not language: the theme's own vocabulary is keyed here, and the
 * data declares its own proper nouns.
 */
import type { PriceBasis, Vertical } from "./contract"

/**
 * Counted phrases, keyed by CLDR plural category.
 *
 * "1 nights" is the detail that tells a reader nobody looked at the page, and a
 * naive `n === 1` only ever fixes English. Romanian needs three forms and the
 * third is not about one versus many at all — the noun changes again above
 * nineteen — so the count is resolved through `Intl.PluralRules` against forms
 * each language declares for itself. Matches the convention in `src/lib/messages.ts`; two
 * conventions would mean two places to forget a form.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string
}

export type CountedPhrase =
  | "nights"
  | "days"
  | "hours"
  | "minutes"
  | "months"
  | "years"
  | "travellers"
  | "guests"
  | "rooms"
  | "reviews"
  | "stops"
  | "ports"
  | "sights"
  | "stars"
  | "seatsLeft"
  | "moreDates"

/**
 * A value with a reader-facing name, wherever a vertical or a dataset declares
 * one — a form option, a facet value, a duration band.
 *
 * Two ways of naming it, because there are genuinely two kinds. A port and an
 * airline are proper nouns: they read the same in every language and the data
 * is the only place that knows them, so they carry `name`. "Half board" and
 * "Direct flight" are the theme talking, and a rail that says *Demipensiune*
 * beside *Free cancellation* has mixed two languages on one page — so those
 * carry `label`, resolved against the reader's dictionary at render time.
 */
export interface Labelled {
  value: string
  /** A proper noun. The same string in every language. */
  name?: string
  /** Words the theme supplies, resolved per locale. */
  label?: (copy: Copy, locale: string) => string
}

/** What a vertical is called, and what it counts in. */
export interface VerticalCopy {
  /** Tab label. */
  name: string
  /** The button on a form that waits to be submitted. */
  submit: string
  /** The whole counted phrase: "36 holidays found". */
  results: PluralForms
}

export interface Copy {
  /** The tab strip's accessible name. */
  verticalTabs: string
  verticals: Record<Vertical, VerticalCopy>

  // ---- Above the results
  /** `{price}` — the floor across the filtered set. */
  pricesFrom: string
  /** `{price}` — the same figure where there is no room for a sentence. */
  from: string
  /** A facet value nothing can be bought under. */
  unavailable: string
  /** `{action}` — said only where the form waits to be submitted. */
  searchChanged: string
  filters: string
  clearFilters: string
  activeFilters: string
  nothingMatches: string
  /** `{first}`, `{last}`, `{total}`. */
  showing: string
  previousPage: string
  nextPage: string
  /** `{number}`. */
  pageNumber: string

  // ---- The facet rail
  /** Placeholder in a facet's own filter box, and in a text facet. */
  facetSearch: string
  /** `{count}` — values hidden behind the truncation. */
  showMore: string
  showFewer: string
  facets: {
    departureCity: string
    price: string
    transport: string
    board: string
    classification: string
    rating: string
    stops: string
    airlines: string
    amenities: string
    tags: string
    transfer: string
    cancellation: string
    property: string
    propertyType: string
    month: string
    duration: string
    country: string
    destination: string
    cruiseLine: string
    departurePort: string
    ship: string
    category: string
    timeOfDay: string
    language: string
    features: string
  }

  // ---- The result card
  /** How a price should be read. Never inferred, never omitted. */
  basis: Record<PriceBasis, string>
  viewOffer: string
  /** `{count}`. */
  classification: string
  /** `{score}` — experiences are rated out of five, not out of ten. */
  outOfFive: string

  // ---- The sort control
  sorts: {
    recommended: string
    best: string
    cheapest: string
    priciest: string
    topRated: string
    classification: string
    departureDate: string
    departureTime: string
    duration: string
  }

  // ---- The form
  fields: {
    departureCity: string
    destination: string
    departureDate: string
    departureMonth: string
    duration: string
    transport: string
    roomsAndTravellers: string
    roomsAndGuests: string
    checkInOut: string
    pets: string
    where: string
    when: string
    participants: string
    search: string
    cruiseLine: string
    departurePort: string
    passengers: string
    tripType: string
    from: string
    to: string
    outbound: string
    inbound: string
    cabin: string
    directOnly: string
  }
  placeholders: {
    anywhere: string
    whereFrom: string
    whereTo: string
    where: string
    whatToDo: string
    countryOrRoute: string
    city: string
    pickDate: string
    pickDates: string
  }
  hints: {
    flexibleDays: string
    maxNights: string
    childAges: string
    anytimeIfFlexible: string
    doubleOccupancy: string
  }
  prompts: {
    groupQuote: string
    tailoredQuote: string
    largerGroups: string
  }
  /** The absence of a choice, spelled out. A select's first option. */
  choices: {
    any: string
    anyRegion: string
    anyDuration: string
    anyLength: string
    anytime: string
    roundTrip: string
    oneWay: string
  }

  // ---- Controls inside the form's panels
  /** The destination field's empty state is a lead, not a dead end. */
  noSuchDestination: string
  clearSelection: string
  yes: string
  no: string
  adults: string
  children: string
  adultsNote: string
  childrenNote: string
  childAgesNote: string
  /** `{number}`. */
  childAge: string
  /** `{number}`. */
  room: string
  removeRoom: string
  addRoom: string
  /** `{label}` — a stepper's two buttons, announced. */
  oneFewer: string
  oneMore: string
  /** What the two suggestion lists mean, where the data cannot say it. */
  notes: {
    country: string
    countryOrRegion: string
  }

  // ---- The vocabulary the datasets share
  board: {
    ro: string
    bb: string
    hb: string
    fb: string
    ai: string
    uai: string
  }
  cancellation: {
    free: string
    fee: string
    nonrefundable: string
  }
  transfer: {
    included: string
    optional: string
    none: string
  }
  transport: {
    plane: string
    coach: string
    own: string
  }
  stops: {
    direct: string
    directFlight: string
    one: string
    twoPlus: string
  }
  /** The word beside a score. Booking sites train the expectation; match it. */
  ratings: {
    exceptional: string
    veryGood: string
    good: string
    pleasant: string
  }
  cabins: {
    economy: string
    premium: string
    business: string
  }
  amenities: {
    pool: string
    beach: string
    spa: string
    aquapark: string
    kidsclub: string
    gym: string
    alacarte: string
    wifi: string
    parking: string
    airconditioning: string
  }
  propertyTypes: {
    hotel: string
    aparthotel: string
    apartment: string
    villa: string
    guesthouse: string
    hostel: string
  }
  categories: {
    tours: string
    museums: string
    food: string
    adventure: string
    water: string
    nature: string
    shows: string
    wellness: string
  }
  times: {
    morning: string
    afternoon: string
    evening: string
  }
  languages: {
    ro: string
    en: string
    fr: string
    es: string
    it: string
    de: string
  }
  features: {
    freecancellation: string
    instant: string
    mobileticket: string
    skiptheline: string
    liveguide: string
    smallgroup: string
    transferincluded: string
    accessible: string
  }
  baggage: {
    underseat: string
    cabin: string
    checked23: string
    checked30: string
    twochecked: string
  }
  /** Merchandising labels: a ribbon on a card, a value in the tags facet. */
  tags: {
    recommended: string
    family: string
    adultsonly: string
    luxury: string
    earlybooking: string
    lastplaces: string
    bestseller: string
    guaranteed: string
    smallgroup: string
    tourmanager: string
    exotic: string
    romantic: string
    business: string
    eco: string
    limitedoffer: string
    shortbreak: string
    rareitinerary: string
    repositioning: string
    travellerfavourite: string
  }

  /** Above the title on a card: when it leaves, and from where. */
  eyebrows: {
    departing: string
    departingFrom: string
  }

  // ---- What a card says a traveller is buying
  inclusions: {
    /** `{mode}`. */
    travelBy: string
    airportTransfer: string
    airportTaxes: string
    cancellationCover: string
    bedAndBreakfast: string
    tourManager: string
    /** `{places}`. */
    visits: string
    chosenCabin: string
    fullBoardOnBoard: string
    entertainment: string
    portTaxes: string
    petsWelcome: string
    noPets: string
    parking: string
    roundTrip: string
    oneWay: string
  }
  /** The small print under a figure. It is the unit, not a disclaimer. */
  footnotes: {
    packageTotal: string
    perNight: string
    perPersonDouble: string
    cruiseFare: string
    perPerson: string
    flightRoundTrip: string
    flightOneWay: string
  }

  /**
   * Duration bands, which are counted phrases with a range where the number
   * goes. `{value}` is already a counted phrase in the reader's language.
   */
  bands: {
    under: string
    over: string
    upTo: string
  }

  plurals: Record<CountedPhrase, PluralForms>
}

export const EN: Copy = {
  verticalTabs: "Trip types",
  verticals: {
    packages: {
      name: "Holidays",
      submit: "Search holidays",
      results: { one: "{count} holiday found", other: "{count} holidays found" },
    },
    tours: {
      name: "Escorted tours",
      submit: "Search tours",
      results: { one: "{count} tour found", other: "{count} tours found" },
    },
    stays: {
      name: "Stays",
      submit: "Search stays",
      results: { one: "{count} property found", other: "{count} properties found" },
    },
    activities: {
      name: "Experiences",
      submit: "Search experiences",
      results: { one: "{count} experience found", other: "{count} experiences found" },
    },
    cruises: {
      name: "Cruises",
      submit: "Search cruises",
      results: { one: "{count} cruise found", other: "{count} cruises found" },
    },
    flights: {
      name: "Flights",
      submit: "Search flights",
      results: { one: "{count} flight found", other: "{count} flights found" },
    },
  },

  pricesFrom: "Prices from {price}",
  from: "from {price}",
  unavailable: "unavailable",
  searchChanged: "You have changed the search — press {action}.",
  filters: "Filters",
  clearFilters: "Clear filters",
  activeFilters: "Active filters:",
  nothingMatches:
    "Nothing matches these filters. Remove one, or write to us and we will look for you.",
  showing: "Showing {first}–{last} of {total}",
  previousPage: "Previous",
  nextPage: "Next",
  pageNumber: "Page {number}",

  facetSearch: "Search",
  showMore: "Show {count} more",
  showFewer: "Show fewer",
  facets: {
    departureCity: "Departure city",
    price: "Price",
    transport: "Transport",
    board: "Board basis",
    classification: "Classification",
    rating: "Guest rating",
    stops: "Stops",
    airlines: "Airlines",
    amenities: "Facilities",
    tags: "Tags",
    transfer: "Transfer",
    cancellation: "Cancellation",
    property: "Property name",
    propertyType: "Property type",
    month: "Month",
    duration: "Duration",
    country: "Countries",
    destination: "Destinations",
    cruiseLine: "Cruise lines",
    departurePort: "Departure port",
    ship: "Ships",
    category: "Categories",
    timeOfDay: "Time of day",
    language: "Language",
    features: "Features",
  },

  basis: {
    per_night: "/ night",
    per_stay: "/ stay",
    per_person: "/ person",
    per_party: "total",
  },
  viewOffer: "View offer",
  classification: "Classification {count}",
  outOfFive: "{score} out of 5",

  sorts: {
    recommended: "Recommended",
    best: "Best overall",
    cheapest: "Price, lowest first",
    priciest: "Price, highest first",
    topRated: "Guest rating",
    classification: "Classification",
    departureDate: "Departure date",
    departureTime: "Departure time",
    duration: "Duration",
  },

  fields: {
    departureCity: "Departure city",
    destination: "Destination",
    departureDate: "Departure date",
    departureMonth: "Departure month",
    duration: "Duration",
    transport: "Transport",
    roomsAndTravellers: "Rooms and travellers",
    roomsAndGuests: "Rooms and guests",
    checkInOut: "Check-in and check-out",
    pets: "Travelling with a pet",
    where: "Where",
    when: "When",
    participants: "Participants",
    search: "Search",
    cruiseLine: "Cruise line",
    departurePort: "Departure port",
    passengers: "Passengers",
    tripType: "Trip type",
    from: "From",
    to: "To",
    outbound: "Outbound",
    inbound: "Return",
    cabin: "Cabin",
    directOnly: "Direct flights only",
  },
  placeholders: {
    anywhere: "Anywhere",
    whereFrom: "Where from?",
    whereTo: "Where to?",
    where: "Where?",
    whatToDo: "What do you want to do?",
    countryOrRoute: "Country or route",
    city: "City",
    pickDate: "Pick a date",
    pickDates: "Pick your dates",
  },
  hints: {
    flexibleDays: "± 3 days",
    maxNights: "Up to 14 nights",
    childAges: "Children's ages at check-in",
    anytimeIfFlexible: "Leave empty if your dates are open",
    doubleOccupancy: "Fares are per person, two sharing",
  },
  prompts: {
    groupQuote: "Ask us for a group quote",
    tailoredQuote: "Ask us for a tailored quote",
    largerGroups: "For larger groups, write to us.",
  },
  choices: {
    any: "Any",
    anyRegion: "All regions",
    anyDuration: "Any duration",
    anyLength: "Any length",
    anytime: "Anytime",
    roundTrip: "Return",
    oneWay: "One way",
  },

  noSuchDestination:
    "We do not sell this destination yet. Write to us and we will look for it.",
  clearSelection: "Clear selection",
  yes: "Yes",
  no: "No",
  adults: "Adults",
  children: "Children",
  adultsNote: "12 and over",
  childrenNote: "2–11 years",
  childAgesNote: "0–17 years",
  childAge: "Age of child {number}",
  room: "Room {number}",
  removeRoom: "Remove",
  addRoom: "Add a room",
  oneFewer: "{label}: one fewer",
  oneMore: "{label}: one more",
  notes: {
    country: "country",
    countryOrRegion: "country / region",
  },

  board: {
    ro: "Room only",
    bb: "Breakfast included",
    hb: "Half board",
    fb: "Full board",
    ai: "All inclusive",
    uai: "Ultra all inclusive",
  },
  cancellation: {
    free: "Free cancellation",
    fee: "Cancellation for a fee",
    nonrefundable: "Non-refundable",
  },
  transfer: {
    included: "Transfer included",
    optional: "Transfer optional",
    none: "No transfer",
  },
  transport: {
    plane: "Flight",
    coach: "Coach",
    own: "Your own transport",
  },
  stops: {
    direct: "Direct",
    directFlight: "Direct flight",
    one: "One stop",
    twoPlus: "Two stops or more",
  },
  ratings: {
    exceptional: "Exceptional",
    veryGood: "Very good",
    good: "Good",
    pleasant: "Pleasant",
  },
  cabins: {
    economy: "Economy",
    premium: "Premium Economy",
    business: "Business",
  },
  amenities: {
    pool: "Pool",
    beach: "Private beach",
    spa: "Spa and wellness",
    aquapark: "Water park",
    kidsclub: "Kids' club",
    gym: "Gym",
    alacarte: "À la carte restaurant",
    wifi: "Free Wi-Fi",
    parking: "Parking",
    airconditioning: "Air conditioning",
  },
  propertyTypes: {
    hotel: "Hotel",
    aparthotel: "Aparthotel",
    apartment: "Apartment",
    villa: "Villa",
    guesthouse: "Guesthouse",
    hostel: "Hostel",
  },
  categories: {
    tours: "Guided tours",
    museums: "Museums and attractions",
    food: "Food and wine",
    adventure: "Adventure",
    water: "On the water",
    nature: "Nature and walking",
    shows: "Shows and events",
    wellness: "Wellness",
  },
  times: {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
  },
  languages: {
    ro: "Romanian",
    en: "English",
    fr: "French",
    es: "Spanish",
    it: "Italian",
    de: "German",
  },
  features: {
    freecancellation: "Free cancellation",
    instant: "Instant confirmation",
    mobileticket: "Mobile ticket",
    skiptheline: "Skip the line",
    liveguide: "Live guide",
    smallgroup: "Small group",
    transferincluded: "Transfer included",
    accessible: "Wheelchair accessible",
  },
  baggage: {
    underseat: "Under-seat bag only",
    cabin: "Cabin bag included",
    checked23: "23 kg checked bag included",
    checked30: "30 kg checked bag included",
    twochecked: "Two checked bags included",
  },
  tags: {
    recommended: "Recommended",
    family: "Good for families",
    adultsonly: "Adults only",
    luxury: "Luxury",
    earlybooking: "Early booking",
    lastplaces: "Only a few left",
    bestseller: "Bestseller",
    guaranteed: "Guaranteed departure",
    smallgroup: "Small group",
    tourmanager: "Tour manager throughout",
    exotic: "Long haul",
    romantic: "Romantic",
    business: "Good for business",
    eco: "Eco certified",
    limitedoffer: "Limited offer",
    shortbreak: "Short and sweet",
    rareitinerary: "Rare itinerary",
    repositioning: "Repositioning",
    travellerfavourite: "Traveller favourite",
  },

  eyebrows: {
    departing: "Departing {date}",
    departingFrom: "Departing {date} from {place}",
  },

  inclusions: {
    travelBy: "Travel by {mode}",
    airportTransfer: "Airport transfer included",
    airportTaxes: "Airport taxes included",
    cancellationCover: "Optional cancellation cover",
    bedAndBreakfast: "Accommodation with breakfast",
    tourManager: "Tour manager throughout",
    visits: "Visits included: {places}",
    chosenCabin: "The cabin grade you choose",
    fullBoardOnBoard: "Full board on board",
    entertainment: "Entertainment and facilities included",
    portTaxes: "Port taxes included",
    petsWelcome: "Pets welcome",
    noPets: "No pets",
    parking: "Parking",
    roundTrip: "Return",
    oneWay: "One way",
  },
  footnotes: {
    packageTotal: "total for 2 adults, travel included",
    perNight: "per night, taxes included",
    perPersonDouble: "per person, two sharing",
    cruiseFare: "per person, two sharing, port taxes included",
    perPerson: "per person",
    flightRoundTrip: "total return fare, taxes included",
    flightOneWay: "total one-way fare, taxes included",
  },

  bands: {
    under: "Under {value}",
    over: "Over {value}",
    upTo: "Up to {value}",
  },

  plurals: {
    nights: { one: "{count} night", other: "{count} nights" },
    days: { one: "{count} day", other: "{count} days" },
    hours: { one: "{count} hour", other: "{count} hours" },
    minutes: { one: "{count} minute", other: "{count} minutes" },
    months: { one: "{count} month", other: "{count} months" },
    years: { one: "{count} year", other: "{count} years" },
    travellers: { one: "{count} traveller", other: "{count} travellers" },
    guests: { one: "{count} guest", other: "{count} guests" },
    rooms: { one: "{count} room", other: "{count} rooms" },
    reviews: { one: "{count} review", other: "{count} reviews" },
    stops: { one: "{count} stop", other: "{count} stops" },
    ports: { one: "{count} port", other: "{count} ports" },
    sights: { one: "{count} sight", other: "{count} sights" },
    stars: { one: "{count} star", other: "{count} stars" },
    seatsLeft: {
      one: "Only {count} seat left",
      other: "Only {count} seats left",
    },
    moreDates: { one: "+ {count} more date", other: "+ {count} more dates" },
  },
}

export const RO: Copy = {
  verticalTabs: "Tipuri de călătorie",
  verticals: {
    packages: {
      name: "Sejur",
      submit: "Caută sejururi",
      results: {
        one: "Am găsit {count} ofertă",
        few: "Am găsit {count} oferte",
        other: "Am găsit {count} de oferte",
      },
    },
    tours: {
      name: "Circuite",
      submit: "Caută circuite",
      results: {
        one: "Am găsit {count} circuit",
        few: "Am găsit {count} circuite",
        other: "Am găsit {count} de circuite",
      },
    },
    stays: {
      name: "Cazare",
      submit: "Caută cazare",
      results: {
        one: "Am găsit {count} proprietate",
        few: "Am găsit {count} proprietăți",
        other: "Am găsit {count} de proprietăți",
      },
    },
    activities: {
      name: "Experiențe",
      submit: "Caută experiențe",
      results: {
        one: "Am găsit {count} experiență",
        few: "Am găsit {count} experiențe",
        other: "Am găsit {count} de experiențe",
      },
    },
    cruises: {
      name: "Croaziere",
      submit: "Caută croaziere",
      results: {
        one: "Am găsit {count} croazieră",
        few: "Am găsit {count} croaziere",
        other: "Am găsit {count} de croaziere",
      },
    },
    flights: {
      name: "Zboruri",
      submit: "Caută zboruri",
      results: {
        one: "Am găsit {count} zbor",
        few: "Am găsit {count} zboruri",
        other: "Am găsit {count} de zboruri",
      },
    },
  },

  pricesFrom: "Prețuri pornind de la {price}",
  from: "de la {price}",
  unavailable: "indisponibil",
  searchChanged: "Ai schimbat căutarea — apasă {action}.",
  filters: "Filtre",
  clearFilters: "Resetare filtre",
  activeFilters: "Filtre active:",
  nothingMatches:
    "Nimic nu se potrivește cu filtrele alese. Scoate un filtru, sau scrie-ne și îți căutăm noi.",
  showing: "Afișăm {first}–{last} din {total}",
  previousPage: "Înapoi",
  nextPage: "Înainte",
  pageNumber: "Pagina {number}",

  facetSearch: "Caută",
  showMore: "Vezi mai multe ({count})",
  showFewer: "Arată mai puține",
  facets: {
    departureCity: "Oraș plecare",
    price: "Preț",
    transport: "Transport",
    board: "Masa",
    classification: "Clasificare",
    rating: "Evaluări",
    stops: "Escale",
    airlines: "Linii aeriene",
    amenities: "Facilități",
    tags: "Etichete",
    transfer: "Transfer",
    cancellation: "Anulare",
    property: "Hotel",
    propertyType: "Tip cazare",
    month: "Luna",
    duration: "Durata",
    country: "Țări",
    destination: "Destinații",
    cruiseLine: "Linii de croazieră",
    departurePort: "Port de plecare",
    ship: "Vase",
    category: "Categorii",
    timeOfDay: "Momentul zilei",
    language: "Limba",
    features: "Facilități",
  },

  basis: {
    per_night: "/ noapte",
    per_stay: "/ sejur",
    per_person: "/ persoană",
    per_party: "total",
  },
  viewOffer: "Vezi oferta",
  classification: "Clasificare {count}",
  outOfFive: "{score} din 5",

  sorts: {
    recommended: "Recomandate",
    best: "Cele mai bune",
    cheapest: "Preț crescător",
    priciest: "Preț descrescător",
    topRated: "Evaluare",
    classification: "Clasificare",
    departureDate: "Data plecării",
    departureTime: "Ora plecării",
    duration: "Durata",
  },

  fields: {
    departureCity: "Oraș plecare",
    destination: "Destinație",
    departureDate: "Data plecării",
    departureMonth: "Luna plecării",
    duration: "Durata",
    transport: "Transport",
    roomsAndTravellers: "Camere și turiști",
    roomsAndGuests: "Camere și oaspeți",
    checkInOut: "Check-in și check-out",
    pets: "Călătoresc cu animal de companie",
    where: "Unde",
    when: "Când",
    participants: "Participanți",
    search: "Caută",
    cruiseLine: "Linie de croazieră",
    departurePort: "Port de plecare",
    passengers: "Pasageri",
    tripType: "Tip călătorie",
    from: "De la",
    to: "Către",
    outbound: "Plecare",
    inbound: "Întoarcere",
    cabin: "Clasă",
    directOnly: "Doar zboruri directe",
  },
  placeholders: {
    anywhere: "Oriunde",
    whereFrom: "De unde?",
    whereTo: "Unde mergi?",
    where: "Unde?",
    whatToDo: "Ce faci acolo?",
    countryOrRoute: "Țară sau traseu",
    city: "Oraș",
    pickDate: "Alege data",
    pickDates: "Alege perioada",
  },
  hints: {
    flexibleDays: "± 3 zile",
    maxNights: "Maximum 14 nopți",
    childAges: "Vârsta copiilor la check-in",
    anytimeIfFlexible: "Lasă gol dacă nu ai o dată fixă",
    doubleOccupancy: "Tarifele sunt pe baza ocupării duble",
  },
  prompts: {
    groupQuote: "Solicită ofertă pentru grup",
    tailoredQuote: "Solicită ofertă personalizată",
    largerGroups: "Pentru grupuri mai mari, scrie-ne.",
  },
  choices: {
    any: "Oricare",
    anyRegion: "Toate regiunile",
    anyDuration: "Orice durată",
    anyLength: "Oricâte nopți",
    anytime: "Oricând",
    roundTrip: "Dus-întors",
    oneWay: "Doar dus",
  },

  noSuchDestination:
    "Nu vindem încă această destinație. Scrie-ne și o căutăm pentru tine.",
  clearSelection: "Șterge selecția",
  yes: "Da",
  no: "Nu",
  adults: "Adulți",
  children: "Copii",
  adultsNote: "12 ani și peste",
  childrenNote: "2–11 ani",
  childAgesNote: "0–17 ani",
  childAge: "Vârsta copilului {number}",
  room: "Camera {number}",
  removeRoom: "Șterge",
  addRoom: "Adaugă cameră",
  oneFewer: "{label}: unul mai puțin",
  oneMore: "{label}: unul în plus",
  notes: {
    country: "țară",
    countryOrRegion: "țară / regiune",
  },

  board: {
    ro: "Fără masă",
    bb: "Mic dejun",
    hb: "Demipensiune",
    fb: "Pensiune completă",
    ai: "All inclusive",
    uai: "Ultra all inclusive",
  },
  cancellation: {
    free: "Anulare gratuită",
    fee: "Anulare cu taxă",
    nonrefundable: "Nerambursabil",
  },
  transfer: {
    included: "Transfer inclus",
    optional: "Transfer opțional",
    none: "Fără transfer",
  },
  transport: {
    plane: "Avion",
    coach: "Autocar",
    own: "Mijloace proprii",
  },
  stops: {
    direct: "Direct",
    directFlight: "Zbor direct",
    one: "O escală",
    twoPlus: "Două sau mai multe escale",
  },
  ratings: {
    exceptional: "Excepțional",
    veryGood: "Foarte bine",
    good: "Bine",
    pleasant: "Plăcut",
  },
  cabins: {
    economy: "Economy",
    premium: "Premium Economy",
    business: "Business",
  },
  amenities: {
    pool: "Piscină",
    beach: "Plajă privată",
    spa: "Spa & wellness",
    aquapark: "Aqua park",
    kidsclub: "Animație pentru copii",
    gym: "Sală de fitness",
    alacarte: "Restaurant à la carte",
    wifi: "Wi-Fi gratuit",
    parking: "Parcare",
    airconditioning: "Aer condiționat",
  },
  propertyTypes: {
    hotel: "Hotel",
    aparthotel: "Aparthotel",
    apartment: "Apartament",
    villa: "Vilă",
    guesthouse: "Pensiune",
    hostel: "Hostel",
  },
  categories: {
    tours: "Tururi ghidate",
    museums: "Muzee & atracții",
    food: "Gastronomie & vin",
    adventure: "Aventură",
    water: "Activități pe apă",
    nature: "Natură & drumeții",
    shows: "Spectacole & evenimente",
    wellness: "Wellness",
  },
  times: {
    morning: "Dimineața",
    afternoon: "După-amiaza",
    evening: "Seara",
  },
  languages: {
    ro: "Română",
    en: "Engleză",
    fr: "Franceză",
    es: "Spaniolă",
    it: "Italiană",
    de: "Germană",
  },
  features: {
    freecancellation: "Anulare gratuită",
    instant: "Confirmare instantanee",
    mobileticket: "Bilet mobil",
    skiptheline: "Evită coada",
    liveguide: "Ghid live",
    smallgroup: "Grup mic",
    transferincluded: "Transfer inclus",
    accessible: "Accesibil cu scaun rulant",
  },
  baggage: {
    underseat: "Doar bagaj mic de cabină",
    cabin: "Bagaj de mână inclus",
    checked23: "Bagaj de cală 23 kg inclus",
    checked30: "Bagaj de cală 30 kg inclus",
    twochecked: "Două bagaje de cală incluse",
  },
  tags: {
    recommended: "Recomandat",
    family: "Potrivit familiilor",
    adultsonly: "Adults only",
    luxury: "Lux",
    earlybooking: "Early booking",
    lastplaces: "Ultimele locuri",
    bestseller: "Bestseller",
    guaranteed: "Plecări garantate",
    smallgroup: "Grup mic",
    tourmanager: "Ghid însoțitor",
    exotic: "Exotic",
    romantic: "Romantic",
    business: "Business",
    eco: "Certificat eco",
    limitedoffer: "Ofertă limitată",
    shortbreak: "Scurt și dulce",
    rareitinerary: "Itinerar rar",
    repositioning: "Repoziționare",
    travellerfavourite: "Preferat de călători",
  },

  eyebrows: {
    departing: "Plecare {date}",
    departingFrom: "Plecare {date} din {place}",
  },

  inclusions: {
    travelBy: "Transport {mode}",
    airportTransfer: "Transfer aeroport inclus",
    airportTaxes: "Taxe de aeroport incluse",
    cancellationCover: "Asigurare storno opțională",
    bedAndBreakfast: "Cazare cu mic dejun",
    tourManager: "Ghid însoțitor",
    visits: "Vizite incluse: {places}",
    chosenCabin: "Cazare în cabina aleasă",
    fullBoardOnBoard: "Pensiune completă la bord",
    entertainment: "Spectacole și facilități incluse",
    portTaxes: "Taxe portuare incluse",
    petsWelcome: "Animale de companie acceptate",
    noPets: "Fără animale de companie",
    parking: "Parcare",
    roundTrip: "Dus-întors",
    oneWay: "Doar dus",
  },
  footnotes: {
    packageTotal: "preț total pentru 2 adulți, transport inclus",
    perNight: "pe noapte, taxe incluse",
    perPersonDouble: "de persoană, în cameră dublă",
    cruiseFare: "de persoană, pe baza ocupării duble, taxe portuare incluse",
    perPerson: "de persoană",
    flightRoundTrip: "preț total dus-întors, taxe incluse",
    flightOneWay: "preț total pentru un segment, taxe incluse",
  },

  bands: {
    under: "Sub {value}",
    over: "Peste {value}",
    upTo: "Până în {value}",
  },

  plurals: {
    nights: {
      one: "{count} noapte",
      few: "{count} nopți",
      other: "{count} de nopți",
    },
    days: { one: "{count} zi", few: "{count} zile", other: "{count} de zile" },
    hours: { one: "{count} oră", few: "{count} ore", other: "{count} de ore" },
    minutes: {
      one: "{count} minut",
      few: "{count} minute",
      other: "{count} de minute",
    },
    months: {
      one: "{count} lună",
      few: "{count} luni",
      other: "{count} de luni",
    },
    years: { one: "{count} an", few: "{count} ani", other: "{count} de ani" },
    travellers: {
      one: "{count} călător",
      few: "{count} călători",
      other: "{count} de călători",
    },
    guests: {
      one: "{count} oaspete",
      few: "{count} oaspeți",
      other: "{count} de oaspeți",
    },
    rooms: {
      one: "{count} cameră",
      few: "{count} camere",
      other: "{count} de camere",
    },
    reviews: {
      one: "{count} evaluare",
      few: "{count} evaluări",
      other: "{count} de evaluări",
    },
    stops: {
      one: "{count} escală",
      few: "{count} escale",
      other: "{count} de escale",
    },
    ports: {
      one: "{count} escală",
      few: "{count} escale",
      other: "{count} de escale",
    },
    sights: {
      one: "{count} obiectiv",
      few: "{count} obiective",
      other: "{count} de obiective",
    },
    stars: {
      one: "{count} stea",
      few: "{count} stele",
      other: "{count} de stele",
    },
    seatsLeft: {
      one: "Ultimul loc",
      few: "Ultimele {count} locuri",
      other: "Ultimele {count} de locuri",
    },
    moreDates: {
      one: "+ încă o dată",
      few: "+ alte {count} date",
      other: "+ alte {count} de date",
    },
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
  return DICTIONARIES[language(locale)] ?? EN
}

/** The languages this search has been translated into. */
export const TRANSLATED_LANGUAGES = Object.keys(DICTIONARIES)

/** Substitutes `{name}`-style placeholders. Unknown names are left alone. */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replaceAll(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}

/**
 * The CLDR plural category for a count, in the reader's language.
 *
 * Wrapped because an invalid locale tag throws, and a filter rail is not worth
 * losing over a language code the runtime has never heard of.
 */
function category(locale: string | undefined, count: number): Intl.LDMLPluralRule {
  try {
    return new Intl.PluralRules(locale || "en").select(count)
  } catch {
    return new Intl.PluralRules("en").select(count)
  }
}

/**
 * A counted phrase in the reader's language.
 *
 * `display` exists for the counts that are not written the way they are
 * measured: three and a half hours reads as "3.5", a band reads as "10–14".
 * The category is still selected from the number, so Romanian's *de* lands on
 * the right side of nineteen either way.
 */
export function counted(
  locale: string | undefined,
  forms: PluralForms,
  count: number,
  display?: string,
): string {
  const form = forms[category(locale, count)] ?? forms.other
  return fill(form, { count: display ?? String(count) })
}

/**
 * A band, written as the counted phrase it bands.
 *
 * "10–14" takes its plural category from the top of the range, which is the
 * only end that can be wrong: Romanian says *10-14 nopți* and *20-30 de nopți*,
 * and reading the category off the floor would get the second one wrong.
 */
export function countedRange(
  locale: string | undefined,
  forms: PluralForms,
  min: number,
  max: number,
): string {
  return counted(locale, forms, max, `${min}-${max}`)
}

/** A declared value's reader-facing name, whichever way it was declared. */
export function labelOf(entry: Labelled, copy: Copy, locale: string): string {
  return entry.label ? entry.label(copy, locale) : (entry.name ?? entry.value)
}

/** The same, looked up by value in a declared universe. */
export function labelFor(
  entries: Labelled[],
  value: string,
  copy: Copy,
  locale: string,
): string {
  const entry = entries.find((candidate) => candidate.value === value)
  return entry ? labelOf(entry, copy, locale) : value
}
