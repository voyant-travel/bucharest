/**
 * The fixture navigation.
 *
 * Extracted from `theme.config.ts` for the same reason the sections were: it is
 * long, it merges badly, and it is the one part of the fixture that has to
 * exercise every branch of the menu model rather than just look plausible.
 *
 * It deliberately contains all three behaviours, because `behaviourOf()`
 * derives them from shape and a fixture that only ever produces links would
 * let the dropdown and the mega panel rot untested. So: two bare links (one of
 * them the commercially hottest item on the site, which is exactly the sort a
 * naive build buries in a menu), two dropdowns, and two mega panels — one with
 * a promo and cards, one without, so the layout is proved in both states.
 *
 * The counts on the destination links are not decoration. On a mass-market
 * operator "Greece · 11 destinations" is the signal that decides whether the
 * reader opens it, and modelling it as part of the label rather than as its own
 * field would mean it could never be generated from the catalogue.
 */
import type { NavItem } from "../lib/navigation"

const photo = (id: string, alt: string) => ({
  src: `https://images.unsplash.com/${id}?w=640&q=80&auto=format&fit=crop`,
  alt,
})

/**
 * `href` is required here even though the model leaves it optional.
 *
 * The model has to tolerate a published menu that omits it — a parser that
 * throws on unfamiliar data takes the whole page down — but the contract
 * requires every published item to name a destination, and a fixture is the
 * one place to hold that line rather than discover it at boot.
 */
export const navigation: (NavItem & {
  href: string
  /* The contract carries menu entries as open records, so this must be one. */
  [key: string]: unknown
})[] = [
  {
    label: "Holidays",
    href: "/tours",
    columns: [
      {
        heading: "The Mediterranean",
        headingHref: "/tours",
        links: [
          { label: "Greece", href: "/tours", meta: "11 destinations" },
          { label: "Türkiye", href: "/tours", meta: "5 destinations" },
          { label: "Cyprus", href: "/tours", meta: "4 destinations" },
          { label: "Spain", href: "/tours", meta: "7 destinations" },
          { label: "Italy", href: "/tours", meta: "6 destinations" },
          { label: "Croatia", href: "/tours", meta: "2 destinations" },
        ],
      },
      {
        heading: "Long haul",
        headingHref: "/tours",
        links: [
          { label: "Egypt", href: "/tours", meta: "6 destinations" },
          { label: "United Arab Emirates", href: "/tours", meta: "3 destinations" },
          { label: "Zanzibar", href: "/tours", meta: "2 destinations" },
          { label: "The Maldives", href: "/tours", meta: "4 destinations" },
          { label: "Thailand", href: "/tours", meta: "5 destinations" },
          { label: "Dominican Republic", href: "/tours", meta: "2 destinations" },
        ],
      },
      {
        heading: "Close to home",
        headingHref: "/tours",
        links: [
          { label: "Bulgaria", href: "/tours", meta: "11 destinations" },
          { label: "Romania", href: "/tours", meta: "18 destinations" },
          { label: "Montenegro", href: "/tours", meta: "3 destinations" },
          { label: "Albania", href: "/tours", meta: "1 destination" },
        ],
      },
    ],
    cards: [
      {
        title: "Antalya, all inclusive",
        href: "/tours",
        image: photo("photo-1445019980597-93fa8acb246c", "Loungers on a terrace above a hazy bay"),
        priceFrom: "from €690",
        duration: "7 nights",
        departsFrom: "Bucharest",
        badge: "Charter flight",
      },
      {
        title: "Crete, five-star hotels",
        href: "/tours",
        image: photo("photo-1533105079780-92b9be482077", "A whitewashed alley above the Aegean"),
        priceFrom: "from €845",
        duration: "7 nights",
        departsFrom: "Cluj-Napoca",
      },
    ],
    promo: {
      eyebrow: "Early Booking 2027",
      headline: "Up to 40% off when you book now",
      body: "The same hotels at last year's prices. Ends 31 March.",
      href: "/pages/enquiry",
      ctaLabel: "See the offers",
      image: photo("photo-1590523278191-995cbcda646b", "A hammock between palms at sunset"),
    },
    viewAll: { label: "All holidays", href: "/tours" },
  },
  {
    label: "Escorted tours",
    href: "/tours",
    columns: [
      {
        heading: "Europe",
        links: [
          { label: "Italy and Tuscany", href: "/tours" },
          { label: "Spain and Portugal", href: "/tours" },
          { label: "The Western Balkans", href: "/tours" },
          { label: "Scandinavia", href: "/tours" },
          { label: "Iceland", href: "/tours" },
        ],
      },
      {
        heading: "Asia",
        links: [
          { label: "Japan", href: "/tours" },
          { label: "Vietnam and Cambodia", href: "/tours" },
          { label: "Northern India", href: "/tours" },
          { label: "Uzbekistan", href: "/tours" },
        ],
      },
      {
        heading: "Africa and the Americas",
        links: [
          { label: "Kenya and Tanzania", href: "/tours" },
          { label: "Morocco", href: "/tours" },
          { label: "Peru and Bolivia", href: "/tours" },
          { label: "The United States", href: "/tours" },
        ],
      },
    ],
    viewAll: { label: "All escorted tours", href: "/tours" },
  },
  {
    label: "Cruises",
    href: "/cruises",
    columns: [
      {
        links: [
          { label: "MSC Cruises", href: "/cruises" },
          { label: "Costa Cruises", href: "/cruises" },
          { label: "Royal Caribbean", href: "/cruises" },
          { label: "Celebrity Cruises", href: "/cruises" },
          { label: "Azamara", href: "/cruises" },
        ],
      },
    ],
  },
  {
    /*
     * A bare link on purpose. Last-minute inventory is the most perishable
     * thing an operator sells, and putting a panel between the reader and it
     * costs a click at exactly the moment the click is worth most.
     */
    label: "Last Minute",
    href: "/tours",
    badge: "−40%",
  },
  { label: "Flights", href: "/tours" },
  {
    /*
     * A parent carries its own destination even when it opens a panel. The
     * contract requires it, and so does the reader: an item that can only be
     * opened is unreachable to anyone who wanted the page behind the label.
     */
    label: "About us",
    href: "/pages/about",
    columns: [
      {
        links: [
          { label: "Who we are", href: "/pages/about" },
          { label: "Our 86 branches", href: "/pages/branches" },
          { label: "Careers", href: "/pages/careers" },
          { label: "Contact", href: "/pages/contact" },
        ],
      },
    ],
  },
]
