/**
 * The theme's own words.
 *
 * Everything an operator writes arrives translated: the platform resolves a
 * publication per locale, so headings, menus and body copy are already in the
 * reader's language by the time a component sees them. What is *not* covered
 * is the handful of strings the theme itself supplies — "Skip to content", a
 * navigation landmark's accessible name, the label on a subscribe field, the
 * section headings on a product page. Those are shipped with the theme, so the
 * theme has to translate them.
 *
 * Same shape and same language set as `messagesFor` in `shopping.mjs`, which
 * already solved this for the shopping surfaces. A second convention would be
 * a second place to forget a string.
 *
 * A locale with no dictionary falls back to English rather than rendering a
 * key: an operator publishing in a language this theme has never been
 * translated into should get a working site with a few English labels, not a
 * page reading `nav.primary`.
 */

/**
 * Counted phrases, keyed by CLDR plural category.
 *
 * "1 days" is the kind of detail that tells a reader nobody looked at the page,
 * and naive `n === 1` pluralization only ever fixes English. Romanian alone
 * needs three forms — *o zi*, *două zile*, *20 de zile* — so the count is
 * resolved through `Intl.PluralRules` against forms the dictionary supplies,
 * and each language declares exactly the categories it uses.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string
}

export type CountedPhrase =
  | "days"
  | "nights"
  | "guests"
  | "places"
  | "results"
  | "ships"
  | "sailings"
  | "cabins"

/**
 * The managed booking journey's labels.
 *
 * Grouped rather than flattened into the top level: they belong to one panel,
 * they are only read by that panel, and a translator working through a new
 * language benefits from seeing them as the single conversation they are.
 */
export type BookingMessages = {
  eyebrowLive: string
  eyebrowItinerary: string
  headingLive: string
  headingItinerary: string
  intro: string
  departureReference: string
  departureHint: string
  adults: string
  firstName: string
  lastName: string
  email: string
  steps: string
  start: string
  update: string
  getQuote: string
  holdPlace: string
  continueToCheckout: string
  checkStatus: string
  paymentQuestion: string
  card: string
  bankTransfer: string
  inquiry: string
  renew: string
  abandon: string
  stateSession: string
  stateKind: string
  stateRevision: string
  stateQuote: string
  stateHold: string
  notStarted: string
  waiting: string
  checkoutReady: string
  openCheckout: string
  prepareCheckout: string
  inProgress: string
  rejected: string
  nothingChanged: string
  departureSelected: string
  itineraryCreated: string
}

export type Messages = {
  // Chrome
  skipToContent: string
  primaryNav: string
  footerNav: string
  menu: string
  closeMenu: string
  submenu: string
  emailAddress: string
  subscribe: string
  gallery: string
  close: string
  previousPhoto: string
  nextPhoto: string
  showAll: string
  readMore: string
  breadcrumb: string
  onThisPage: string

  // Journeys listing
  journeys: string
  allJourneys: string
  featuredJourneys: string
  findAJourney: string
  destinationOrExperience: string
  search: string
  searching: string
  noMatches: string
  searchUnavailable: string
  untitledJourney: string
  noJourneysPublished: string

  // Journey detail
  overview: string
  itinerary: string
  included: string
  whereYouGo: string
  questions: string
  where: string
  length: string
  format: string
  capacity: string
  dayNumber: string

  // Live selling
  liveSelling: string
  datesAndPrice: string
  liveNotStored: string
  checkDates: string
  previewPrice: string
  checkingLive: string
  liveUpdated: string
  noBookableDates: string
  dateToBeConfirmed: string
  choose: string
  priceNeedsDate: string
  liveUnavailable: string
  requestFailed: string

  // Cruises
  cruises: string
  cruise: string
  ship: string
  sailing: string
  ships: string
  publishedSailings: string
  cabinCategories: string
  cabinDetailsSoon: string
  atSea: string
  backToCruises: string
  browseCruises: string
  findLiveSailing: string
  launched: string
  decks: string
  dates: string
  embark: string
  disembark: string
  noCruisesPublished: string
  cruiseLiveNote: string

  // Generic pages
  nothingPublished: string
  backTo: string
  pageNotFound: string

  booking: BookingMessages
  plurals: Record<CountedPhrase, PluralForms>
}

const DICTIONARIES: Record<string, Messages> = {
  en: {
    skipToContent: "Skip to content",
    primaryNav: "Primary",
    footerNav: "Footer",
    menu: "Menu",
    closeMenu: "Close menu",
    submenu: "submenu",
    emailAddress: "Email address",
    subscribe: "Subscribe",
    gallery: "Gallery",
    close: "Close",
    previousPhoto: "Previous photograph",
    nextPhoto: "Next photograph",
    showAll: "All",
    readMore: "Read more",
    breadcrumb: "Breadcrumb",
    onThisPage: "On this page",

    journeys: "Journeys",
    allJourneys: "All journeys",
    featuredJourneys: "Featured journeys",
    findAJourney: "Find a journey",
    destinationOrExperience: "Destination or experience",
    search: "Search",
    searching: "Searching…",
    noMatches: "No matching journeys.",
    searchUnavailable: "Search is unavailable.",
    untitledJourney: "Untitled journey",
    noJourneysPublished: "No journeys are published yet.",

    overview: "Overview",
    itinerary: "Itinerary",
    included: "What's included",
    whereYouGo: "Where you go",
    questions: "Questions",
    where: "Where",
    length: "Length",
    format: "Format",
    capacity: "Capacity",
    dayNumber: "Day {count}",

    liveSelling: "Live selling",
    datesAndPrice: "Dates and price",
    liveNotStored: "Checked live, never stored in this page.",
    checkDates: "Check dates",
    previewPrice: "Preview price",
    checkingLive: "Checking live inventory…",
    liveUpdated: "Live information updated.",
    noBookableDates: "No bookable dates are currently available.",
    dateToBeConfirmed: "Date to be confirmed",
    choose: "Choose",
    priceNeedsDate: "Choose a date and party to receive a price.",
    liveUnavailable: "Live selling is temporarily unavailable.",
    requestFailed: "Request failed ({status})",

    cruises: "Cruises",
    cruise: "Cruise",
    ship: "Ship",
    sailing: "Sailing",
    ships: "Ships",
    publishedSailings: "Published sailings",
    cabinCategories: "Cabin categories",
    cabinDetailsSoon: "Cabin details are coming soon.",
    atSea: "At sea",
    backToCruises: "Back to cruises",
    browseCruises: "Browse cruises",
    findLiveSailing: "Find a live sailing",
    launched: "Launched",
    decks: "Decks",
    dates: "Dates",
    embark: "Embark",
    disembark: "Disembark",
    noCruisesPublished:
      "No cruise stories are published yet. Use the live search below for current sailings.",
    cruiseLiveNote:
      "Current availability and presentation-currency pricing are resolved in live cruise search and can be added to one managed itinerary without copying supplier state into this page.",

    nothingPublished: "Nothing published here yet.",
    backTo: "Back to {name}",
    pageNotFound: "Page not found",

    booking: {
      eyebrowLive: "Secure live booking",
      eyebrowItinerary: "Secure itinerary booking",
      headingLive: "Build your booking",
      headingItinerary: "Book everything together",
      intro: "Dates, prices, holds, and checkout are resolved live. They are not stored in this published page.",
      departureReference: "Departure reference",
      departureHint: "Choose a live date above or enter its reference.",
      adults: "Adults",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      steps: "Booking steps",
      start: "Start booking",
      update: "Update details",
      getQuote: "Get binding quote",
      holdPlace: "Hold one place",
      continueToCheckout: "Continue to checkout",
      checkStatus: "Check booking status",
      paymentQuestion: "How would you like to continue?",
      card: "Card",
      bankTransfer: "Bank transfer",
      inquiry: "Send an inquiry",
      renew: "Keep session active",
      abandon: "Abandon booking",
      stateSession: "Session",
      stateKind: "State",
      stateRevision: "Revision",
      stateQuote: "Quote",
      stateHold: "Hold",
      notStarted: "Not started",
      waiting: "Waiting",
      checkoutReady: "Your secure checkout is ready.",
      openCheckout: "Open secure checkout",
      prepareCheckout: "Prepare checkout handoff",
      inProgress: "{action} in progress…",
      rejected: "{reason}. The live session was not advanced.",
      nothingChanged: "Nothing was changed. Retry this action when ready.",
      departureSelected: "Departure selected. Add traveller details to start.",
      itineraryCreated: "Itinerary session created. Review traveller details, then get a binding quote.",
    },

    plurals: {
      days: { one: "{count} day", other: "{count} days" },
      nights: { one: "{count} night", other: "{count} nights" },
      guests: { one: "Up to {count} guest", other: "Up to {count} guests" },
      places: { one: "{count} place", other: "{count} places" },
      results: { one: "{count} journey found", other: "{count} journeys found" },
      ships: { one: "{count} ship", other: "{count} ships" },
      sailings: {
        one: "{count} published sailing",
        other: "{count} published sailings",
      },
      cabins: {
        one: "{count} cabin category",
        other: "{count} cabin categories",
      },
    },
  },

  ro: {
    skipToContent: "Sari la conținut",
    primaryNav: "Principal",
    footerNav: "Subsol",
    menu: "Meniu",
    closeMenu: "Închide meniul",
    submenu: "submeniu",
    emailAddress: "Adresă de email",
    subscribe: "Abonează-te",
    gallery: "Galerie",
    close: "Închide",
    previousPhoto: "Fotografia anterioară",
    nextPhoto: "Fotografia următoare",
    showAll: "Toate",
    readMore: "Află mai multe",
    breadcrumb: "Traseu",
    onThisPage: "Pe această pagină",

    journeys: "Călătorii",
    allJourneys: "Toate călătoriile",
    featuredJourneys: "Călătorii recomandate",
    findAJourney: "Caută o călătorie",
    destinationOrExperience: "Destinație sau experiență",
    search: "Caută",
    searching: "Se caută…",
    noMatches: "Nicio călătorie găsită.",
    searchUnavailable: "Căutarea nu este disponibilă.",
    untitledJourney: "Călătorie fără titlu",
    noJourneysPublished: "Nu este publicată încă nicio călătorie.",

    overview: "Prezentare",
    itinerary: "Itinerariu",
    included: "Ce este inclus",
    whereYouGo: "Unde ajungi",
    questions: "Întrebări",
    where: "Unde",
    length: "Durată",
    format: "Format",
    capacity: "Capacitate",
    dayNumber: "Ziua {count}",

    liveSelling: "Vânzare live",
    datesAndPrice: "Date și preț",
    liveNotStored: "Verificate live, niciodată stocate în această pagină.",
    checkDates: "Vezi datele",
    previewPrice: "Estimează prețul",
    checkingLive: "Se verifică disponibilitatea live…",
    liveUpdated: "Informațiile live au fost actualizate.",
    noBookableDates: "Momentan nu există date disponibile pentru rezervare.",
    dateToBeConfirmed: "Dată de confirmat",
    choose: "Alege",
    priceNeedsDate: "Alege o dată și numărul de persoane pentru a primi prețul.",
    liveUnavailable: "Vânzarea live este temporar indisponibilă.",
    requestFailed: "Cererea a eșuat ({status})",

    cruises: "Croaziere",
    cruise: "Croazieră",
    ship: "Navă",
    sailing: "Plecare",
    ships: "Nave",
    publishedSailings: "Plecări publicate",
    cabinCategories: "Categorii de cabine",
    cabinDetailsSoon: "Detaliile cabinelor vor fi disponibile în curând.",
    atSea: "Pe mare",
    backToCruises: "Înapoi la croaziere",
    browseCruises: "Vezi croazierele",
    findLiveSailing: "Caută o plecare disponibilă",
    launched: "Lansată",
    decks: "Punți",
    dates: "Date",
    embark: "Îmbarcare",
    disembark: "Debarcare",
    noCruisesPublished:
      "Nu este publicată încă nicio croazieră. Folosește căutarea live de mai jos pentru plecările curente.",
    cruiseLiveNote:
      "Disponibilitatea curentă și prețurile în moneda de afișare sunt rezolvate în căutarea live de croaziere și pot fi adăugate într-un itinerariu gestionat, fără a copia starea furnizorului în această pagină.",

    nothingPublished: "Nimic publicat aici încă.",
    backTo: "Înapoi la {name}",
    pageNotFound: "Pagina nu a fost găsită",

    booking: {
      eyebrowLive: "Rezervare live securizată",
      eyebrowItinerary: "Rezervare de itinerariu securizată",
      headingLive: "Începe rezervarea",
      headingItinerary: "Rezervă totul împreună",
      intro: "Datele, prețurile, rezervările temporare și plata sunt rezolvate live. Nu sunt stocate în această pagină publicată.",
      departureReference: "Referința plecării",
      departureHint: "Alege o dată live de mai sus sau introdu referința ei.",
      adults: "Adulți",
      firstName: "Prenume",
      lastName: "Nume",
      email: "Email",
      steps: "Pașii rezervării",
      start: "Începe rezervarea",
      update: "Actualizează datele",
      getQuote: "Obține o ofertă fermă",
      holdPlace: "Rezervă un loc",
      continueToCheckout: "Continuă spre plată",
      checkStatus: "Verifică starea rezervării",
      paymentQuestion: "Cum dorești să continui?",
      card: "Card",
      bankTransfer: "Transfer bancar",
      inquiry: "Trimite o cerere",
      renew: "Menține sesiunea activă",
      abandon: "Renunță la rezervare",
      stateSession: "Sesiune",
      stateKind: "Stare",
      stateRevision: "Revizie",
      stateQuote: "Ofertă",
      stateHold: "Rezervare temporară",
      notStarted: "Neînceput",
      waiting: "În așteptare",
      checkoutReady: "Plata securizată este pregătită.",
      openCheckout: "Deschide plata securizată",
      prepareCheckout: "Pregătește predarea către plată",
      inProgress: "{action} în curs…",
      rejected: "{reason}. Sesiunea live nu a fost avansată.",
      nothingChanged: "Nu s-a modificat nimic. Reîncearcă această acțiune când ești pregătit.",
      departureSelected: "Plecare aleasă. Adaugă datele călătorului pentru a începe.",
      itineraryCreated: "Sesiunea de itinerariu a fost creată. Verifică datele călătorului, apoi cere o ofertă fermă.",
    },

    plurals: {
      days: { one: "{count} zi", few: "{count} zile", other: "{count} de zile" },
      nights: {
        one: "{count} noapte",
        few: "{count} nopți",
        other: "{count} de nopți",
      },
      guests: {
        one: "Până la {count} oaspete",
        few: "Până la {count} oaspeți",
        other: "Până la {count} de oaspeți",
      },
      places: {
        one: "{count} loc",
        few: "{count} locuri",
        other: "{count} de locuri",
      },
      results: {
        one: "{count} călătorie găsită",
        few: "{count} călătorii găsite",
        other: "{count} de călătorii găsite",
      },
      ships: {
        one: "{count} navă",
        few: "{count} nave",
        other: "{count} de nave",
      },
      sailings: {
        one: "{count} plecare publicată",
        few: "{count} plecări publicate",
        other: "{count} de plecări publicate",
      },
      cabins: {
        one: "{count} categorie de cabine",
        few: "{count} categorii de cabine",
        other: "{count} de categorii de cabine",
      },
    },
  },

  fr: {
    skipToContent: "Aller au contenu",
    primaryNav: "Principal",
    footerNav: "Pied de page",
    menu: "Menu",
    closeMenu: "Fermer le menu",
    submenu: "sous-menu",
    emailAddress: "Adresse e-mail",
    subscribe: "S'abonner",
    gallery: "Galerie",
    close: "Fermer",
    previousPhoto: "Photographie précédente",
    nextPhoto: "Photographie suivante",
    showAll: "Tous",
    readMore: "En savoir plus",
    breadcrumb: "Fil d'Ariane",
    onThisPage: "Sur cette page",

    journeys: "Voyages",
    allJourneys: "Tous les voyages",
    featuredJourneys: "Voyages à la une",
    findAJourney: "Trouver un voyage",
    destinationOrExperience: "Destination ou expérience",
    search: "Rechercher",
    searching: "Recherche…",
    noMatches: "Aucun voyage correspondant.",
    searchUnavailable: "La recherche est indisponible.",
    untitledJourney: "Voyage sans titre",
    noJourneysPublished: "Aucun voyage n'est encore publié.",

    overview: "Présentation",
    itinerary: "Itinéraire",
    included: "Ce qui est inclus",
    whereYouGo: "Où vous allez",
    questions: "Questions",
    where: "Où",
    length: "Durée",
    format: "Format",
    capacity: "Capacité",
    dayNumber: "Jour {count}",

    liveSelling: "Vente en direct",
    datesAndPrice: "Dates et tarifs",
    liveNotStored: "Vérifié en direct, jamais stocké dans cette page.",
    checkDates: "Voir les dates",
    previewPrice: "Estimer le tarif",
    checkingLive: "Vérification des disponibilités…",
    liveUpdated: "Informations en direct mises à jour.",
    noBookableDates: "Aucune date réservable n'est disponible actuellement.",
    dateToBeConfirmed: "Date à confirmer",
    choose: "Choisir",
    priceNeedsDate:
      "Choisissez une date et un nombre de voyageurs pour obtenir un tarif.",
    liveUnavailable: "La vente en direct est temporairement indisponible.",
    requestFailed: "Échec de la requête ({status})",

    cruises: "Croisières",
    cruise: "Croisière",
    ship: "Navire",
    sailing: "Départ",
    ships: "Navires",
    publishedSailings: "Départs publiés",
    cabinCategories: "Catégories de cabines",
    cabinDetailsSoon: "Les détails des cabines arrivent bientôt.",
    atSea: "En mer",
    backToCruises: "Retour aux croisières",
    browseCruises: "Voir les croisières",
    findLiveSailing: "Trouver un départ disponible",
    launched: "Lancé",
    decks: "Ponts",
    dates: "Dates",
    embark: "Embarquement",
    disembark: "Débarquement",
    noCruisesPublished:
      "Aucune croisière n'est encore publiée. Utilisez la recherche en direct ci-dessous pour les départs actuels.",
    cruiseLiveNote:
      "Les disponibilités actuelles et les tarifs dans la devise d'affichage sont résolus dans la recherche de croisières en direct et peuvent être ajoutés à un itinéraire géré, sans copier l'état du fournisseur dans cette page.",

    nothingPublished: "Rien de publié ici pour l'instant.",
    backTo: "Retour à {name}",
    pageNotFound: "Page introuvable",

    booking: {
      eyebrowLive: "Réservation en direct sécurisée",
      eyebrowItinerary: "Réservation d'itinéraire sécurisée",
      headingLive: "Composez votre réservation",
      headingItinerary: "Réservez le tout ensemble",
      intro: "Les dates, les tarifs, les options et le paiement sont résolus en direct. Ils ne sont pas stockés dans cette page publiée.",
      departureReference: "Référence du départ",
      departureHint: "Choisissez une date en direct ci-dessus ou saisissez sa référence.",
      adults: "Adultes",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      steps: "Étapes de réservation",
      start: "Commencer la réservation",
      update: "Mettre à jour",
      getQuote: "Obtenir un devis ferme",
      holdPlace: "Réserver une place",
      continueToCheckout: "Continuer vers le paiement",
      checkStatus: "Vérifier l'état de la réservation",
      paymentQuestion: "Comment souhaitez-vous continuer ?",
      card: "Carte",
      bankTransfer: "Virement bancaire",
      inquiry: "Envoyer une demande",
      renew: "Garder la session active",
      abandon: "Abandonner la réservation",
      stateSession: "Session",
      stateKind: "État",
      stateRevision: "Révision",
      stateQuote: "Devis",
      stateHold: "Option",
      notStarted: "Non commencée",
      waiting: "En attente",
      checkoutReady: "Votre paiement sécurisé est prêt.",
      openCheckout: "Ouvrir le paiement sécurisé",
      prepareCheckout: "Préparer le passage au paiement",
      inProgress: "{action} en cours…",
      rejected: "{reason}. La session en direct n'a pas été avancée.",
      nothingChanged: "Rien n'a été modifié. Réessayez cette action lorsque vous serez prêt.",
      departureSelected: "Départ sélectionné. Ajoutez les coordonnées du voyageur pour commencer.",
      itineraryCreated: "Session d'itinéraire créée. Vérifiez les coordonnées du voyageur, puis demandez un devis ferme.",
    },

    plurals: {
      days: { one: "{count} jour", other: "{count} jours" },
      nights: { one: "{count} nuit", other: "{count} nuits" },
      guests: {
        one: "Jusqu'à {count} voyageur",
        other: "Jusqu'à {count} voyageurs",
      },
      places: { one: "{count} place", other: "{count} places" },
      results: { one: "{count} voyage trouvé", other: "{count} voyages trouvés" },
      ships: { one: "{count} navire", other: "{count} navires" },
      sailings: {
        one: "{count} départ publié",
        other: "{count} départs publiés",
      },
      cabins: {
        one: "{count} catégorie de cabines",
        other: "{count} catégories de cabines",
      },
    },
  },

  de: {
    skipToContent: "Zum Inhalt springen",
    primaryNav: "Hauptnavigation",
    footerNav: "Fußzeile",
    menu: "Menü",
    closeMenu: "Menü schließen",
    submenu: "Untermenü",
    emailAddress: "E-Mail-Adresse",
    subscribe: "Abonnieren",
    gallery: "Galerie",
    close: "Schließen",
    previousPhoto: "Vorheriges Foto",
    nextPhoto: "Nächstes Foto",
    showAll: "Alle",
    readMore: "Mehr erfahren",
    breadcrumb: "Navigationspfad",
    onThisPage: "Auf dieser Seite",

    journeys: "Reisen",
    allJourneys: "Alle Reisen",
    featuredJourneys: "Ausgewählte Reisen",
    findAJourney: "Reise finden",
    destinationOrExperience: "Reiseziel oder Erlebnis",
    search: "Suchen",
    searching: "Wird gesucht…",
    noMatches: "Keine passenden Reisen.",
    searchUnavailable: "Die Suche ist nicht verfügbar.",
    untitledJourney: "Reise ohne Titel",
    noJourneysPublished: "Es sind noch keine Reisen veröffentlicht.",

    overview: "Überblick",
    itinerary: "Reiseverlauf",
    included: "Enthaltene Leistungen",
    whereYouGo: "Wohin es geht",
    questions: "Fragen",
    where: "Wohin",
    length: "Dauer",
    format: "Format",
    capacity: "Kapazität",
    dayNumber: "Tag {count}",

    liveSelling: "Live-Verkauf",
    datesAndPrice: "Termine und Preis",
    liveNotStored: "Live geprüft, nie in dieser Seite gespeichert.",
    checkDates: "Termine prüfen",
    previewPrice: "Preis schätzen",
    checkingLive: "Live-Verfügbarkeit wird geprüft…",
    liveUpdated: "Live-Informationen aktualisiert.",
    noBookableDates: "Derzeit sind keine buchbaren Termine verfügbar.",
    dateToBeConfirmed: "Termin wird bestätigt",
    choose: "Auswählen",
    priceNeedsDate:
      "Wählen Sie einen Termin und die Personenzahl, um einen Preis zu erhalten.",
    liveUnavailable: "Der Live-Verkauf ist vorübergehend nicht verfügbar.",
    requestFailed: "Anfrage fehlgeschlagen ({status})",

    cruises: "Kreuzfahrten",
    cruise: "Kreuzfahrt",
    ship: "Schiff",
    sailing: "Abfahrt",
    ships: "Schiffe",
    publishedSailings: "Veröffentlichte Abfahrten",
    cabinCategories: "Kabinenkategorien",
    cabinDetailsSoon: "Kabinendetails folgen in Kürze.",
    atSea: "Auf See",
    backToCruises: "Zurück zu den Kreuzfahrten",
    browseCruises: "Kreuzfahrten ansehen",
    findLiveSailing: "Verfügbare Abfahrt finden",
    launched: "In Dienst gestellt",
    decks: "Decks",
    dates: "Termine",
    embark: "Einschiffung",
    disembark: "Ausschiffung",
    noCruisesPublished:
      "Es sind noch keine Kreuzfahrten veröffentlicht. Nutzen Sie die Live-Suche unten für aktuelle Abfahrten.",
    cruiseLiveNote:
      "Aktuelle Verfügbarkeit und Preise in der Anzeigewährung werden in der Live-Kreuzfahrtsuche ermittelt und können einem verwalteten Reiseverlauf hinzugefügt werden, ohne den Zustand des Anbieters in diese Seite zu kopieren.",

    nothingPublished: "Hier ist noch nichts veröffentlicht.",
    backTo: "Zurück zu {name}",
    pageNotFound: "Seite nicht gefunden",

    booking: {
      eyebrowLive: "Sichere Live-Buchung",
      eyebrowItinerary: "Sichere Reiseverlauf-Buchung",
      headingLive: "Buchung zusammenstellen",
      headingItinerary: "Alles zusammen buchen",
      intro: "Termine, Preise, Optionen und Zahlung werden live ermittelt. Sie werden nicht in dieser veröffentlichten Seite gespeichert.",
      departureReference: "Abfahrtsreferenz",
      departureHint: "Wählen Sie oben einen Live-Termin oder geben Sie dessen Referenz ein.",
      adults: "Erwachsene",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail",
      steps: "Buchungsschritte",
      start: "Buchung starten",
      update: "Angaben aktualisieren",
      getQuote: "Verbindliches Angebot",
      holdPlace: "Einen Platz reservieren",
      continueToCheckout: "Weiter zur Zahlung",
      checkStatus: "Buchungsstatus prüfen",
      paymentQuestion: "Wie möchten Sie fortfahren?",
      card: "Karte",
      bankTransfer: "Banküberweisung",
      inquiry: "Anfrage senden",
      renew: "Sitzung aktiv halten",
      abandon: "Buchung abbrechen",
      stateSession: "Sitzung",
      stateKind: "Status",
      stateRevision: "Revision",
      stateQuote: "Angebot",
      stateHold: "Reservierung",
      notStarted: "Nicht begonnen",
      waiting: "Wartet",
      checkoutReady: "Ihre sichere Zahlung ist bereit.",
      openCheckout: "Sichere Zahlung öffnen",
      prepareCheckout: "Übergabe zur Zahlung vorbereiten",
      inProgress: "{action} läuft…",
      rejected: "{reason}. Die Live-Sitzung wurde nicht fortgeführt.",
      nothingChanged: "Es wurde nichts geändert. Wiederholen Sie diese Aktion, wenn Sie bereit sind.",
      departureSelected: "Abfahrt gewählt. Fügen Sie die Reisedaten hinzu, um zu beginnen.",
      itineraryCreated: "Reiseverlauf-Sitzung erstellt. Prüfen Sie die Reisedaten und fordern Sie dann ein verbindliches Angebot an.",
    },

    plurals: {
      days: { one: "{count} Tag", other: "{count} Tage" },
      nights: { one: "{count} Nacht", other: "{count} Nächte" },
      guests: { one: "Bis zu {count} Gast", other: "Bis zu {count} Gäste" },
      places: { one: "{count} Platz", other: "{count} Plätze" },
      results: {
        one: "{count} Reise gefunden",
        other: "{count} Reisen gefunden",
      },
      ships: { one: "{count} Schiff", other: "{count} Schiffe" },
      sailings: {
        one: "{count} veröffentlichte Abfahrt",
        other: "{count} veröffentlichte Abfahrten",
      },
      cabins: {
        one: "{count} Kabinenkategorie",
        other: "{count} Kabinenkategorien",
      },
    },
  },

  es: {
    skipToContent: "Saltar al contenido",
    primaryNav: "Principal",
    footerNav: "Pie de página",
    menu: "Menú",
    closeMenu: "Cerrar el menú",
    submenu: "submenú",
    emailAddress: "Dirección de correo electrónico",
    subscribe: "Suscribirse",
    gallery: "Galería",
    close: "Cerrar",
    previousPhoto: "Fotografía anterior",
    nextPhoto: "Fotografía siguiente",
    showAll: "Todos",
    readMore: "Saber más",
    breadcrumb: "Ruta de navegación",
    onThisPage: "En esta página",

    journeys: "Viajes",
    allJourneys: "Todos los viajes",
    featuredJourneys: "Viajes destacados",
    findAJourney: "Buscar un viaje",
    destinationOrExperience: "Destino o experiencia",
    search: "Buscar",
    searching: "Buscando…",
    noMatches: "Ningún viaje coincide.",
    searchUnavailable: "La búsqueda no está disponible.",
    untitledJourney: "Viaje sin título",
    noJourneysPublished: "Todavía no hay viajes publicados.",

    overview: "Descripción",
    itinerary: "Itinerario",
    included: "Qué incluye",
    whereYouGo: "Dónde vas",
    questions: "Preguntas",
    where: "Dónde",
    length: "Duración",
    format: "Formato",
    capacity: "Capacidad",
    dayNumber: "Día {count}",

    liveSelling: "Venta en directo",
    datesAndPrice: "Fechas y precio",
    liveNotStored: "Consultado en directo, nunca almacenado en esta página.",
    checkDates: "Ver fechas",
    previewPrice: "Estimar precio",
    checkingLive: "Consultando disponibilidad en directo…",
    liveUpdated: "Información en directo actualizada.",
    noBookableDates: "Actualmente no hay fechas reservables disponibles.",
    dateToBeConfirmed: "Fecha por confirmar",
    choose: "Elegir",
    priceNeedsDate: "Elige una fecha y el número de viajeros para ver el precio.",
    liveUnavailable: "La venta en directo no está disponible temporalmente.",
    requestFailed: "La solicitud ha fallado ({status})",

    cruises: "Cruceros",
    cruise: "Crucero",
    ship: "Barco",
    sailing: "Salida",
    ships: "Barcos",
    publishedSailings: "Salidas publicadas",
    cabinCategories: "Categorías de camarote",
    cabinDetailsSoon: "Los detalles de los camarotes llegarán pronto.",
    atSea: "En el mar",
    backToCruises: "Volver a los cruceros",
    browseCruises: "Ver cruceros",
    findLiveSailing: "Buscar una salida disponible",
    launched: "Botado",
    decks: "Cubiertas",
    dates: "Fechas",
    embark: "Embarque",
    disembark: "Desembarque",
    noCruisesPublished:
      "Todavía no hay cruceros publicados. Usa la búsqueda en directo de abajo para ver las salidas actuales.",
    cruiseLiveNote:
      "La disponibilidad actual y los precios en la moneda de presentación se resuelven en la búsqueda de cruceros en directo y pueden añadirse a un itinerario gestionado sin copiar el estado del proveedor en esta página.",

    nothingPublished: "Aquí todavía no hay nada publicado.",
    backTo: "Volver a {name}",
    pageNotFound: "Página no encontrada",

    booking: {
      eyebrowLive: "Reserva en directo segura",
      eyebrowItinerary: "Reserva de itinerario segura",
      headingLive: "Crea tu reserva",
      headingItinerary: "Reserva todo junto",
      intro: "Las fechas, los precios, las retenciones y el pago se resuelven en directo. No se almacenan en esta página publicada.",
      departureReference: "Referencia de la salida",
      departureHint: "Elige una fecha en directo arriba o introduce su referencia.",
      adults: "Adultos",
      firstName: "Nombre",
      lastName: "Apellidos",
      email: "Correo electrónico",
      steps: "Pasos de la reserva",
      start: "Iniciar la reserva",
      update: "Actualizar los datos",
      getQuote: "Obtener presupuesto en firme",
      holdPlace: "Retener una plaza",
      continueToCheckout: "Continuar al pago",
      checkStatus: "Comprobar el estado de la reserva",
      paymentQuestion: "¿Cómo quieres continuar?",
      card: "Tarjeta",
      bankTransfer: "Transferencia bancaria",
      inquiry: "Enviar una consulta",
      renew: "Mantener la sesión activa",
      abandon: "Abandonar la reserva",
      stateSession: "Sesión",
      stateKind: "Estado",
      stateRevision: "Revisión",
      stateQuote: "Presupuesto",
      stateHold: "Retención",
      notStarted: "Sin iniciar",
      waiting: "En espera",
      checkoutReady: "Tu pago seguro está listo.",
      openCheckout: "Abrir el pago seguro",
      prepareCheckout: "Preparar el paso al pago",
      inProgress: "{action} en curso…",
      rejected: "{reason}. La sesión en directo no avanzó.",
      nothingChanged: "No se cambió nada. Reintenta esta acción cuando estés listo.",
      departureSelected: "Salida seleccionada. Añade los datos del viajero para empezar.",
      itineraryCreated: "Sesión de itinerario creada. Revisa los datos del viajero y luego pide un presupuesto en firme.",
    },

    plurals: {
      days: { one: "{count} día", other: "{count} días" },
      nights: { one: "{count} noche", other: "{count} noches" },
      guests: { one: "Hasta {count} huésped", other: "Hasta {count} huéspedes" },
      places: { one: "{count} plaza", other: "{count} plazas" },
      results: {
        one: "{count} viaje encontrado",
        other: "{count} viajes encontrados",
      },
      ships: { one: "{count} barco", other: "{count} barcos" },
      sailings: {
        one: "{count} salida publicada",
        other: "{count} salidas publicadas",
      },
      cabins: {
        one: "{count} categoría de camarote",
        other: "{count} categorías de camarote",
      },
    },
  },

  it: {
    skipToContent: "Vai al contenuto",
    primaryNav: "Principale",
    footerNav: "Piè di pagina",
    menu: "Menu",
    closeMenu: "Chiudi il menu",
    submenu: "sottomenu",
    emailAddress: "Indirizzo email",
    subscribe: "Iscriviti",
    gallery: "Galleria",
    close: "Chiudi",
    previousPhoto: "Fotografia precedente",
    nextPhoto: "Fotografia successiva",
    showAll: "Tutti",
    readMore: "Scopri di più",
    breadcrumb: "Percorso di navigazione",
    onThisPage: "In questa pagina",

    journeys: "Viaggi",
    allJourneys: "Tutti i viaggi",
    featuredJourneys: "Viaggi in evidenza",
    findAJourney: "Cerca un viaggio",
    destinationOrExperience: "Destinazione o esperienza",
    search: "Cerca",
    searching: "Ricerca in corso…",
    noMatches: "Nessun viaggio corrispondente.",
    searchUnavailable: "La ricerca non è disponibile.",
    untitledJourney: "Viaggio senza titolo",
    noJourneysPublished: "Non è ancora pubblicato alcun viaggio.",

    overview: "Panoramica",
    itinerary: "Itinerario",
    included: "Cosa è incluso",
    whereYouGo: "Dove si va",
    questions: "Domande",
    where: "Dove",
    length: "Durata",
    format: "Formato",
    capacity: "Capacità",
    dayNumber: "Giorno {count}",

    liveSelling: "Vendita live",
    datesAndPrice: "Date e prezzo",
    liveNotStored: "Verificato live, mai memorizzato in questa pagina.",
    checkDates: "Vedi le date",
    previewPrice: "Stima il prezzo",
    checkingLive: "Verifica della disponibilità live…",
    liveUpdated: "Informazioni live aggiornate.",
    noBookableDates: "Al momento non ci sono date prenotabili.",
    dateToBeConfirmed: "Data da confermare",
    choose: "Scegli",
    priceNeedsDate: "Scegli una data e il numero di viaggiatori per avere un prezzo.",
    liveUnavailable: "La vendita live è temporaneamente non disponibile.",
    requestFailed: "Richiesta non riuscita ({status})",

    cruises: "Crociere",
    cruise: "Crociera",
    ship: "Nave",
    sailing: "Partenza",
    ships: "Navi",
    publishedSailings: "Partenze pubblicate",
    cabinCategories: "Categorie di cabine",
    cabinDetailsSoon: "I dettagli delle cabine arriveranno presto.",
    atSea: "In navigazione",
    backToCruises: "Torna alle crociere",
    browseCruises: "Vedi le crociere",
    findLiveSailing: "Trova una partenza disponibile",
    launched: "Varata",
    decks: "Ponti",
    dates: "Date",
    embark: "Imbarco",
    disembark: "Sbarco",
    noCruisesPublished:
      "Non è ancora pubblicata alcuna crociera. Usa la ricerca live qui sotto per le partenze attuali.",
    cruiseLiveNote:
      "La disponibilità attuale e i prezzi nella valuta di presentazione sono risolti nella ricerca live delle crociere e possono essere aggiunti a un itinerario gestito senza copiare lo stato del fornitore in questa pagina.",

    nothingPublished: "Qui non è ancora pubblicato nulla.",
    backTo: "Torna a {name}",
    pageNotFound: "Pagina non trovata",

    booking: {
      eyebrowLive: "Prenotazione live sicura",
      eyebrowItinerary: "Prenotazione itinerario sicura",
      headingLive: "Componi la tua prenotazione",
      headingItinerary: "Prenota tutto insieme",
      intro: "Date, prezzi, opzioni e pagamento sono risolti live. Non sono memorizzati in questa pagina pubblicata.",
      departureReference: "Riferimento della partenza",
      departureHint: "Scegli una data live qui sopra o inserisci il suo riferimento.",
      adults: "Adulti",
      firstName: "Nome",
      lastName: "Cognome",
      email: "Email",
      steps: "Passaggi della prenotazione",
      start: "Avvia la prenotazione",
      update: "Aggiorna i dati",
      getQuote: "Ottieni un preventivo vincolante",
      holdPlace: "Blocca un posto",
      continueToCheckout: "Continua al pagamento",
      checkStatus: "Verifica lo stato della prenotazione",
      paymentQuestion: "Come vuoi continuare?",
      card: "Carta",
      bankTransfer: "Bonifico bancario",
      inquiry: "Invia una richiesta",
      renew: "Mantieni la sessione attiva",
      abandon: "Abbandona la prenotazione",
      stateSession: "Sessione",
      stateKind: "Stato",
      stateRevision: "Revisione",
      stateQuote: "Preventivo",
      stateHold: "Opzione",
      notStarted: "Non avviata",
      waiting: "In attesa",
      checkoutReady: "Il tuo pagamento sicuro è pronto.",
      openCheckout: "Apri il pagamento sicuro",
      prepareCheckout: "Prepara il passaggio al pagamento",
      inProgress: "{action} in corso…",
      rejected: "{reason}. La sessione live non è stata avanzata.",
      nothingChanged: "Non è stato modificato nulla. Riprova questa azione quando sei pronto.",
      departureSelected: "Partenza selezionata. Aggiungi i dati del viaggiatore per iniziare.",
      itineraryCreated: "Sessione itinerario creata. Controlla i dati del viaggiatore, poi richiedi un preventivo vincolante.",
    },

    plurals: {
      days: { one: "{count} giorno", other: "{count} giorni" },
      nights: { one: "{count} notte", other: "{count} notti" },
      guests: { one: "Fino a {count} ospite", other: "Fino a {count} ospiti" },
      places: { one: "{count} posto", other: "{count} posti" },
      results: {
        one: "{count} viaggio trovato",
        other: "{count} viaggi trovati",
      },
      ships: { one: "{count} nave", other: "{count} navi" },
      sailings: {
        one: "{count} partenza pubblicata",
        other: "{count} partenze pubblicate",
      },
      cabins: {
        one: "{count} categoria di cabine",
        other: "{count} categorie di cabine",
      },
    },
  },
}

/**
 * The language subtag, lowercased.
 *
 * A publication may be `en-GB`, `ro-RO` or `de-AT`; the theme's own labels do
 * not differ by region, so they are keyed by language alone. Matches the
 * resolver `shopping.mjs` already uses.
 */
function language(locale: string | undefined): string {
  return typeof locale === "string" ? (locale.split("-")[0] ?? "en").toLowerCase() : "en"
}

export function messagesFor(locale: string | undefined): Messages {
  return DICTIONARIES[language(locale)] ?? DICTIONARIES.en!
}

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
 * A counted phrase in the reader's language.
 *
 * The category comes from `Intl.PluralRules`, so Romanian's *few* and the
 * two-form languages are handled by the same call. A language that declares no
 * form for the category the runtime picks falls back to `other`, which is the
 * one form every dictionary is required to carry.
 */
export function counted(
  locale: string | undefined,
  messages: Messages,
  phrase: CountedPhrase,
  count: number,
): string {
  const forms = messages.plurals[phrase]
  let category: Intl.LDMLPluralRule = "other"
  try {
    category = new Intl.PluralRules(locale || "en").select(count)
  } catch {
    category = new Intl.PluralRules("en").select(count)
  }
  return fill(forms[category] ?? forms.other, { count })
}

/** The languages this theme's own labels have been translated into. */
export const TRANSLATED_LANGUAGES = Object.keys(DICTIONARIES)
