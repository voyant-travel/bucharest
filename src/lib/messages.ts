/**
 * The theme's own words.
 *
 * Everything an operator writes arrives translated: the platform resolves a
 * publication per locale, so headings, menus and body copy are already in the
 * reader's language by the time a component sees them. What is *not* covered
 * is the handful of strings the theme itself supplies — "Skip to content", a
 * navigation landmark's accessible name, the label on a subscribe field. Those
 * are shipped with the theme, so the theme has to translate them.
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

export type Messages = {
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

/** The languages this theme's own labels have been translated into. */
export const TRANSLATED_LANGUAGES = Object.keys(DICTIONARIES)
