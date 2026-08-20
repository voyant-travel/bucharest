import { defineTheme } from "@voyant-travel/theme"
import { navigation as fixtureNavigation } from "./src/theme/navigation"
import { sections as editorialSections } from "./src/theme/sections"
import { PUBLIC_API_PATHS } from "./src/lib/public-api-contracts"

/**
 * The chrome every page carries.
 *
 * Extracted so that a product page renders the same header, utility bar,
 * footer and legal identity as the home page. When only the home fixture
 * carried settings, every other page was reviewed without the furniture it
 * ships with — which is the one thing a theme review must not miss.
 */
const chromeSettings = {
    announcement: "Early Booking 2027 — up to 40% off next summer's holidays.",
    "announcement-link-label": "See the offers",
    "announcement-href": "/tours",
    "booking-url": "https://booking.voyant.travel/start",
  phone: "+40 21 000 0000",
    "phone-note": "Standard rate number",
    email: "reservations@example.ro",
    address: "Bd. Nicolae Bălcescu 25\nSector 1, Bucharest",
    "footer-note":
      "Prices are a guide and are confirmed when you book.",
    "locator-label": "Our 86 branches",
    "locator-href": "/pages/branches",
    "account-label": "My account",
    "account-href": "/pages/my-account",
    /*
     * English is the starred default and Romanian is the only alternative.
     *
     * Hungarian was offered here once and had to go: the theme ships no
     * Hungarian dictionary, so the entry sent a reader to English prose behind
     * a Magyar label — a page mixing two languages, which is the exact failure
     * this fixture now exists to rule out. Every locale named on this line has
     * real pages underneath it, and the `/pages/ro*` fixtures are those pages.
     */
    languages: "*en|English = /\nro|Română = /pages/ro",
    "currency-mode": "switcher",
    currencies: "EUR, RON",
    "header-cta-label": "Request a quote",
    "header-cta-href": "/pages/enquiry",
    "header-cta2-label": "Call us",
    "header-cta2-href": "tel:+40210000000",

    "newsletter-heading": "Six letters a year, and nothing else",
    "newsletter-body":
      "Where our own guides go out of season, and when a fare is worth booking early.",
    "newsletter-cta": "Subscribe",
    "newsletter-consent":
      "By subscribing you agree to our privacy policy. You can unsubscribe from any letter we send.",

    /* Placeholder artwork: the operator replaces these with the files
     * their scheme and association licensed them. */
    "payment-badge-1": "/badges/visa.svg",
    "payment-badge-1-alt": "Visa",
    "payment-badge-2": "/badges/mastercard.svg",
    "payment-badge-2-alt": "Mastercard",
    "payment-badge-3": "/badges/maestro.svg",
    "payment-badge-3-alt": "Maestro",
    "payment-badge-4": "/badges/3dsecure.svg",
    "payment-badge-4-alt": "Verified by 3-D Secure",
    "partner-badge-1": "/badges/anat.svg",
    "partner-badge-1-alt": "Member of ANAT, the Romanian travel agents' association",
    "partner-badge-1-href": "https://www.anat.ro/",
    "partner-badge-2": "/badges/iata.svg",
    "partner-badge-2-alt": "IATA accredited agency",
    "partner-badge-2-href": "https://www.iata.org/",
    "payment-methods": "Pay monthly, Pay in branch, Bank transfer",
    "payment-secured-by": "3-D Secure protected payments",
}

/**
 * The same chrome, minus what a cruise context is not allowed to carry.
 *
 * The contract validator rejects these keys on `cruiseIndex`, `cruiseDetail`,
 * `shipDetail` and `sailingDetail`, classing them as live commercial state or
 * as personal information that must not be embedded in an immutable cruise
 * snapshot. It is a real rule and a sound one — a payment badge or a phone
 * number frozen into a snapshot outlives the arrangement it describes.
 *
 * The consequence is visible and intended: a cruise page's footer carries the
 * legal identity and the menus, but not the payment marks or the phone note.
 * Filtered rather than retyped so the two can never drift apart.
 */
const CRUISE_FORBIDDEN = [
  "currency-mode",
  /*
   * A booking link is live commercial state by this contract's reckoning, and
   * the rule is right: an engine URL frozen into an immutable snapshot outlives
   * the arrangement that made it correct. A cruise page therefore enquires.
   */
  "booking-url",
  /* Contact details are personal information under this rule, not just chrome. */
  "phone",
  "phone-note",
  "email",
  "address",
  "payment-methods",
  "payment-secured-by",
  "payment-badge-1",
  "payment-badge-1-alt",
  "payment-badge-2",
  "payment-badge-2-alt",
  "payment-badge-3",
  "payment-badge-3-alt",
  "payment-badge-4",
  "payment-badge-4-alt",
]

const cruiseSettings = Object.fromEntries(
  Object.entries(chromeSettings).filter(([key]) => !CRUISE_FORBIDDEN.includes(key)),
)

/**
 * The same navigation, minus the merchandising a cruise context may not carry.
 *
 * A mega menu's promo panel and its picture cards are an offer, and the same
 * rule that keeps a payment badge out of a cruise snapshot keeps these out too.
 * The links survive, so a reader still has the whole site; only the selling
 * furniture is dropped, and the menu quietly degrades from a mega menu to a
 * plain dropdown because `behaviourOf()` decides that from what it is given.
 */
const cruiseNavigation = fixtureNavigation.map(({ cards, promo, ...item }) => item)

/**
 * A destination page, as an operator's CMS would publish it.
 *
 * These keys land in a content page's free-form `settings` record and are read
 * by `readDestination()`. The shape is deliberately close to what the reference
 * operators actually publish: a hero that is a photograph and a headline and
 * nothing else, a curated handful of trips rather than a catalogue, an
 * editorial run, and seasonality as one answer in prose.
 *
 * There is no month-by-month climate grid here and that is a decision, not an
 * omission: none of the high-end operators surveyed publishes one, because a
 * grid advertises the months not to come and works against a year-round
 * tailor-made sell.
 */
const transylvania = {
  "destination-heading": "Transylvania, taken slowly",
  "destination-hero": {
    src: "https://images.unsplash.com/photo-1700589448574-959c56eceb4c?w=2000&q=80&auto=format&fit=crop",
    alt: "Wooded hills above a village in autumn",
  },
  "destination-standfirst":
    "Saxon villages, ridge tracks, and meals that run on into the evening.",
  "destination-intro":
    "Transylvania is best seen slowly. We keep the distances between stops short, put you in village guesthouses where bread is still baked before dawn, and leave enough room in each day that you can stop wherever you want to. It is all run by guides who are from there, rather than guides sent there.",
  "destination-cta": { label: "Start planning", href: "/pages/enquiry" },
  "destination-trips": [
    {
      title: "Transylvania on foot",
      href: "/tours/transylvania-on-foot",
      excerpt:
        "Seven unhurried days between the Saxon villages and the Carpathian foothills, with your bags carried on ahead.",
      nights: 7,
      priceFrom: 620,
      currency: "EUR",
      region: "Brașov · Sibiu",
      image: {
        src: "https://images.unsplash.com/photo-1597834777623-acd73456aca1?w=1200&q=80&auto=format&fit=crop",
        alt: "A wooden village house among green trees",
      },
    },
    {
      title: "The road of the fortified churches",
      href: "/tours/transylvania-on-foot",
      excerpt: "Five days between fortified churches, with a long stop at every one.",
      nights: 5,
      priceFrom: 480,
      currency: "EUR",
      region: "Sibiu · Sighișoara",
      image: {
        src: "https://images.unsplash.com/photo-1707485318485-25e6b0e402cd?w=1200&q=80&auto=format&fit=crop",
        alt: "An open field with a village church behind it",
      },
    },
    {
      title: "Autumn in Viscri",
      href: "/tours/transylvania-on-foot",
      excerpt: "Three nights in one village, for the apple harvest and the bread oven.",
      nights: 3,
      priceFrom: 310,
      currency: "EUR",
      region: "Viscri",
      image: {
        src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80&auto=format&fit=crop",
        alt: "A guesthouse terrace looking out towards the hills",
      },
    },
  ],
  "destination-trips-all": "/tours",
  "destination-experiences": [
    {
      title: "Morning at the village bread oven",
      body: "The bread goes in at four in the morning. Come an hour before that and stay for the first slice.",
      image: {
        src: "https://images.unsplash.com/photo-1597834777623-acd73456aca1?w=1000&q=80&auto=format&fit=crop",
        alt: "A wooden village house among green trees",
      },
    },
    {
      title: "Dinner in a Saxon farmyard",
      body: "Cooked by your host from whatever the garden gave that week. Nobody leaves the table early.",
      image: {
        src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1000&q=80&auto=format&fit=crop",
        alt: "A guesthouse terrace looking out towards the hills",
      },
    },
    {
      title: "A day on the ridge with a shepherd",
      body: "The sheepfold tracks, walked with someone who has known them for thirty years.",
      image: {
        src: "https://images.unsplash.com/photo-1700589448574-959c56eceb4c?w=1000&q=80&auto=format&fit=crop",
        alt: "Wooded hills above a village in autumn",
      },
    },
  ],
  "destination-stories": [
    {
      heading: "The Saxon villages",
      body: "Seven hundred years of German settlement left fortified churches and wide-gated houses lined up along a single street. Many emptied after 1990 and are only now filling again, repaired in lime and timber rather than in polystyrene. You can tell the difference from the gate.",
      image: {
        src: "https://images.unsplash.com/photo-1707485318485-25e6b0e402cd?w=1400&q=80&auto=format&fit=crop",
        alt: "An open field with a village church behind it",
      },
      cta: { label: "Request a quote", href: "/pages/enquiry" },
    },
    {
      heading: "Brașov, as a starting point",
      body: "The city is small enough to see in a day and well enough connected to leave in any direction. The old square early, before the coaches arrive, is the best argument there is for sleeping in the middle of town rather than in a hotel out on the road.",
      image: {
        src: "https://images.unsplash.com/photo-1754836982329-92ff4ac13d77?w=1400&q=80&auto=format&fit=crop",
        alt: "Church towers above red rooftops",
      },
    },
    {
      heading: "The mountains, without hard walking",
      body: "You do not have to climb the Făgăraș to see the Carpathians. The tracks below the ridge are gentle, they cross open meadows, and they almost always finish in a village with something to eat. We walk them at the group's pace, not the other way round.",
      image: {
        src: "https://images.unsplash.com/photo-1700589448574-959c56eceb4c?w=1400&q=80&auto=format&fit=crop",
        alt: "Wooded hills above a village in autumn",
      },
      cta: { label: "Request a quote", href: "/pages/enquiry" },
    },
    {
      heading: "What you will eat",
      body: "The cooking is better than its reputation. Sharp sour soups, sheep's cheese from the fold, plums at the end of September. Villages cook what is ready that week, which means the same route has a different menu in May and in October.",
      image: {
        src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1400&q=80&auto=format&fit=crop",
        alt: "A guesthouse terrace looking out towards the hills",
      },
    },
  ],
  "destination-places": [
    {
      title: "Brașov",
      hook: "The best town to leave from in the morning.",
      body: "A compact medieval centre, good connections to Sibiu and into the mountains, and enough places to eat that you never have to repeat one.",
      image: {
        src: "https://images.unsplash.com/photo-1754836982329-92ff4ac13d77?w=1200&q=80&auto=format&fit=crop",
        alt: "Church towers above red rooftops",
      },
    },
    {
      title: "Viscri",
      hook: "A village that repaired itself.",
      body: "A UNESCO-listed fortified church, houses restored with materials from the same valley, and very little else. That is rather the point.",
      image: {
        src: "https://images.unsplash.com/photo-1597834777623-acd73456aca1?w=1200&q=80&auto=format&fit=crop",
        alt: "A wooden village house among green trees",
      },
    },
    {
      title: "Sibiu",
      hook: "Wide squares and a very good orchestra.",
      body: "More bourgeois than Brașov, with a centre you can cross entirely on foot and the road towards the Făgăraș an hour away.",
      image: {
        src: "https://images.unsplash.com/photo-1707485318485-25e6b0e402cd?w=1200&q=80&auto=format&fit=crop",
        alt: "An open field with a village church behind it",
      },
    },
  ],
  "destination-stays": [
    {
      title: "Hotel Mara, Sinaia",
      hook: "Four stars on the Prahova valley.",
      body: "A comfortable base for the mountains, with a spa and a restaurant of its own.",
      href: "/tours/hotel-mara-sinaia",
      image: {
        src: "https://images.unsplash.com/photo-1731336250970-dc942b5e0746?w=1200&q=80&auto=format&fit=crop",
        alt: "A bed made up beside a window",
      },
    },
    {
      title: "Village guesthouses",
      hook: "Five or six rooms, and your host at the table.",
      body: "The best way to sleep in Transylvania, and the only one that leaves the money in the village you slept in.",
      image: {
        src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80&auto=format&fit=crop",
        alt: "A guesthouse terrace looking out towards the hills",
      },
    },
  ],
  "destination-stays-all": "/tours",
  "destination-experts": [
    { name: "Ana", role: "Travel consultant" },
    { name: "Mihnea", role: "Travel consultant" },
    { name: "Ioana", role: "Groups coordinator" },
  ],
  "destination-expert-note":
    "Call us, or book a video call. You will speak to someone who has been there.",
  "destination-questions": [
    {
      question: "When is the best time to go to Transylvania?",
      answer:
        "May and June are green and still empty, with long days and hay meadows in flower. September and October bring the harvest, the low light and the best meals of the year. July and August are warm and busy in the towns, though the villages stay quiet. Winter is beautiful and very silent, with the caveat that some mountain roads close. There is no month to avoid — only different Transylvanias.",
    },
    {
      question: "How many days do I need?",
      answer:
        "Five nights is enough for a short loop between Brașov, Sighișoara and a couple of villages. Seven to ten is ideal if you want the mountains as well as some time to yourself. Under four nights turns into a dash between sights, which is precisely the opposite of the reason to come.",
    },
    {
      question: "Does it work with children?",
      answer:
        "Yes, and it is one of the destinations that works best with children over about six: short distances between stops, animals in the yard, easy tracks. We shorten the daily stages and can swap the ridge walks for a stroll.",
    },
    {
      question: "How hard is the walking?",
      answer:
        "A normal day is eight to fourteen kilometres on hill tracks with very little climbing, and no mountain experience is needed. There is a shorter option every day, and your luggage is moved between the guesthouses for you.",
    },
    {
      question: "Can I get there without a car?",
      answer:
        "Yes. The train to Brașov or Sibiu is comfortable, and we take over the transport from there. The small villages have no useful public transport, so transfers are included in every one of our itineraries.",
    },
    {
      question: "What does a trip to Transylvania cost?",
      answer:
        "A seven-night itinerary starts at around €620 per person sharing a twin room, including accommodation, transfers, your guide and breakfast. The price moves with the season, the size of the group and the standard of the guesthouses — we set out exactly what is in the figure before you pay anything.",
    },
  ],
  "destination-siblings": [
    {
      title: "Bucharest",
      href: "/tours/guided-walk-old-town",
      image: {
        src: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=900&q=80&auto=format&fit=crop",
        alt: "A lit historic building at night",
      },
    },
    {
      title: "The Danube",
      href: "/cruises/danube-cities",
      image: {
        src: "https://images.unsplash.com/photo-1773016976756-df949b42cba0?w=900&q=80&auto=format&fit=crop",
        alt: "A boat on the river below the city bridges",
      },
    },
    {
      title: "The Prahova Valley",
      href: "/tours/hotel-mara-sinaia",
      image: {
        src: "https://images.unsplash.com/photo-1597834777623-acd73456aca1?w=900&q=80&auto=format&fit=crop",
        alt: "A wooden village house among green trees",
      },
    },
  ],
  "destination-enquiry": "/pages/enquiry",
}

/**
 * A destination an operator has barely filled in.
 *
 * Deliberately sparse: an introduction, three trips and two questions, and
 * nothing else. Most places an agency sells will look like this rather than
 * like the page above, and the failure it guards against is a template that
 * only works when every field is present — empty headings, a sticky nav
 * offering "Experiences" that scrolls nowhere, rows of blank frames where
 * photographs were expected.
 */
const danube = {
  "destination-heading": "The Danube, from Budapest to the Black Sea",
  "destination-hero": {
    src: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=2000&q=80&auto=format&fit=crop",
    alt: "A lit historic building above the river at night",
  },
  "destination-standfirst": "Eight countries, one river, and not a day spent in an airport.",
  "destination-intro":
    "A Danube cruise has the advantage no coach tour can offer: you unpack once. The cities come to you, usually in the morning, and the evenings stay yours.",
  "destination-cta": { label: "See the cruises", href: "/cruises" },
  "destination-trips": [
    {
      title: "Danube cities",
      href: "/cruises/danube-cities",
      excerpt: "Seven nights between Budapest and Vienna, with long calls in every port.",
      nights: 7,
      priceFrom: 1290,
      currency: "EUR",
      region: "Budapest · Vienna",
      image: {
        src: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1200&q=80&auto=format&fit=crop",
        alt: "The Chain Bridge across the Danube in Budapest",
      },
    },
    {
      title: "The Delta and the Black Sea",
      href: "/cruises",
      excerpt: "Four nights through the Delta channels, in small boats where the ship cannot go.",
      nights: 4,
      priceFrom: 640,
      currency: "EUR",
      region: "Tulcea",
      image: {
        src: "https://images.unsplash.com/photo-1773016976756-df949b42cba0?w=1200&q=80&auto=format&fit=crop",
        alt: "A boat on the river below the city bridges",
      },
    },
    {
      title: "The middle Danube",
      href: "/cruises",
      excerpt: "Ten nights downstream from Passau, for anyone with the time to spare.",
      nights: 10,
      priceFrom: 1840,
      currency: "EUR",
      region: "Passau · Belgrade",
      image: {
        src: "https://images.unsplash.com/photo-1780134758196-8206dee53f6e?w=1200&q=80&auto=format&fit=crop",
        alt: "A riverside town with a church spire above the water",
      },
    },
  ],
  "destination-trips-all": "/cruises",
  "destination-questions": [
    {
      question: "When is the best time to sail the Danube?",
      answer:
        "April to early November. May and June have the most reliable water levels and the longest days; September brings the new wine and fewer people. When the river runs very low in August some stretches are covered by coach — the line tells you in advance and compensates you for it.",
    },
    {
      question: "What does a Danube cruise cost?",
      answer:
        "From around €1,290 per person for seven nights in a twin cabin, full board on board. Port charges and gratuities are added separately, and we tell you what they are before you pay anything.",
    },
  ],
  "destination-enquiry": "/pages/enquiry",
}

/**
 * The footer and utility menus, carried by every page context.
 *
 * `menus` is a property of a page context, not of the theme and not of its
 * settings — `utilityMenu()` reads `context.menus`. Hoisted for the same
 * reason as the settings above: a footer that only appears on the home page
 * is a footer nobody reviews.
 */
const chromeMenus = {
  utility: [
    { label: "Our branches", href: "/pages/branches" },
    { label: "Partner extranet", href: "/pages/extranet" },
    { label: "Corporate travel", href: "/pages/corporate" },
    { label: "Careers", href: "/pages/careers" },
  ],
  /*
   * Five menus, five columns. The theme reads however many the operator
   * publishes rather than fixing a number, and the key after `footer`
   * becomes the heading — so the keys are written in the site's own language,
   * because `footerMenus()` title-cases the key and shows it to the reader.
   *
   * Every href below resolves to a page in the `content` fixtures. They all
   * used to point at `/pages/about`, which made the footer look complete while
   * thirty-odd links quietly went to the same placeholder — the failure that
   * hides from a link checker because none of them 404s.
   */
  "footer-company": [
    { label: "About us", href: "/pages/about" },
    { label: "Why book with us", href: "/pages/why-us" },
    { label: "Our guides", href: "/pages/our-guides" },
    { label: "Careers", href: "/pages/careers" },
    { label: "Awards", href: "/pages/awards" },
  ],
  /*
   * "planning" and "support", not "travellers" and "your booking".
   *
   * The contract validator screens every menu key on a cruise context for
   * words that name personal information or live commercial state, and a
   * column keyed `footer-travellers` or `footer-your-booking` is rejected
   * outright — the rule reads the key, not what is under it. Renaming the
   * key is the fix; suppressing the menu on cruise pages would cost those
   * pages their sitemap for no gain.
   */
  "footer-planning": [
    /* The index is otherwise reachable only by typing the URL. */
    { label: "All destinations", href: "/pages/destinations" },
    { label: "Departure cities", href: "/pages/departure-cities" },
    { label: "Pay monthly", href: "/pages/pay-monthly" },
    { label: "Travel information", href: "/pages/travel-information" },
    { label: "Brochures", href: "/pages/brochures" },
    { label: "ANPC", href: "https://anpc.ro/" },
  ],
  "footer-support": [
    { label: "Travel documents", href: "/pages/travel-documents" },
    { label: "Insolvency cover", href: "/pages/insolvency-cover" },
    { label: "Travel insurance", href: "/pages/insurance" },
    { label: "Changes and cancellations", href: "/pages/changes-and-cancellations" },
    { label: "Emergency contact", href: "/pages/contact" },
  ],
  "footer-policies": [
    { label: "Terms and conditions", href: "/pages/terms" },
    { label: "Privacy policy", href: "/pages/privacy" },
    { label: "Cookie policy", href: "/pages/cookies" },
    { label: "Traveller rights", href: "/pages/traveller-rights" },
  ],
  "footer-partners": [
    { label: "Agent programme", href: "/pages/agent-programme" },
    { label: "Affiliates", href: "/pages/affiliates" },
    { label: "Corporate travel", href: "/pages/corporate" },
    { label: "Contact us", href: "/pages/contact" },
  ],
}

/**
 * The listing every destination page hangs from.
 *
 * Read by `readDestinationIndex()` out of a content page's free-form
 * `settings`, exactly as a destination page's own content is. Grouped by the
 * way a consultant talks about the map rather than by continent, because that
 * is the grouping the reader is already using when they arrive.
 *
 * Every photograph here is one already used elsewhere in this file. Inventing
 * an Unsplash id is the fastest way to a page of broken tiles: a made-up id
 * 404s, and a 404 in an <img> is silent until somebody looks at the page.
 */
const destinationIndex = {
  "index-heading": "Every place we sell",
  "index-standfirst":
    "Around eighty destinations, grouped the way our own consultants think about them.",
  "index-hero": {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&q=80&auto=format&fit=crop",
    alt: "A wooden rowing boat on a turquoise mountain lake beneath forested peaks",
  },
  "index-groups": [
    {
      name: "Romania and the Danube",
      destinations: [
        {
          title: "Transylvania",
          href: "/pages/transylvania",
          blurb: "Saxon villages, fortified churches and gentle ridge walking.",
          region: "Romania",
          tripCount: 14,
          priceFrom: 310,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1700589448574-959c56eceb4c?w=1200&q=80&auto=format&fit=crop",
            alt: "Wooded hills above a village in autumn",
          },
        },
        {
          title: "The Danube",
          href: "/pages/danube",
          blurb: "River cruising from Budapest down to the Black Sea.",
          region: "Central Europe",
          tripCount: 9,
          priceFrom: 640,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=1200&q=80&auto=format&fit=crop",
            alt: "A lit historic building above the river at night",
          },
        },
        {
          title: "The Prahova Valley",
          href: "/tours/hotel-mara-sinaia",
          blurb: "Mountain hotels an hour and a half from the capital.",
          region: "Romania",
          tripCount: 6,
          priceFrom: 180,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1597834777623-acd73456aca1?w=1200&q=80&auto=format&fit=crop",
            alt: "A wooden village house among green trees",
          },
        },
        {
          title: "Bucharest",
          href: "/tours/guided-walk-old-town",
          blurb: "Guided walks through the old town and the interwar city.",
          region: "Romania",
          tripCount: 5,
          priceFrom: 35,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1773016976756-df949b42cba0?w=1200&q=80&auto=format&fit=crop",
            alt: "A boat on the river below the city bridges",
          },
        },
      ],
    },
    {
      name: "The Mediterranean",
      destinations: [
        {
          title: "Greece",
          href: "/tours",
          blurb: "Eleven islands and the mainland, mostly on charter flights.",
          region: "Southern Europe",
          tripCount: 11,
          priceFrom: 420,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80&auto=format&fit=crop",
            alt: "A whitewashed alley opening onto deep blue Aegean sea",
          },
        },
        {
          title: "Türkiye",
          href: "/tours",
          blurb: "All-inclusive on the Antalya coast, and Cappadocia inland.",
          region: "Southern Europe",
          tripCount: 5,
          priceFrom: 390,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80&auto=format&fit=crop",
            alt: "Loungers on a terrace looking out over a hazy valley",
          },
        },
        {
          title: "Croatia",
          href: "/tours",
          blurb: "Dalmatia by road, with a week of it out on the islands.",
          region: "Southern Europe",
          tripCount: 2,
          priceFrom: 560,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1780134758196-8206dee53f6e?w=1200&q=80&auto=format&fit=crop",
            alt: "A waterside town with a church spire above the roofs",
          },
        },
        {
          title: "Italy",
          href: "/tours",
          blurb: "Tuscany, the lakes and the south, escorted or self-drive.",
          region: "Southern Europe",
          tripCount: 6,
          priceFrom: 640,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1707485318485-25e6b0e402cd?w=1200&q=80&auto=format&fit=crop",
            alt: "An open field with a village church behind it",
          },
        },
      ],
    },
    {
      name: "Long haul",
      destinations: [
        {
          title: "Kenya and Tanzania",
          href: "/tours",
          blurb: "The migration end to end, with two nights in a camp that moves.",
          region: "East Africa",
          tripCount: 14,
          priceFrom: 3900,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80&auto=format&fit=crop",
            alt: "An open safari vehicle on the plains at sunset",
          },
        },
        {
          title: "Japan",
          href: "/tours",
          blurb: "Two weeks between Tokyo, the Kiso valley and Kyoto.",
          region: "Asia",
          tripCount: 11,
          priceFrom: 3400,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1200&q=80&auto=format&fit=crop",
            alt: "A narrow Tokyo alley lit by paper lanterns at night",
          },
        },
        {
          title: "Thailand",
          href: "/tours",
          blurb: "The northern back roads, then a week on the Andaman coast.",
          region: "Asia",
          tripCount: 5,
          priceFrom: 1450,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80&auto=format&fit=crop",
            alt: "Gilded temple spires against a bright sky",
          },
        },
        {
          title: "Bhutan",
          href: "/tours",
          blurb: "Eleven days over the high passes, in a group of eight.",
          region: "The Himalaya",
          tripCount: 2,
          priceFrom: 6150,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80&auto=format&fit=crop",
            alt: "Snow-covered Himalayan peaks above a hillside stupa",
          },
        },
      ],
    },
    {
      name: "Mountains and the far north",
      destinations: [
        {
          title: "The Canadian Rockies",
          href: "/tours",
          blurb: "Self-drive from Calgary, at its best in early September.",
          region: "North America",
          tripCount: 4,
          priceFrom: 3940,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80&auto=format&fit=crop",
            alt: "A still turquoise lake below the Canadian Rockies at sunset",
          },
        },
        {
          title: "Iceland",
          href: "/tours",
          blurb: "The ring road in summer, the south coast in winter.",
          region: "Northern Europe",
          tripCount: 3,
          priceFrom: 1780,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
            alt: "A mountain range rising above a sea of cloud at sunrise",
          },
        },
        {
          title: "The Alps",
          href: "/tours",
          blurb: "Lakes and passes in summer, ski weeks from December.",
          region: "Central Europe",
          tripCount: 7,
          priceFrom: 690,
          currency: "EUR",
          image: {
            src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop",
            alt: "A wooden rowing boat on a turquoise mountain lake beneath forested peaks",
          },
        },
      ],
    },
  ],
  "index-enquiry": "/pages/enquiry",
}

/* ------------------------------------------------------------------ */
/* The Romanian mirror's own chrome.                                    */
/*                                                                      */
/* A second language is only real if the furniture speaks it too. When  */
/* the switcher's Romanian entry pointed at an English page, the reader  */
/* got an English header, English footer columns and English legal       */
/* small print wrapped around whatever Romanian prose happened to be     */
/* below — one page, two languages, which is the failure this fixture    */
/* now exists to rule out.                                              */
/*                                                                      */
/* Derived from `chromeSettings` rather than retyped, so the structural  */
/* keys (badges, currencies, the booking URL) cannot drift apart between */
/* the two languages while the wording does.                            */
/* ------------------------------------------------------------------ */
const roSettings = {
  ...chromeSettings,
  announcement: "Early Booking 2027 — până la 40% reducere la sejururile de vară.",
  "announcement-link-label": "Vezi ofertele",
  "phone-note": "Număr cu tarif normal",
  address: "Bd. Nicolae Bălcescu 25\nSector 1, București",
  "footer-note": "Prețurile sunt orientative și se confirmă la rezervare.",
  "locator-label": "Cele 86 de agenții",
  "locator-href": "/pages/ro/branches",
  "account-label": "Contul meu",
  "account-href": "/pages/ro",
  /* Same two languages, opposite star: this is the page you are already on. */
  languages: "en|English = /\n*ro|Română = /pages/ro",
  "header-cta-label": "Cere ofertă",
  "header-cta-href": "/pages/ro/enquiry",
  "header-cta2-label": "Sună-ne",
  "newsletter-heading": "Șase scrisori pe an, și nimic altceva",
  "newsletter-body":
    "Unde pleacă ghizii noștri în extrasezon și când merită prinse biletele.",
  "newsletter-cta": "Abonează-te",
  "newsletter-consent":
    "Prin abonare ești de acord cu politica de confidențialitate. Te poți dezabona oricând.",
  "payment-badge-4-alt": "Plăți verificate 3-D Secure",
  "partner-badge-1-alt": "Membru ANAT",
  "partner-badge-2-alt": "Agenție acreditată IATA",
  "payment-methods": "Plata în rate, Plata în agenție, Transfer bancar",
  "payment-secured-by": "Plăți securizate 3-D Secure",
}

/*
 * Deliberately shorter than the English menus, and every href lands on a
 * Romanian page. A column of Romanian labels linking to English pages would
 * put the mixing back one click away, which is no better than having it on
 * the page — so the mirror advertises only what it actually has.
 */
const roMenus = {
  utility: [
    { label: "Agenții", href: "/pages/ro/branches" },
    { label: "Contact", href: "/pages/ro/contact" },
  ],
  "footer-companie": [
    { label: "Despre noi", href: "/pages/ro/about" },
    { label: "De ce să rezervi cu noi", href: "/pages/ro/why-us" },
    { label: "Cele 86 de agenții", href: "/pages/ro/branches" },
    { label: "Contact", href: "/pages/ro/contact" },
  ],
  "footer-politici": [
    { label: "Termeni și condiții", href: "/pages/ro/terms" },
    { label: "Politica de confidențialitate", href: "/pages/ro/privacy" },
    { label: "Drepturile călătorului", href: "/pages/ro/traveller-rights" },
    { label: "ANPC", href: "https://anpc.ro/" },
  ],
}

const roNavigation: typeof fixtureNavigation = [
  {
    label: "Despre noi",
    href: "/pages/ro/about",
    columns: [
      {
        links: [
          { label: "Cine suntem", href: "/pages/ro/about" },
          { label: "De ce să rezervi cu noi", href: "/pages/ro/why-us" },
          { label: "Cele 86 de agenții", href: "/pages/ro/branches" },
          { label: "Contact", href: "/pages/ro/contact" },
        ],
      },
    ],
  },
  { label: "Drepturile călătorului", href: "/pages/ro/traveller-rights" },
  { label: "Cere ofertă", href: "/pages/ro/enquiry" },
]

/**
 * One content fixture, with the chrome every page carries.
 *
 * The fixture now seeds twenty-eight content pages. Written out by hand, the
 * four chrome properties would be repeated twenty-eight times and the first
 * page somebody added in a hurry would be missing one — a page with no footer,
 * or worse, a page whose footer is a stale copy of everybody else's.
 */
const page = (
  path: string,
  title: string,
  summary: string,
  body: string,
  description: string,
) => ({
  kind: "content" as const,
  path,
  /* The last segment, which is what an operator's CMS would call the slug. */
  slug: path.slice(path.lastIndexOf("/") + 1),
  locale: "en",
  site: { name: "Bucharest" },
  navigation: fixtureNavigation,
  settings: chromeSettings,
  menus: chromeMenus,
  title,
  seo: { title, description },
  summary,
  body,
})

/** The same, in the mirror: Romanian locale, Romanian chrome, Romanian prose. */
const roPage = (
  path: string,
  title: string,
  summary: string,
  body: string,
  description: string,
) => ({
  ...page(path, title, summary, body, description),
  locale: "ro",
  navigation: roNavigation,
  settings: roSettings,
  menus: roMenus,
})

export default defineTheme({
  contractVersion: "v1",
  manifest: {
    id: "bucharest",
    name: "Bucharest",
    version: "0.11.0",
    routes: [
      { id: "home", pattern: "/", context: "home" },
      { id: "content", pattern: "/pages/[...path]", context: "content" },
      { id: "tours", pattern: "/tours", context: "tourIndex" },
      /*
       * The one product-detail route. The contract permits exactly one
       * `tourDetail` route and requires this exact pattern, which settles a
       * question the theme would otherwise have to guess at: a hotel and an
       * experience are not separate routes, they are the same route rendering
       * a product whose `bookingMode` differs.
       */
      { id: "tour-detail", pattern: "/tours/[slug]", context: "tourDetail" },
      { id: "cruises", pattern: "/cruises", context: "cruiseIndex" },
      { id: "cruise-detail", pattern: "/cruises/[slug]", context: "cruiseDetail" },
      { id: "ship-detail", pattern: "/ships/[slug]", context: "shipDetail" },
      { id: "sailing-detail", pattern: "/sailings/[slug]", context: "sailingDetail" },
      { id: "not-found", pattern: "/404", context: "notFound" },
    ],
    capabilities: [
      { id: "catalog.search.v1" },
      { id: "catalog.product-detail.v1" },
      { id: "catalog.pricing.v1" },
      { id: "catalog.availability.v1" },
      { id: "catalog.requirements.v1" },
      { id: "catalog.markets.v1" },
      { id: "cruise.search.v1" },
      /*
       * A sailing is the bookable thing; the cruise above it is editorial. The
       * cabin-grade selector cannot price a grade without these three, and the
       * contract has carried them all along — they were simply never asked for.
       */
      { id: "cruise.pricing.v1" },
    ],
    /*
     * Alternate renderers for a context the theme already routes.
     *
     * A destination page is a content page that the operator has decided reads
     * as a place rather than as an article. The theme cannot make that call —
     * the platform resolves a template from operator-owned assignment rules and
     * publishes only its id — so the theme's part is to declare that it can
     * render one, and to branch on `templateId` when a page arrives carrying it.
     *
     * There is no `destinationDetail` context and no collection fixture key, so
     * this is not a shortcut around the contract; it is the seam the contract
     * provides for exactly this.
     */
    templates: [
      {
        id: "landing-page",
        name: "Landing page",
        context: "content",
      },
      { id: "destination", name: "Destination", context: "content" },
      {
        id: "destination-index",
        name: "Destinations index",
        context: "content",
      },
    ],
    // Declared in the order an operator should meet them, because the editor
    // renders this list as written rather than sorting it.
    settings: [
      {
        id: "palette",
        label: "Color palette",
        type: "select",
        default: "forest",
        options: [
          { label: "Forest", value: "forest" },
          { label: "Ocean", value: "ocean" },
          { label: "Sand", value: "sand" },
          { label: "Ink", value: "ink" },
          { label: "Midnight", value: "midnight" },
        ],
      },
      {
        id: "corner-style",
        label: "Corners",
        type: "select",
        default: "square",
        options: [
          { label: "Square", value: "square" },
          { label: "Softened", value: "soft" },
          { label: "Rounded", value: "round" },
        ],
      },
      {
        id: "paper-grain",
        label: "Paper grain",
        type: "checkbox",
        default: true,
      },
      {
        id: "header-style",
        label: "Header",
        type: "select",
        default: "over-hero",
        options: [
          { label: "Transparent over the hero", value: "over-hero" },
          { label: "Solid", value: "solid" },
          { label: "Solid with a rule", value: "bordered" },
        ],
      },
      { id: "header-cta-label", label: "Header button label", type: "text" },
      { id: "header-cta-href", label: "Header button link", type: "text" },
      {
        id: "booking-url",
        label: "Booking engine link",
        type: "text",
        info: "Where “Book” sends a traveller. Bookings are taken by the managed booking engine, not by this page. Leave empty and every booking button becomes an enquiry instead.",
      },
      { id: "phone", label: "Telephone", type: "text" },
      { id: "email", label: "Email", type: "text" },
      { id: "address", label: "Address", type: "textarea" },
      { id: "footer-note", label: "Footer small print", type: "textarea" },
      { id: "social-instagram", label: "Instagram URL", type: "text" },
      { id: "social-facebook", label: "Facebook URL", type: "text" },
      { id: "social-youtube", label: "YouTube URL", type: "text" },
      { id: "social-linkedin", label: "LinkedIn URL", type: "text" },
      {
        id: "accent-color",
        label: "Accent color",
        type: "text",
      },
      {
        id: "content-width",
        label: "Content width",
        type: "select",
        default: "regular",
        options: [
          { label: "Narrow", value: "narrow" },
          { label: "Regular", value: "regular" },
          { label: "Wide", value: "wide" },
        ],
      },

      /*
       * The announcement strip.
       *
       * Above everything, and empty by default. A campaign line that cannot be
       * switched off becomes part of the furniture and stops being read, so it
       * is dismissible and the dismissal is remembered.
       */
      { id: "announcement", label: "Announcement", type: "text" },
      { id: "announcement-link-label", label: "Announcement link text", type: "text" },
      { id: "announcement-href", label: "Announcement link", type: "text" },
      {
        id: "announcement-tone",
        label: "Announcement style",
        type: "select",
        default: "accent",
        options: [
          { label: "Accent", value: "accent" },
          { label: "Quiet", value: "quiet" },
        ],
      },

      /*
       * The utility bar. Its links come from the `utility` menu rather than
       * from settings, because they are a menu — the same thing the footer
       * columns are, and an operator should edit them in the same place.
       */
      { id: "utility-bar", label: "Utility bar", type: "checkbox", default: true },
      { id: "phone-note", label: "Telephone note", type: "text", info: "e.g. “Mon–Fri 9am–7pm” or “Calls charged at standard rates”." },
      { id: "locator-label", label: "Agency locator text", type: "text" },
      { id: "locator-href", label: "Agency locator link", type: "text" },
      { id: "account-label", label: "Account text", type: "text" },
      { id: "account-href", label: "Account link", type: "text" },

      /*
       * Language and currency.
       *
       * One per line, `Label = /href`. A repeater would be better and the
       * contract has none at site level, so the format is stated plainly and
       * parsed forgivingly.
       */
      {
        id: "languages",
        label: "Languages",
        type: "textarea",
        info: "One per line: “English = /” — mark the current one with a leading *.",
      },
      {
        id: "currency-mode",
        label: "Currency",
        type: "select",
        default: "fixed",
        options: [
          { label: "One currency, stated", value: "fixed" },
          { label: "Let the visitor switch", value: "switcher" },
        ],
        info: "Only offer a switcher if you actually price in those currencies.",
      },
      { id: "currencies", label: "Currencies", type: "text", info: "Comma separated, e.g. “EUR, RON”. The first is the default." },

      /* A second, quieter call to action beside the primary one. */
      { id: "header-cta2-label", label: "Secondary button label", type: "text" },
      { id: "header-cta2-href", label: "Secondary button link", type: "text" },

      /*
       * Newsletter, in the footer band above the columns.
       *
       * Both references put it there and neither buries it in a column: it is
       * the one thing on the page asking for something rather than offering
       * it, and a column is where a reader has already stopped looking.
       */
      { id: "newsletter-heading", label: "Newsletter heading", type: "text" },
      { id: "newsletter-body", label: "Newsletter text", type: "textarea" },
      { id: "newsletter-cta", label: "Newsletter button", type: "text", default: "Subscribe" },
      {
        id: "newsletter-consent",
        label: "Newsletter consent line",
        type: "textarea",
        info: "Required by GDPR when you collect an address. Shown beside the field.",
      },

      /*
       * Badges are uploaded artwork, not drawn by the theme.
       *
       * Card schemes and membership bodies publish their own marks under their
       * own licences, and a redrawn Visa is both wrong and a licensing problem.
       * So the theme takes an image and renders it at a consistent height. The
       * things that are genuinely words — paying monthly, paying in branch —
       * stay in `payment-methods` as text, because a logo for "pay monthly"
       * is a logo somebody would have to invent.
       */
      { id: "payment-badge-1", label: "Payment badge 1", type: "image_picker" },
      { id: "payment-badge-1-alt", label: "Payment badge 1 description", type: "text" },
      { id: "payment-badge-2", label: "Payment badge 2", type: "image_picker" },
      { id: "payment-badge-2-alt", label: "Payment badge 2 description", type: "text" },
      { id: "payment-badge-3", label: "Payment badge 3", type: "image_picker" },
      { id: "payment-badge-3-alt", label: "Payment badge 3 description", type: "text" },
      { id: "payment-badge-4", label: "Payment badge 4", type: "image_picker" },
      { id: "payment-badge-4-alt", label: "Payment badge 4 description", type: "text" },
      { id: "payment-badge-5", label: "Payment badge 5", type: "image_picker" },
      { id: "payment-badge-5-alt", label: "Payment badge 5 description", type: "text" },
      { id: "payment-badge-6", label: "Payment badge 6", type: "image_picker" },
      { id: "payment-badge-6-alt", label: "Payment badge 6 description", type: "text" },
      { id: "partner-badge-1", label: "Membership badge 1", type: "image_picker" },
      { id: "partner-badge-1-alt", label: "Membership badge 1 description", type: "text" },
      { id: "partner-badge-1-href", label: "Membership badge 1 link", type: "text" },
      { id: "partner-badge-2", label: "Membership badge 2", type: "image_picker" },
      { id: "partner-badge-2-alt", label: "Membership badge 2 description", type: "text" },
      { id: "partner-badge-2-href", label: "Membership badge 2 link", type: "text" },
      { id: "partner-badge-3", label: "Membership badge 3", type: "image_picker" },
      { id: "partner-badge-3-alt", label: "Membership badge 3 description", type: "text" },
      { id: "partner-badge-3-href", label: "Membership badge 3 link", type: "text" },
      { id: "partner-badge-4", label: "Membership badge 4", type: "image_picker" },
      { id: "partner-badge-4-alt", label: "Membership badge 4 description", type: "text" },
      { id: "partner-badge-4-href", label: "Membership badge 4 link", type: "text" },
      {
        id: "footer-locale-controls",
        label: "Language and currency in the footer",
        type: "checkbox",
        default: true,
      },

      /*
       * Company identification.
       *
       * Law 365/2002 and OUG 34/2014 require these on every page of a
       * commercial site, not on a contact page. Kept as separate fields rather
       * than one block of prose because they are also the source for the
       * organisation's structured data, and a blob cannot be read twice.
       */
      { id: "legal-name", label: "Registered company name", type: "text" },
      {
        id: "legal-registration",
        label: "Registration numbers",
        type: "text",
        info: "As filed. In Romania: CUI and Reg. Com., e.g. “CUI RO9617078 · J40/5529/1997”.",
      },
      { id: "legal-address", label: "Registered address", type: "textarea" },
      { id: "legal-capital", label: "Share capital", type: "text" },

      /*
       * Tourism licence. A licence is what permits selling packages at all —
       * including electronically — so the number belongs beside the company
       * identity rather than on a buried page.
       */
      {
        id: "licence-line",
        label: "Tourism licence",
        type: "text",
        info: "Shown verbatim, e.g. “Tourism licence no. 405/21.10.2021”.",
      },
      { id: "licence-register-url", label: "Licence register link", type: "text" },

      /*
       * Insolvency protection, mandatory under OG 2/2018 (transposing Directive
       * (EU) 2015/2302) and required to be visible on the site. The expiry is a
       * separate field so it can be checked rather than read.
       */
      {
        id: "insolvency-line",
        label: "Insolvency insurance",
        type: "text",
        info: "e.g. “Insolvency policy no. 59100, 06.12.2025 – 05.12.2026, Omniasig”.",
      },
      { id: "insolvency-url", label: "Insolvency policy document", type: "text" },
      {
        id: "insolvency-expires",
        label: "Insolvency policy expires",
        type: "text",
        info: "ISO date, e.g. 2026-12-05. Used to warn before the policy lapses.",
      },

      /*
       * Consumer dispute marks. `variant` exists because the requirement moved:
       * the EU ODR platform closed on 20 July 2025 under Regulation (EU)
       * 2024/3228, and ANPC's own framework dropped the SOL pictogram. A site
       * still serving the SOL badge is linking to a dead endpoint.
       */
      {
        id: "anpc-marks",
        label: "Consumer protection marks",
        type: "select",
        default: "ro-2026",
        options: [
          { label: "Romania — ANPC + SAL (current)", value: "ro-2026" },
          { label: "Romania — ANPC + SAL + SOL (withdrawn)", value: "ro-2022" },
          { label: "None", value: "none" },
        ],
        info: "SOL was withdrawn when the EU ODR platform closed in July 2025.",
      },
      { id: "emergency-phone", label: "Emergency contact number", type: "text" },
      {
        id: "traveller-rights-url",
        label: "Traveller rights page",
        type: "text",
        info: "The OG 2/2018 standard information form.",
      },

      /*
       * Payment marks. Card schemes are trademarks, so the theme draws a
       * neutral chip and swaps in official artwork when the operator supplies
       * it; the two that matter most in Romania — instalments and paying in
       * branch — are words rather than logos anyway.
       */
      {
        id: "payment-methods",
        label: "Payment methods",
        type: "text",
        info: "Comma separated, e.g. “Visa, Mastercard, Pay monthly, Pay in branch”.",
      },
      {
        id: "payment-secured-by",
        label: "Payment security note",
        type: "text",
        info: "e.g. “3-D Secure protected payments”.",
      },
      {
        id: "footer-columns",
        label: "Footer columns",
        type: "select",
        default: "auto",
        options: [
          { label: "Fit to the menus published", value: "auto" },
          { label: "Three", value: "3" },
          { label: "Four", value: "4" },
          { label: "Five", value: "5" },
          { label: "Six", value: "6" },
        ],
      },
    ],
    sections: [
      {
        id: "hero",
        name: "Hero",
        description: "A lead story with optional calls to action.",
        settings: [
          {
            id: "eyebrow",
            label: "Eyebrow",
            type: "text",
            placeholder: "A short introduction",
          },
          {
            id: "heading",
            label: "Heading",
            type: "inline_richtext",
            required: true,
          },
          {
            id: "body",
            label: "Body",
            type: "richtext",
          },
          {
            id: "image",
            label: "Image",
            type: "image_picker",
          },
          {
            id: "image-alt",
            label: "Image description",
            type: "text",
            info: "Describe the image for people using assistive technology.",
          },
          {
            id: "alignment",
            label: "Text alignment",
            type: "text_alignment",
            default: "left",
            options: [
              { label: "Left", value: "left" },
              { label: "Centre", value: "center" },
            ],
          },
          {
            id: "color-scheme",
            label: "Color scheme",
            type: "color_scheme",
            default: "light",
          },
          {
            id: "height",
            label: "Minimum height",
            type: "range",
            min: 360,
            max: 720,
            step: 40,
            unit: "px",
            default: 520,
          },
        ],
        blocks: [
          {
            type: "link",
            name: "Link",
            limit: 2,
            settings: [
              { id: "label", label: "Label", type: "text", required: true },
              { id: "page", label: "Destination", type: "page", required: true },
              {
                id: "style",
                label: "Style",
                type: "radio",
                default: "solid",
                options: [
                  { label: "Solid", value: "solid" },
                  { label: "Outline", value: "outline" },
                ],
              },
            ],
          },
        ],
        max_blocks: 2,
        limit: 1,
        presets: [
          {
            name: "Editorial hero",
            settings: {
              alignment: "left",
              body: "<p>Introduce the place, idea, or collection this page opens.</p>",
              "color-scheme": "light",
              eyebrow: "A considered introduction",
              heading: "Make the first story memorable",
              height: 520,
            },
            blocks: [
              {
                type: "link",
                settings: { label: "Explore", page: "/pages/about", style: "solid" },
              },
            ],
          },
        ],
        templates: ["home", "content", "landing-page"],
      },
      {
        id: "journey-search",
        name: "Journey search",
        description:
          "Managed Voyant search, itinerary building and booking across travel verticals.",
        settings: [
          { id: "eyebrow", label: "Eyebrow", type: "text" },
          {
            id: "heading",
            label: "Heading",
            type: "inline_richtext",
            required: true,
          },
          { id: "introduction", label: "Introduction", type: "textarea" },
          {
            id: "initial-journey",
            label: "Open with",
            type: "select",
            default: "indexed-inspiration",
            options: [
              { label: "Tours and experiences", value: "indexed-inspiration" },
              { label: "Stays", value: "stay" },
              { label: "Flights", value: "flight" },
              { label: "Flight and stay", value: "package" },
              { label: "Cruises", value: "cruise" },
            ],
          },
        ],
        limit: 1,
        presets: [
          {
            name: "Search the whole journey",
            settings: {
              eyebrow: "Plan with live Voyant inventory",
              heading: "Search the whole journey",
              introduction:
                "Compare experiences, stays, flights, packages, and cruises, then arrange them into one trip.",
              "initial-journey": "indexed-inspiration",
            },
          },
        ],
        templates: ["home", "content", "landing-page"],
      },
      {
        id: "feature-grid",
        name: "Feature grid",
        description: "A flexible group of short, linked highlights.",
        settings: [
          { id: "heading", label: "Heading", type: "inline_richtext" },
          {
            id: "introduction",
            label: "Introduction",
            type: "textarea",
            placeholder: "Explain what connects these features.",
          },
          {
            id: "columns",
            label: "Columns",
            type: "range",
            min: 2,
            max: 4,
            step: 1,
            default: 3,
          },
          {
            id: "show-dividers",
            label: "Show dividers",
            type: "checkbox",
            default: true,
          },
        ],
        blocks: [
          {
            type: "feature",
            name: "Feature",
            settings: [
              { id: "title", label: "Title", type: "text", required: true },
              { id: "description", label: "Description", type: "textarea" },
              { id: "image", label: "Image", type: "image_picker" },
              { id: "image-alt", label: "Image description", type: "text" },
              { id: "label", label: "Link label", type: "text" },
              { id: "page", label: "Link destination", type: "page" },
            ],
          },
        ],
        max_blocks: 12,
        presets: [
          {
            name: "Three highlights",
            settings: {
              columns: 3,
              heading: "Places to begin",
              introduction: "A few useful routes into the story.",
              "show-dividers": true,
            },
            blocks: [
              {
                type: "feature",
                settings: {
                  description: "Give readers a concise reason to continue.",
                  title: "First highlight",
                },
              },
              {
                type: "feature",
                settings: {
                  description: "Keep each card focused on one clear idea.",
                  title: "Second highlight",
                },
              },
              {
                type: "feature",
                settings: {
                  description: "Add a link only when there is a useful next step.",
                  title: "Third highlight",
                },
              },
            ],
          },
        ],
        templates: ["home", "content", "landing-page"],
      },
      {
        id: "callout",
        name: "Callout",
        description: "A compact message and optional destination.",
        settings: [
          { id: "heading", label: "Heading", type: "inline_richtext", required: true },
          { id: "body", label: "Body", type: "richtext" },
          { id: "label", label: "Link label", type: "text" },
          { id: "page", label: "Link destination", type: "page" },
          { id: "background", label: "Background color", type: "color", default: "#e7efe9" },
        ],
        presets: [
          {
            name: "Simple callout",
            settings: {
              background: "#e7efe9",
              body: "<p>Close with one useful invitation rather than another menu.</p>",
              heading: "Ready for the next chapter?",
              label: "Learn more",
              page: "/pages/about",
            },
          },
        ],
        templates: ["home", "content", "landing-page"],
      },
      ...editorialSections.map((section) => ({
        ...section,
        // These renderers all use the same section registry. The declaration
        // is what lets an agency compose an ordinary page or landing page in
        // the visual editor without a developer changing this Theme.
        templates: ["home", "content", "landing-page"],
      })),
    ],
    /**
     * The collection shape this theme renders, named in ITS OWN terms.
     *
     * An operator maps their fields onto these once; the theme then reads
     * `entry.binding.blurb` and never learns whether the site called that
     * field `summary`, `abstract` or `kurzfassung`.
     *
     * Nothing is required, deliberately. A required slot would refuse to
     * publish any site that has not drawn the mapping yet, including every
     * site already running this theme, so the listing falls back to the
     * operator's own fields when a binding is absent.
     */
    contentBindings: [
      {
        id: "guides",
        name: "Guides",
        description:
          "A collection of articles to list on the site. Map the fields you want shown.",
        fields: [
          { id: "blurb", label: "Short description", type: "text" },
          { id: "byline", label: "Author", type: "reference" },
        ],
      },
      /*
       * What a destination page needs, declared rather than assumed.
       *
       * The `destination` template renders a content page as a place, and its
       * structured content arrives in that page's free-form `settings` record.
       * Free-form is how the contract carries it, not a licence to leave the
       * shape undocumented: without this binding the keys below exist only in a
       * fixture somebody hand-wrote, and an operator has nothing to map their
       * own content onto.
       *
       * The order is the order the page renders in, so an operator filling this
       * from the top produces a page that reads as intended.
       */
      {
        id: "destinations",
        name: "Destinations",
        description:
          "A place you sell. Fills the destination page: an introduction, the trips you run there, the experiences, the editorial, where to go and stay, your experts and the questions people ask.",
        fields: [
          { id: "destination-heading", label: "Page headline", type: "text" },
          { id: "destination-hero", label: "Hero photograph", type: "image" },
          { id: "destination-standfirst", label: "Standfirst", type: "text" },
          { id: "destination-intro", label: "Introduction", type: "richText" },
          { id: "destination-cta", label: "Introduction button", type: "reference" },
          { id: "destination-trips", label: "Trips", type: "reference" },
          { id: "destination-trips-all", label: "All trips link", type: "text" },
          { id: "destination-experiences", label: "Experiences", type: "reference" },
          { id: "destination-stories", label: "Editorial blocks", type: "reference" },
          { id: "destination-places", label: "Where to go", type: "reference" },
          { id: "destination-stays", label: "Where to stay", type: "reference" },
          { id: "destination-stays-all", label: "All stays link", type: "text" },
          { id: "destination-experts", label: "Experts", type: "reference" },
          { id: "destination-expert-note", label: "Expert note", type: "text" },
          { id: "destination-questions", label: "Questions", type: "reference" },
          { id: "destination-siblings", label: "Other destinations", type: "reference" },
          { id: "destination-enquiry", label: "Enquiry link", type: "text" },
        ],
      },
    ],
  },
  // Fixtures back local development and the deterministic build. They are never
  // served on a published hostname: the runtime resolves real content from the
  // publication snapshot and fails closed if those bindings are incomplete.
  fixtures: {
    home: {
      kind: "home",
      path: "/",
      locale: "en",
      site: { name: "Bucharest" },
      navigation: fixtureNavigation,
      settings: chromeSettings,
      menus: chromeMenus,
      title: "Bucharest",
      seo: {
        title: "Bucharest",
        description: "A calm, fixture-backed introduction to the Bucharest theme.",
      },
      openGraph: {
        title: "Bucharest",
        description: "A calm, fixture-backed introduction to the Bucharest theme.",
      },
      sections: [
        {
          type: "hero",
          data: {
            id: "home-hero",
            settings: {
              alignment: "left",
              body: "<p>A flexible reference theme for stories, collections, and carefully composed pages.</p>",
              "color-scheme": "light",
              eyebrow: "Voyant reference theme",
              heading: "Travel stories, given room to breathe",
              height: 520,
              image:
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop",
              "image-alt":
                "A wooden rowing boat on a turquoise mountain lake beneath forested peaks",
            },
            blocks: [
              {
                id: "home-hero-about",
                type: "link",
                settings: { label: "About this theme", page: "/pages/about", style: "solid" },
              },
            ],
          },
        },
        {
          /*
           * The vertical-aware search, placed where an operator would put it:
           * directly under the hero, because it is the first question a
           * traveller arrives with and the last thing they should have to hunt
           * for.
           */
          type: "travel-search",
          data: {
            id: "home-travel-search",
            settings: {
              eyebrow: "Plan with live availability",
              heading: "Search the whole journey",
              introduction:
                "Compare holidays, escorted tours, hotels, experiences, cruises and flights, then put them together as one trip.",
              "initial-vertical": "packages",
              tone: "canvas",
            },
            blocks: [],
          },
        },
        {
          type: "feature-grid",
          data: {
            id: "home-features",
            settings: {
              columns: 3,
              heading: "Built for useful beginnings",
              introduction: "Start with a clear hierarchy, then let the published content do the talking.",
              "show-dividers": true,
            },
            blocks: [
              {
                id: "home-feature-sections",
                type: "feature",
                settings: {
                  description: "Compose a homepage from reusable, operator-authored sections.",
                  title: "Flexible sections",
                },
              },
              {
                id: "home-feature-content",
                type: "feature",
                settings: {
                  description: "Present content without binding the theme to one site's field names.",
                  title: "Portable content",
                },
              },
              {
                id: "home-feature-presentation",
                type: "feature",
                settings: {
                  description: "Keep presentation choices bounded, predictable, and accessible.",
                  title: "Considered defaults",
                },
              },
            ],
          },
        },
        {
          type: "callout",
          data: {
            id: "home-callout",
            settings: {
              background: "#e7efe9",
              body: "<p>The same templates render fixture content locally and immutable publication contexts in production.</p>",
              heading: "One theme, authored many ways",
              label: "Read about the theme",
              page: "/pages/about",
            },
            blocks: [],
          },
        },
        {
          type: "journey-cards",
          data: {
            id: "home-journeys",
            settings: {
              eyebrow: "This season",
              heading: "Itineraries leaving soon",
              introduction:
                "Each one is a starting point. We take it apart and rebuild it around your dates.",
              layout: "feature-first",
              tone: "sunk",
              label: "All itineraries",
              page: "/tours",
            },
            blocks: [
              {
                id: "journey-migration",
                type: "journey",
                settings: {
                  title: "The Great Migration, end to end",
                  region: "Kenya & Tanzania",
                  meta: "Sixteen days following the herds from the Serengeti to the Mara, with two nights in a camp that moves when they do.",
                  price: "From £8,400 per person",
                  badge: "Flagship",
                  image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "An open safari vehicle on the plains at sunset",
                  page: "/tours",
                },
              },
              {
                id: "journey-bhutan",
                type: "journey",
                settings: {
                  title: "Bhutan: the high passes",
                  region: "The Himalaya",
                  meta: "11 days · Small group",
                  price: "From £6,150",
                  image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "Snow-covered Himalayan peaks above a hillside stupa",
                  page: "/tours",
                },
              },
              {
                id: "journey-thailand",
                type: "journey",
                settings: {
                  title: "Northern Thailand by back road",
                  region: "Thailand",
                  meta: "12 days · Private",
                  price: "From £4,280",
                  image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "Gilded temple spires against a bright sky",
                  page: "/tours",
                },
              },
              {
                id: "journey-rockies",
                type: "journey",
                settings: {
                  title: "The Rockies in early autumn",
                  region: "Canada",
                  meta: "10 days · Self-drive",
                  price: "From £3,940",
                  image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "A still turquoise lake below the Canadian Rockies at sunset",
                  page: "/tours",
                },
              },
            ],
          },
        },
        {
          type: "destination-grid",
          data: {
            id: "home-destinations",
            settings: {
              eyebrow: "Where we work",
              heading: "Places we know by name",
              introduction:
                "Not a catalogue. These are the places our own people live in and travel through.",
              layout: "mosaic",
            },
            blocks: [
              {
                id: "place-africa",
                type: "place",
                settings: {
                  title: "East Africa",
                  meta: "14 journeys",
                  image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "A giraffe silhouetted beneath an acacia at dusk",
                  page: "/tours",
                },
              },
              {
                id: "place-cyclades",
                type: "place",
                settings: {
                  title: "The Cyclades",
                  meta: "9 journeys",
                  image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "A whitewashed alley opening onto deep blue Aegean sea",
                  page: "/tours",
                },
              },
              {
                id: "place-japan",
                type: "place",
                settings: {
                  title: "Japan",
                  meta: "11 journeys",
                  image: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "A narrow Tokyo alley lit by paper lanterns at night",
                  page: "/tours",
                },
              },
            ],
          },
        },
        {
          type: "alternating-features",
          data: {
            id: "home-why",
            settings: {
              eyebrow: "How we differ",
              heading: "Why people come back to us",
              introduction: "Two things unusual enough to be worth saying plainly.",
              layout: "timeline",
              spacing: "roomy",
            },
            blocks: [
              {
                id: "why-handwritten",
                type: "feature",
                settings: {
                  label: "Written by hand",
                  title: "No two itineraries are the same",
                  description:
                    "Every journey is drafted from scratch by the person who will look after you. There is no template underneath it.",
                  image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "A camera, binoculars and notebook laid out on a desk",
                },
              },
              {
                id: "why-seen",
                type: "feature",
                settings: {
                  label: "Rooms we have slept in",
                  title: "We only sell what we have seen",
                  description:
                    "Every property on the list visited in the last three years by someone on this staff.",
                  image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1600&q=80&auto=format&fit=crop",
                  "image-alt": "Loungers on an infinity terrace above a hazy valley",
                },
              },
            ],
          },
        },
        {
          type: "stat-band",
          data: {
            id: "home-figures",
            settings: { layout: "bordered", tone: "accent", spacing: "tight" },
            blocks: [
              { id: "stat-years", type: "stat", settings: { value: "51", label: "Years arranging journeys" } },
              { id: "stat-guides", type: "stat", settings: { value: "140", label: "Guides on long-term contracts" } },
              { id: "stat-countries", type: "stat", settings: { value: "26", label: "Countries we work in" } },
              { id: "stat-return", type: "stat", settings: { value: "71%", label: "Of guests travel with us again" } },
            ],
          },
        },
        {
          type: "quote-feature",
          data: {
            id: "home-quote",
            settings: {
              layout: "over-image",
              quote:
                "They rewrote four days of the trip overnight because the rains came early. We only found out afterwards that anything had changed.",
              author: "Marianne Iversen",
              role: "Serengeti and the Ngorongoro Crater, March",
              image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80&auto=format&fit=crop",
              "image-alt": "A lone acacia against a red sunset on an open plain",
            },
            blocks: [],
          },
        },
        {
          type: "gallery",
          data: {
            id: "home-gallery",
            settings: {
              eyebrow: "Sent in by travellers",
              heading: "Photographs from the last twelve months",
              layout: "mosaic",
              caption: "Guest photographs, published with permission.",
            },
            blocks: [
              { id: "shot-elephant", type: "photograph", settings: { image: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1600&q=80&auto=format&fit=crop", "image-alt": "An elephant crossing golden grassland" } },
              { id: "shot-camp", type: "photograph", settings: { image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1600&q=80&auto=format&fit=crop", "image-alt": "A lit tent beneath the Milky Way in the desert" } },
              { id: "shot-railay", type: "photograph", settings: { image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=80&auto=format&fit=crop", "image-alt": "Longtail boats moored below limestone cliffs" } },
              { id: "shot-peaks", type: "photograph", settings: { image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format&fit=crop", "image-alt": "A mountain range rising above a sea of cloud at sunrise" } },
            ],
          },
        },
        {
          type: "faq",
          data: {
            id: "home-faq",
            settings: {
              eyebrow: "Before you ask",
              heading: "The questions we are asked most",
              introduction: "If yours is not here, telephone us. Nobody on this staff works to a script.",
              layout: "side-heading",
            },
            blocks: [
              {
                id: "faq-when",
                type: "question",
                settings: {
                  question: "How far ahead should we book?",
                  answer: "<p>For East Africa in the migration months, ten to twelve months. For most of Europe, four is plenty.</p>",
                },
              },
              {
                id: "faq-protection",
                type: "question",
                settings: {
                  question: "Is my money protected?",
                  answer: "<p>Every payment sits in a trust account until you travel, including the deposit.</p>",
                },
              },
              {
                id: "faq-fee",
                type: "question",
                settings: {
                  question: "Do you charge a planning fee?",
                  answer: "<p>No. We are paid by the properties we book, at rates that do not change with what we recommend.</p>",
                },
              },
            ],
          },
        },
        {
          type: "newsletter",
          data: {
            id: "home-newsletter",
            settings: {
              eyebrow: "The dispatch",
              heading: "Six letters a year, and nothing else",
              introduction:
                "Where our guides are going in the quiet season, and when the flights are worth booking.",
              layout: "split",
              image: "https://images.unsplash.com/photo-1590523278191-995cbcda646b?w=1600&q=80&auto=format&fit=crop",
              "image-alt": "A hammock strung between palms on a beach at sunset",
              note: "We have never sold a mailing list and never will.",
            },
            blocks: [],
          },
        },
      ],
      live: {
        capabilities: [
          {
            id: "shopping.search.v1",
            available: true,
            methods: ["POST"],
            endpoint: PUBLIC_API_PATHS.shoppingSearch,
          },
          {
            id: "shopping.trip-selections.v1",
            available: true,
            methods: ["POST", "PATCH"],
            endpoint: PUBLIC_API_PATHS.tripSelections,
          },
          {
            id: "shopping.trip-booking.v1",
            available: true,
            methods: ["POST"],
            endpoint: PUBLIC_API_PATHS.tripSelectionBook,
          },
        ],
      },
    },
    content: [
      /*
       * Every page the chrome links to, published as a fixture.
       *
       * Before this, thirty-eight links across the header, the footer, the mega
       * menu and the destination pages all pointed at `/pages/about`. Nothing
       * 404'd, so no link checker complained, and the theme was reviewed with a
       * navigation that looked complete and went nowhere — the worst kind of
       * dead link, because it survives every automated check.
       *
       * Written through `page()` rather than by hand: repeating `site`,
       * `navigation`, `settings` and `menus` across twenty-eight objects is how
       * one page quietly ends up without a footer, which is the same failure
       * `chromeSettings` was hoisted to prevent.
       */
      page(
        "/pages/about",
        "About us",
        "A Romanian agency, fifty years old, that still writes every itinerary in-house.",
        "We have been arranging journeys out of Bucharest since 1974, first as a state office and, since 1991, as an independent agency. Three hundred and forty people now work across 86 branches, from Timișoara to Constanța, and every itinerary we sell is written by one of them rather than bought in from a wholesaler. We hold our own contracts with the guesthouses, hoteliers and guides we use, which is why we can rearrange a trip after it has already started. There is no head-office script: the consultant who answers you is the one who signs off your booking.",
        "Fifty years of arranging travel from Romania: 86 branches, 340 staff, and every itinerary written in-house by the person who will look after you.",
      ),
      page(
        "/pages/why-us",
        "Why book with us",
        "Five reasons to book through an agency, and what each one actually gets you.",
        "You get one named consultant from the first email to the last transfer, and their direct line for the whole time you are away. We only sell hotels somebody on this staff has slept in within the last three years, and we say so on the page when a property is new to us. Your money sits behind an insolvency policy filed with the ministry, and its number is at the foot of every page on this site. When something goes wrong at two in the morning, the emergency line is answered in Bucharest by a duty officer who can actually move you.",
        "One named consultant, hotels we have slept in ourselves, and an emergency line answered in Bucharest. What booking through an agency is still for.",
      ),
      page(
        "/pages/our-guides",
        "Our guides",
        "The people who take you round: local, salaried, and on the same route year after year.",
        "We keep 140 guides on long-term contracts rather than hiring per departure, which is why the same person meets our groups in Sibiu every May. They are licensed, and most of them live within an hour of the route they lead. Guides are paid by us and never on commission from the shops or restaurants they take you to, so nobody has a reason to stop where you would rather not. If you would like a particular guide, say so when you book and we can usually arrange it.",
        "140 guides on long-term contracts, licensed, local, and never paid commission by the places they take you. Ask for one by name when you book.",
      ),
      page(
        "/pages/awards",
        "Awards",
        "What the trade and our travellers have given us, and how much any of it is worth.",
        "We have taken the tour operator of the year award three times, most recently in 2025, and a jury prize for the Transylvania walking programme. Travellers rate us 4.8 out of 5 across 11,400 reviews, and we publish the one-star ones alongside the rest because an average with nothing behind it is worthless. Awards are pleasant, but they are not a reason to book with anybody. Read the reviews written in the month you intend to travel instead.",
        "Three tour operator of the year awards, a jury prize for our walking programme, and 11,400 reviews published in full, poor ones included.",
      ),
      page(
        "/pages/careers",
        "Careers",
        "Vacancies in the branches, in operations, and on the road with our groups.",
        "We are usually recruiting travel consultants for the Bucharest, Cluj-Napoca and Iași branches, and seasonal guides for spring in Transylvania and the Delta. Consultants are salaried rather than paid on commission, because a consultant paid per booking sells the wrong holiday. Everyone travels two weeks a year on our own programmes at our expense, and that is written into the contract rather than promised at interview. Send a CV to the address on our contact page and tell us where you have been.",
        "Salaried consultants, seasonal guides, and two weeks a year travelling on our own programmes, written into the contract. Current vacancies here.",
      ),
      page(
        "/pages/branches",
        "Our 86 branches",
        "Where to find us in person across Romania, and what you can do at the counter.",
        "We keep 86 branches open across the country, most of them on a high street rather than in a shopping centre, all staffed by consultants selling the same programmes you see on this site. Standard hours are Monday to Friday from 9am to 7pm and Saturday from 10am to 2pm; the airport desks open earlier. At the counter you can pay by card or arrange a transfer, collect documents, and hand over a passport for a visa application. Ring ahead if you want a particular consultant, because in the smaller towns they cover more than one branch.",
        "86 high-street branches open six days a week, where you can pay, collect documents, or leave a passport for a visa application in person.",
      ),
      page(
        "/pages/contact",
        "Contact",
        "How to reach us before, during and after a trip, including the 24-hour line.",
        "Reservations are answered on +40 21 000 0000 from 9am to 7pm on weekdays and until 2pm on Saturdays, and by email at any hour. If you are already travelling, use the emergency number printed on your travel documents: it rings in Bucharest and a duty officer picks it up, not a call centre. Complaints go to the same address and are acknowledged within two working days, as our terms require. Our registered office is on Bd. Nicolae Bălcescu and visitors are welcome without an appointment.",
        "Reservations, emergencies and complaints: which numbers are answered when, and who picks up the phone at two o'clock in the morning.",
      ),
      page(
        "/pages/corporate",
        "Corporate travel",
        "Managed business travel, incentives and conference logistics for Romanian companies.",
        "We look after travel for 240 companies, from a two-person consultancy booking a single flight to a manufacturer moving 400 people to a conference. You get a dedicated account team, negotiated hotel and airline rates, and monthly reporting in whatever format your finance department asks for. Approval rules, cost centres and traveller policy are set once and then enforced at the point of booking rather than argued about afterwards. Out of hours, your travellers reach the same duty officer as everybody else.",
        "Managed business travel for 240 companies: negotiated rates, policy enforced at the point of booking, monthly reporting, and cover out of hours.",
      ),
      page(
        "/pages/agent-programme",
        "Agent programme",
        "How independent agents sell our programmes on commission, without a minimum.",
        "Independent agents and smaller agencies can sell our escorted tours, holidays and cruises on standard commission, with no minimum volume and no joining fee. You get live availability and pricing through the extranet, a named support consultant who knows your bookings, and the same emergency cover we give our own branches. Commission is settled monthly on departure rather than on deposit, so the statement matches what has actually travelled. Registration takes a day once we have seen your licence and your insolvency certificate.",
        "Sell our tours, holidays and cruises on commission with no minimum volume: live pricing, a named support consultant, and monthly settlement.",
      ),
      page(
        "/pages/affiliates",
        "Affiliates",
        "Earn commission by linking to our programmes from your own site or newsletter.",
        "Publishers, writers and comparison sites can join the affiliate programme and earn commission on travel that actually happens rather than on clicks. Tracking runs for ninety days from the first visit, attributed on a last-click basis, and the dashboard shows bookings the day they are made. We supply deep links, a feed of every departure with live prices, and photography we hold the licence to. There is no exclusivity clause and you can leave on a month's notice.",
        "Commission on completed travel, ninety-day tracking, a live departure feed and licensed photography. No exclusivity, and a month's notice to leave.",
      ),
      page(
        "/pages/extranet",
        "Partner extranet",
        "The booking system registered agents and corporate accounts sign in to.",
        "The extranet carries live availability and net pricing for everything we operate, together with your commission statements, passenger manifests and the documents for every booking you hold. Sign-in is by the email address we registered, with a second factor by SMS or an authenticator app. Access is granted to licensed agencies and to corporate clients with an account team; if you have lost your credentials, your support consultant can reset them the same day. The system is unavailable between 3am and 4am on Sundays for maintenance.",
        "Live net pricing, manifests, documents and commission statements for registered agents. Two-factor sign-in, same-day credential resets.",
      ),
      page(
        "/pages/brochures",
        "Brochures",
        "Download the current brochures, or ask any branch to post one to you.",
        "We publish four brochures a year: summer holidays, escorted tours, cruises, and winter in the mountains. Each is a PDF you can download now, and the prices in it hold until the date printed on the back cover, after which this site is the authority. If you would rather have a printed copy, any branch will hand you one or we will post it within three working days. Last year's editions stay online for twelve months so you can check what was promised at the time you booked.",
        "Four brochures a year as PDFs or by post, with the price validity date on the back cover and last year's editions kept online for reference.",
      ),
      page(
        "/pages/travel-information",
        "Travel information",
        "Baggage, transfers, check-in times and what happens on the day you fly.",
        "Charter flights carry 20kg of hold baggage and 5kg of cabin baggage unless your confirmation says otherwise; scheduled flights follow the airline's own rules, which we print on your documents. Transfers are included in every package and the representative meets you in arrivals holding our sign. Check-in closes 40 minutes before departure at Otopeni and can close earlier at the regional airports. If a flight is delayed by more than three hours, ring the emergency number before you make arrangements of your own.",
        "Baggage allowances, airport transfers, check-in deadlines, and what to do about a delayed flight before you start spending your own money.",
      ),
      page(
        "/pages/travel-documents",
        "Travel documents",
        "Passports, identity cards, visas, and what we send you before you go.",
        "For travel inside the EU a valid Romanian identity card is enough; everywhere else needs a passport, and many countries want six months' validity beyond your return date. We tell you which rule applies when you book and again on your documents, but holding the right papers remains your responsibility. Vouchers, flight details and insurance certificates are emailed seven days before departure and also appear in your account. Children travelling without both parents need a notarised declaration, and the border police do check for it.",
        "Identity card or passport, six months' validity, notarised declarations for children: what you must hold, and when your documents reach you.",
      ),
      page(
        "/pages/pay-monthly",
        "Pay monthly",
        "Spread the cost of a holiday over instalments, interest-free before departure.",
        "Any booking over €500 can be paid in instalments: 25% when you book, then equal monthly payments up to 30 days before departure, with no interest and no fee. Longer terms that run past your return are arranged through our partner bank and are a credit agreement with its own rate, shown in full before you sign anything. Missing an instalment does not cancel your holiday automatically — we ring you first. Paying monthly is available in branch and online, and it does not change the price of the trip.",
        "25% deposit, then interest-free monthly payments until 30 days before you travel. Longer terms through our partner bank, with the rate shown up front.",
      ),
      page(
        "/pages/insurance",
        "Travel insurance",
        "Medical and cancellation cover, and the things a European health card does not do.",
        "We sell medical and cancellation policies underwritten by an insurer authorised in Romania, and you are free to arrange cover elsewhere provided you tell us who with. The European Health Insurance Card pays for state treatment inside the EU but not for repatriation, a private clinic, or a missed flight home, which is what a medical policy is for. Cancellation cover has to be bought within 48 hours of paying your deposit if it is to include pre-existing conditions. Read the exclusions before you buy: we will send them, and nobody here earns a bonus for selling you a policy.",
        "Medical and cancellation cover underwritten in Romania, why a European health card is not enough, and the 48-hour rule for existing conditions.",
      ),
      page(
        "/pages/insolvency-cover",
        "Insolvency cover",
        "The policy that refunds you and brings you home if this agency ever fails.",
        "Every package we sell is protected against our insolvency, as required by Romanian G.O. 2/2018, which transposes Directive (EU) 2015/2302 into national law. If we became insolvent the policy refunds payments made for travel not yet taken, and pays for repatriation if you are already abroad. The insurer's name, the policy number and the dates it runs between are printed in the footer of every page on this site, so you can check them before you pay rather than afterwards. Claims are made directly to the insurer, and we are required to keep the cover in force for as long as we hold your money.",
        "Payments and repatriation are covered under G.O. 2/2018 and Directive (EU) 2015/2302 — insurer, policy number and validity are shown in the footer.",
      ),
      page(
        "/pages/changes-and-cancellations",
        "Changes and cancellations",
        "What a change costs, what a cancellation costs, and when neither costs anything.",
        "Names, dates and room types can usually be changed up to 30 days before departure for an administration fee plus whatever the airline or hotel charges; inside 30 days a change is treated as a cancellation and a fresh booking. Cancellation charges rise on a published scale set out in our terms and repeated on your confirmation, so you can always see what today would cost. You may cancel without charge if we make a significant change to the package, or if unavoidable and extraordinary circumstances at the destination make travel impossible — that is your right under G.O. 2/2018. Ring us before you cancel: a change is very often cheaper than you expect.",
        "The published scale of cancellation charges, when amending beats cancelling, and the cases where the law lets you cancel without paying a penny.",
      ),
      page(
        "/pages/traveller-rights",
        "Traveller rights",
        "The standard information about your rights when you buy a package holiday.",
        "The combination of travel services offered on this site is a package within the meaning of Directive (EU) 2015/2302, transposed in Romania by G.O. 2/2018, so every right that attaches to a package attaches to your booking. We are fully responsible for the proper performance of the package as a whole, not only for the parts we operate ourselves, and we must give you assistance if you get into difficulty. You will receive all the essential information before you sign, the price may rise only in the limited circumstances the law allows, and you may transfer the booking to another traveller at reasonable notice. Your payments are protected against our insolvency, and the insurer and policy number appear in the footer of every page.",
        "Your rights under Directive (EU) 2015/2302 and G.O. 2/2018: one responsible organiser, limited price rises, transfers, assistance, insolvency cover.",
      ),
      page(
        "/pages/terms",
        "Terms and conditions",
        "The contract between you and us when you book a package or a single service.",
        "A contract exists once we confirm your booking in writing and you have paid the deposit; that confirmation, these terms and the description of the package together form the agreement. The price may be increased only in the circumstances G.O. 2/2018 allows, never later than 20 days before departure, and a rise of more than 8% gives you the right to withdraw with a full refund. You must tell us about a problem while you are still at the destination so that we have the chance to put it right, and you keep your right to a price reduction or compensation where we cannot. Romanian law governs the contract, and a complaint we fail to settle may be taken to ANPC or to the alternative dispute body named in our consumer information.",
        "When the contract is formed, the 8% ceiling on price rises, how to report a problem on the spot, and where a complaint goes if we cannot settle it.",
      ),
      page(
        "/pages/privacy",
        "Privacy policy",
        "What we hold about you, why we hold it, for how long, and how to get it deleted.",
        "We process your name, contact details, date of birth and passport data because a booking cannot be made without them, and we pass them only to the airlines, hoteliers and insurers involved in your trip. Special-category information such as a dietary or accessibility need is used solely to arrange what you asked for and is deleted once the trip ends. Booking records are kept for ten years because accounting and tourism law require it; marketing consent lasts until you withdraw it, which you can do from any letter we send. You may ask for a copy of everything we hold, ask us to correct it, or complain to the supervisory authority, and our data protection officer replies within 30 days.",
        "The data a booking genuinely needs, who it reaches, why records are kept ten years, and how to obtain a copy, a correction or an erasure.",
      ),
      page(
        "/pages/cookies",
        "Cookie policy",
        "The cookies this site sets, what each of them does, and how to refuse them.",
        "Essential cookies hold your search, your currency and your basket together and cannot be switched off, because without them the site cannot complete a booking. Analytics cookies tell us which pages people abandon, and marketing cookies let us measure which advertisement led to a booking; neither is set until you accept them. You can change your mind at any time from the cookie settings link in the footer, and refusing everything except the essential ones leaves the site fully usable. We do not sell what these cookies collect, and none of them tries to follow you across other people's websites.",
        "Which cookies are essential, which wait for your consent, how to change your mind later, and why refusing the optional ones costs you nothing.",
      ),
      page(
        "/pages/enquiry",
        "Request a quote",
        "Tell us roughly what you want and a consultant writes back with a costed plan.",
        "Send us your dates, the number of travellers and a sentence about what the trip is for, and one of our consultants will come back within one working day with a costed itinerary. Nothing is charged for this and nothing is held, so there is no reason to have made your mind up first. If it is easier to talk, ask for a call and we will ring at a time you choose, evenings included. The consultant who answers your enquiry is the one who looks after the booking from beginning to end.",
        "A costed itinerary within one working day from the consultant who will handle the booking. No charge, no obligation, and evening calls if that suits.",
      ),
      page(
        "/pages/my-account",
        "My account",
        "Sign in to see your bookings, download documents, and pay an instalment.",
        "Your account holds every booking you have made with us, the documents that go with each one, and the balance still to pay. You can download vouchers and insurance certificates, add passport details, pay an instalment by card, and see the cancellation charge that would apply if you cancelled today. Sign-in is by the email address on the booking; if it has changed, any branch will update it once they have seen some identification. Bookings made at a counter appear here too, usually within the hour.",
        "Bookings, documents, passport details and instalments in one place, including trips booked at a counter. Sign in with the email on the booking.",
      ),
      page(
        "/pages/departure-cities",
        "Departure cities",
        "The airports our charters leave from, and how a connection is priced in.",
        "We fly charters from Bucharest Otopeni, Cluj-Napoca, Timișoara, Iași and Constanța, with the widest choice from Otopeni and the most Greek and Turkish routes from Cluj-Napoca. Departures from the regional airports usually run once or twice a week rather than daily, so the flight programme, not the hotel, decides how long the holiday is. If your city is not on the list we can add a connecting flight or a road transfer to the package and quote the whole thing as one price. The departure city is chosen at the top of the search, and the prices move with it.",
        "Charter departures from Otopeni, Cluj-Napoca, Timișoara, Iași and Constanța, and how a connecting flight is priced into the package as one figure.",
      ),
      /*
       * A destination page. It is a content page carrying `templateId:
       * "destination"`, which is the seam the contract provides: there is no
       * `destinationDetail` context, and collections have no fixture key, so
       * this is the only shape a destination can take that is both contract-
       * correct and reviewable locally.
       *
       * On a real publication the platform resolves the template from the
       * operator's own assignment rules and publishes only its id. The fixture
       * states it directly so the local build renders what an operator would.
       */
      {
        ...page(
          "/pages/transylvania",
          "Transylvania",
          "Saxon villages, ridge tracks, and meals that run on into the evening.",
          "Transylvania is best seen slowly, in short stages, from village guesthouses.",
          "Saxon villages, fortified churches and gentle ridge walking, arranged slowly and led by guides who live on the route. Trips from €310.",
        ),
        templateId: "destination",
        settings: { ...chromeSettings, ...transylvania },
        seo: {
          title: "Transylvania, taken slowly",
          description:
            "Saxon villages, fortified churches and gentle ridge walking, arranged slowly and led by guides who live on the route. Trips from €310.",
        },
      },
      /* The sparse case, on the same template. See `danube` above. */
      {
        ...page(
          "/pages/danube",
          "The Danube",
          "Eight countries, one river, and not a day spent in an airport.",
          "You unpack once and the cities come to you, usually before breakfast.",
          "River cruising from Budapest down to the Black Sea: long port calls, free evenings, and no airport at either end. Seven nights from €1,290.",
        ),
        templateId: "destination",
        settings: { ...chromeSettings, ...danube },
        seo: {
          title: "The Danube, from Budapest to the Black Sea",
          description:
            "River cruising from Budapest down to the Black Sea: long port calls, free evenings, and no airport at either end. Seven nights from €1,290.",
        },
      },
      /*
       * The listing those two pages belong to, on the second template.
       *
       * It exists so the destination pages are reachable from something other
       * than a hand-typed URL: a place page with no index above it is a page
       * only the sitemap knows about.
       */
      {
        ...page(
          "/pages/destinations",
          "Destinations",
          "Every place we sell, grouped the way our consultants think about them.",
          "Roughly eighty places, from a weekend in the Carpathians to three weeks following the migration.",
          "Every destination we sell, grouped by region, with trip counts and starting prices — from the Carpathians to the Serengeti and the high Himalaya.",
        ),
        templateId: "destination-index",
        settings: { ...chromeSettings, ...destinationIndex },
      },

      /* --------------------------------------------------------------- */
      /* The Romanian mirror. Every page below is locale "ro" and carries  */
      /* Romanian chrome, because a page that mixes two languages is the   */
      /* failure this whole arrangement exists to remove: an English       */
      /* header over Romanian prose reads as a half-finished translation,  */
      /* and it is exactly what a switcher pointing at an English page     */
      /* used to produce.                                                  */
      /* --------------------------------------------------------------- */
      roPage(
        "/pages/ro",
        "Site-ul nostru în limba română",
        "Paginile principale, în română: cine suntem, cum rezervi și ce drepturi ai.",
        "Aici găsești, în limba română, informațiile de care ai nevoie înainte de a rezerva: cine suntem, de ce merită să rezervi printr-o agenție, unde ne găsești și ce drepturi ai atunci când cumperi un pachet de călătorie. Restul site-ului, inclusiv căutarea și paginile de produs, este în engleză. Dacă preferi să discuți în română, sună-ne sau treci pe la oricare dintre cele 86 de agenții.",
        "Paginile esențiale în limba română: despre agenție, motive de a rezerva, agențiile noastre, termenii, confidențialitatea și drepturile călătorului.",
      ),
      roPage(
        "/pages/ro/about",
        "Despre noi",
        "O agenție românească de cincizeci de ani, care își scrie singură programele.",
        "Organizăm călătorii din București din 1974, mai întâi ca oficiu de stat și, din 1991, ca agenție independentă. Astăzi lucrăm 340 de oameni în 86 de agenții, de la Timișoara la Constanța, iar fiecare program pe care îl vindem este scris de unul dintre ei, nu cumpărat de la un tour-operator străin. Avem contracte directe cu pensiunile, hotelierii și ghizii cu care lucrăm, motiv pentru care putem rearanja o călătorie chiar și după ce a început.",
        "Din 1974, 86 de agenții și 340 de colegi: programe scrise în casă, contracte directe cu gazdele și un consultant care răspunde de rezervarea ta.",
      ),
      roPage(
        "/pages/ro/why-us",
        "De ce să rezervi cu noi",
        "Cinci motive pentru care merită o agenție, și ce înseamnă fiecare în practică.",
        "Ai un singur consultant, de la primul e-mail până la ultimul transfer, și numărul lui direct cât timp ești plecat. Vindem doar hoteluri în care a dormit cineva din echipă în ultimii trei ani, iar când o unitate este nouă pentru noi scriem asta pe pagină. Banii tăi sunt acoperiți de polița de insolvabilitate, al cărei număr apare în subsolul fiecărei pagini. Iar dacă se întâmplă ceva la două noaptea, numărul de urgență este preluat la București de un coleg care chiar te poate muta.",
        "Un consultant cu nume și număr direct, hoteluri verificate de noi și o linie de urgență preluată la București. Ce face, concret, o agenție.",
      ),
      roPage(
        "/pages/ro/contact",
        "Contact",
        "Cum ne găsești înainte, în timpul și după călătorie, inclusiv numărul de urgență.",
        "Rezervările se preiau la +40 21 000 0000, de luni până vineri între 9 și 19 și sâmbăta până la 14, iar pe e-mail poți scrie oricând. Dacă ești deja plecat, folosește numărul de urgență tipărit pe documentele de călătorie: sună la București și răspunde un coleg de serviciu, nu un call center. Sesizările se trimit la aceeași adresă și le confirmăm în două zile lucrătoare. Sediul nostru este pe Bd. Nicolae Bălcescu și poți veni fără programare.",
        "Numerele care chiar se răspund, programul agenției, adresa pentru sesizări și linia de urgență disponibilă pe toată durata călătoriei.",
      ),
      roPage(
        "/pages/ro/branches",
        "Cele 86 de agenții",
        "Unde ne găsești în țară și ce poți rezolva la ghișeu.",
        "Ținem deschise 86 de agenții în toată țara, cele mai multe la stradă și nu în mall, toate cu consultanți care vând exact programele de pe acest site. Programul obișnuit este luni–vineri, 9–19, și sâmbăta 10–14; birourile din aeroporturi deschid mai devreme. La ghișeu poți plăti cu cardul sau prin transfer, poți ridica documentele și poți depune pașaportul pentru o viză. Sună înainte dacă vrei un anumit consultant, pentru că în orașele mici acoperă mai multe agenții.",
        "86 de agenții la stradă, deschise șase zile pe săptămână, unde poți plăti, ridica documente sau depune pașaportul pentru o cerere de viză.",
      ),
      roPage(
        "/pages/ro/terms",
        "Termeni și condiții",
        "Contractul dintre tine și noi la achiziția unui pachet sau a unui serviciu.",
        "Contractul există din momentul în care confirmăm rezervarea în scris și ai achitat avansul; confirmarea, acești termeni și descrierea pachetului formează împreună înțelegerea. Prețul poate fi majorat doar în situațiile permise de O.G. 2/2018, cu cel mult 20 de zile înainte de plecare, iar o creștere de peste 8% îți dă dreptul să renunți cu restituirea integrală a sumelor. Trebuie să ne anunți despre o problemă cât ești încă la destinație, ca să o putem remedia, fără să pierzi dreptul la despăgubire dacă nu reușim. Contractul este guvernat de legea română, iar o reclamație nesoluționată poate fi îndreptată către ANPC.",
        "Când se încheie contractul, limita de 8% pentru majorări, cum reclami o problemă la fața locului și unde ajunge sesizarea dacă nu o rezolvăm noi.",
      ),
      roPage(
        "/pages/ro/privacy",
        "Politica de confidențialitate",
        "Ce date păstrăm, de ce, cât timp și cum ceri ștergerea lor.",
        "Prelucrăm numele, datele de contact, data nașterii și datele din pașaport pentru că fără ele o rezervare nu se poate face, și le transmitem doar companiilor aeriene, hotelierilor și asigurătorilor implicați în călătoria ta. Informațiile sensibile, cum sunt cerințele alimentare sau de accesibilitate, sunt folosite exclusiv pentru a organiza ce ai cerut și se șterg la încheierea călătoriei. Dosarele de rezervare se păstrează zece ani, pentru că legislația contabilă și cea din turism o cer. Poți cere o copie a datelor, corectarea lor sau te poți adresa autorității de supraveghere, iar responsabilul cu protecția datelor răspunde în 30 de zile.",
        "Datele strict necesare unei rezervări, cui ajung, de ce se păstrează zece ani și cum obții o copie, o corectare sau ștergerea lor.",
      ),
      roPage(
        "/pages/ro/traveller-rights",
        "Drepturile călătorului",
        "Informarea standard privind drepturile tale la achiziția unui pachet de călătorie.",
        "Combinația de servicii de călătorie oferită pe acest site este un pachet în sensul Directivei (UE) 2015/2302, transpusă în România prin O.G. 2/2018, deci beneficiezi de toate drepturile aplicabile pachetelor. Răspundem integral pentru executarea corespunzătoare a pachetului în ansamblu, nu doar pentru serviciile pe care le prestăm noi, și avem obligația să îți acordăm asistență dacă ajungi în dificultate. Primești toate informațiile esențiale înainte de semnare, prețul poate crește doar în situațiile limitate prevăzute de lege, iar rezervarea poate fi transferată altui călător cu un preaviz rezonabil. Plățile sunt protejate împotriva insolvabilității noastre, iar asigurătorul și numărul poliței apar în subsolul fiecărei pagini.",
        "Drepturile tale conform Directivei (UE) 2015/2302 și O.G. 2/2018: un singur organizator responsabil, majorări limitate, transfer, asistență, insolvabilitate.",
      ),
      roPage(
        "/pages/ro/enquiry",
        "Cere ofertă",
        "Spune-ne aproximativ ce îți dorești și primești un plan cu preț în 24 de ore.",
        "Trimite-ne datele călătoriei, câte persoane sunteți și o frază despre ocazie, iar unul dintre consultanții noștri revine într-o zi lucrătoare cu un itinerariu și un preț. Nu costă nimic și nu blocăm nimic, așa că nu e nevoie să te fi hotărât dinainte. Dacă îți e mai ușor să vorbim, cere un telefon și sunăm la ora pe care o alegi, inclusiv seara. Consultantul care îți răspunde este cel care se ocupă de rezervare de la început până la sfârșit.",
        "Un itinerariu cu preț într-o zi lucrătoare, de la consultantul care se va ocupa de rezervare. Gratuit, fără obligații, cu telefon și seara.",
      ),
    ],
    tourIndex: {
      kind: "tourIndex",
      path: "/tours",
      locale: "en",
      site: { name: "Bucharest" },
      navigation: fixtureNavigation,
      settings: chromeSettings,
      menus: chromeMenus,
      title: "Tours",
      seo: {
        title: "Small-group tours",
        description: "Thoughtful journeys with time to look around.",
      },
      products: [
        {
          id: "prod_transylvania",
          slug: "transylvania-on-foot",
          name: "Transylvania on foot",
          shortDescription:
            "Seven unhurried days between Saxon villages and the Carpathian foothills.",
          bookingMode: "itinerary",
          capacityMode: "limited",
          categories: [
            {
              id: "cat_walking",
              name: "Walking",
              slug: "walking",
            },
          ],
          tags: [{ id: "tag_small_group", name: "Small group" }],
          destinations: [
            {
              id: "dest_transylvania",
              name: "Transylvania",
              slug: "transylvania",
              coverMedia: { id: "media_dest_transylvania", mediaType: "image", name: "Brasov rooftops", url: "https://images.unsplash.com/photo-1754836982329-92ff4ac13d77?w=1600&q=80&auto=format&fit=crop", altText: "The Black Church above the red rooftops of Brașov", width: 1600, height: 1067, sortOrder: 0 },
            },
          ],
          locations: [],
          coverMedia: { id: "media_transylvania_cover", mediaType: "image", name: "Carpathian foothills", url: "https://images.unsplash.com/photo-1700589448574-959c56eceb4c?w=1600&q=80&auto=format&fit=crop", altText: "Wooded Carpathian foothills above a village in autumn", width: 1600, height: 1067, sortOrder: 0 },
          media: [{ id: "media_transylvania_house", mediaType: "image", name: "Saxon village house", url: "https://images.unsplash.com/photo-1597834777623-acd73456aca1?w=1600&q=80&auto=format&fit=crop", altText: "A wooden village house among green trees", width: 1600, height: 1067, sortOrder: 1 }, { id: "media_transylvania_field", mediaType: "image", name: "Field and church", url: "https://images.unsplash.com/photo-1707485318485-25e6b0e402cd?w=1600&q=80&auto=format&fit=crop", altText: "A large open field with a village church behind it", width: 1600, height: 1067, sortOrder: 2 }],
          features: [],
          faqs: [],
        },
      ],
      live: {
        capabilities: [
          {
            id: "catalog.search.v1",
            available: true,
            methods: ["GET"],
            endpoint: "/v1/public/theme/catalog/search",
          },
        ],
      },
    },
    tourDetail: [
      {
        kind: "tourDetail",
        path: "/tours/transylvania-on-foot",
        slug: "transylvania-on-foot",
        locale: "en",
        site: { name: "Bucharest" },
        navigation: fixtureNavigation,
        settings: chromeSettings,
        menus: chromeMenus,
        title: "Transylvania on foot",
        seo: {
          title: "Transylvania on foot",
          description:
            "A seven-day small-group walking tour through Transylvania.",
        },
        product: {
          id: "prod_transylvania",
          slug: "transylvania-on-foot",
          name: "Transylvania on foot",
          shortDescription:
            "Seven unhurried days between Saxon villages and the Carpathian foothills.",
          descriptionHtml:
            "<p>Walk old shepherd paths, stay in village guesthouses, and leave enough room in every day for a long lunch.</p>",
          bookingMode: "itinerary",
          capacityMode: "limited",
          categories: [
            {
              id: "cat_walking",
              name: "Walking",
              slug: "walking",
            },
          ],
          tags: [{ id: "tag_small_group", name: "Small group" }],
          destinations: [
            {
              id: "dest_transylvania",
              name: "Transylvania",
              slug: "transylvania",
              coverMedia: { id: "media_dest_transylvania", mediaType: "image", name: "Brasov rooftops", url: "https://images.unsplash.com/photo-1754836982329-92ff4ac13d77?w=1600&q=80&auto=format&fit=crop", altText: "The Black Church above the red rooftops of Brașov", width: 1600, height: 1067, sortOrder: 0 },
            },
          ],
          locations: [],
          coverMedia: { id: "media_transylvania_cover", mediaType: "image", name: "Carpathian foothills", url: "https://images.unsplash.com/photo-1700589448574-959c56eceb4c?w=1600&q=80&auto=format&fit=crop", altText: "Wooded Carpathian foothills above a village in autumn", width: 1600, height: 1067, sortOrder: 0 },
          media: [{ id: "media_transylvania_house", mediaType: "image", name: "Saxon village house", url: "https://images.unsplash.com/photo-1597834777623-acd73456aca1?w=1600&q=80&auto=format&fit=crop", altText: "A wooden village house among green trees", width: 1600, height: 1067, sortOrder: 1 }, { id: "media_transylvania_field", mediaType: "image", name: "Field and church", url: "https://images.unsplash.com/photo-1707485318485-25e6b0e402cd?w=1600&q=80&auto=format&fit=crop", altText: "A large open field with a village church behind it", width: 1600, height: 1067, sortOrder: 2 }],
          features: [
            {
              id: "feature_pace",
              featureType: "pace",
              title: "An unhurried pace",
              description: "Daily walks leave time for villages and meals.",
            },
          ],
          faqs: [],
          itinerary: {
            id: "itinerary_transylvania",
            name: "Seven days in Transylvania",
            days: [
              {
                id: "day_one",
                dayNumber: 1,
                title: "Brașov to the hills",
                description: "Meet the group and take the first short walk.",
                coverMedia: { id: "media_day_one", mediaType: "image", name: "Guesthouse terrace", url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1600&q=80&auto=format&fit=crop", altText: "A guesthouse terrace looking out towards the hills", width: 1600, height: 1067, sortOrder: 0 },
                services: [],
              },
            ],
          },
        },
        live: {
          capabilities: [
            {
              id: "catalog.pricing.v1",
              available: true,
              methods: ["POST"],
              endpoint: "/v1/public/theme/catalog/pricing",
            },
            {
              id: "catalog.availability.v1",
              available: true,
              methods: ["POST"],
              endpoint: "/v1/public/theme/catalog/availability",
            },
          ],
        },
      },
      /*
       * A hotel, on the same route and the same context as the tour above.
       * `bookingMode: "stay"` is the only thing that differs structurally, and
       * it is what the product template branches on — so this fixture is the
       * proof that one template serves both, and the only way to exercise the
       * rates path locally while the pricing capability is unreachable.
       */
      {
        kind: "tourDetail",
        path: "/tours/hotel-mara-sinaia",
        slug: "hotel-mara-sinaia",
        locale: "en",
        site: { name: "Bucharest" },
        navigation: fixtureNavigation,
        settings: chromeSettings,
        menus: chromeMenus,
        title: "Hotel Mara, Sinaia",
        seo: {
          title: "Hotel Mara, Sinaia",
          description: "A four-star hotel on the Prahova valley, minutes from Peleș.",
        },
        product: {
          id: "prod_hotel_mara",
          slug: "hotel-mara-sinaia",
          name: "Hotel Mara, Sinaia",
          shortDescription:
            "Four stars on the Prahova valley, ten minutes from Peleș Castle.",
          descriptionHtml:
            "<p>A mountain hotel with a spa and a restaurant of its own, at the edge of the forest and a short walk from the cable car.</p>",
          bookingMode: "stay",
          capacityMode: "free_sale",
          productType: {
            id: "ptype_stay",
            code: "sejur",
            name: "Holiday",
          },
          categories: [{ id: "cat_mountain", name: "Mountains", slug: "munte" }],
          tags: [{ id: "tag_spa", name: "Spa" }],
          destinations: [
            {
              id: "dest_sinaia",
              name: "Sinaia",
              slug: "sinaia",
              coverMedia: { id: "media_dest_sinaia", mediaType: "image", name: "Carpathian foothills", url: "https://images.unsplash.com/photo-1700589448574-959c56eceb4c?w=1600&q=80&auto=format&fit=crop", altText: "Wooded Carpathian foothills above a village in autumn", width: 1600, height: 1067, sortOrder: 0 },
            },
          ],
          locations: [],
          coverMedia: { id: "media_mara_cover", mediaType: "image", name: "Hotel among the trees", url: "https://images.unsplash.com/photo-1597834777623-acd73456aca1?w=1600&q=80&auto=format&fit=crop", altText: "A wooden building among green trees", width: 1600, height: 1067, sortOrder: 0 },
          media: [{ id: "media_mara_room", mediaType: "image", name: "Double room", url: "https://images.unsplash.com/photo-1731336250970-dc942b5e0746?w=1600&q=80&auto=format&fit=crop", altText: "A bed made up beside a window", width: 1600, height: 1067, sortOrder: 1 }, { id: "media_mara_view", mediaType: "image", name: "The valley below", url: "https://images.unsplash.com/photo-1707485318485-25e6b0e402cd?w=1600&q=80&auto=format&fit=crop", altText: "A wide open field with a church behind it", width: 1600, height: 1067, sortOrder: 2 }],
          features: [
            { id: "feat_mara_inc", featureType: "included", title: "Buffet breakfast", description: "Included in the rate for every room.", sortOrder: 0 },
            { id: "feat_mara_exc", featureType: "excluded", title: "Resort tax", description: "Paid at reception, 2 lei per person per night.", sortOrder: 1 },
            { id: "feat_mara_spa", featureType: "amenity", title: "Spa and indoor pool", sortOrder: 2 },
            { id: "feat_mara_park", featureType: "amenity", title: "Free private parking", sortOrder: 3 },
            { id: "feat_mara_pets", featureType: "house_rule", title: "Pets", description: "Welcome, 50 lei per stay.", sortOrder: 4 },
          ],
          faqs: [
            { id: "faq_mara_checkin", question: "What time can we check in?", answer: "Check-in opens at 3pm and check-out is by 11am." },
          ],
        },
        live: {
          capabilities: [
            {
              id: "catalog.pricing.v1",
              available: true,
              methods: ["POST"],
              endpoint: "/v1/public/theme/catalog/pricing",
            },
            {
              id: "catalog.availability.v1",
              available: true,
              methods: ["POST"],
              endpoint: "/v1/public/theme/catalog/availability",
            },
          ],
        },
      },
      /*
       * An experience. `date_time` is the mode where the start time is part of
       * the choice, which is what separates it from `date` — a page that sells
       * this must ask for a slot, and one that sells a `date` product must not.
       */
      {
        kind: "tourDetail",
        path: "/tours/guided-walk-old-town",
        slug: "guided-walk-old-town",
        locale: "en",
        site: { name: "Bucharest" },
        navigation: fixtureNavigation,
        settings: chromeSettings,
        menus: chromeMenus,
        title: "Guided walk through the Old Town",
        seo: {
          title: "Guided walk through the Old Town",
          description: "Two and a half hours on foot through old Bucharest.",
        },
        product: {
          id: "prod_centrul_vechi",
          slug: "guided-walk-old-town",
          name: "Guided walk through the Old Town",
          shortDescription:
            "Two and a half hours on foot with a guide who knows where to stop.",
          descriptionHtml:
            "<p>We start at Piața Universității and finish at Hanul lui Manuc, on a route through courtyards you would never find on your own.</p>",
          bookingMode: "date_time",
          capacityMode: "limited",
          productType: {
            id: "ptype_activity",
            code: "experienta",
            name: "Experience",
          },
          categories: [{ id: "cat_city", name: "City break", slug: "city-break" }],
          tags: [{ id: "tag_guide", name: "Live guide" }],
          destinations: [
            {
              id: "dest_bucuresti",
              name: "Bucharest",
              slug: "bucuresti",
              coverMedia: { id: "media_dest_bucuresti", mediaType: "image", name: "Rooftops", url: "https://images.unsplash.com/photo-1754836982329-92ff4ac13d77?w=1600&q=80&auto=format&fit=crop", altText: "Church towers above red rooftops", width: 1600, height: 1067, sortOrder: 0 },
            },
          ],
          locations: [],
          coverMedia: { id: "media_cv_cover", mediaType: "image", name: "Old town at dusk", url: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=1600&q=80&auto=format&fit=crop", altText: "A lit historic building at night", width: 1600, height: 1067, sortOrder: 0 },
          media: [{ id: "media_cv_street", mediaType: "image", name: "A street in the old town", url: "https://images.unsplash.com/photo-1773016976756-df949b42cba0?w=1600&q=80&auto=format&fit=crop", altText: "A boat on the river below the city bridges", width: 1600, height: 1067, sortOrder: 1 }],
          features: [
            { id: "feat_cv_h1", featureType: "highlight", title: "Courtyards you would never find on your own", sortOrder: 0 },
            { id: "feat_cv_h2", featureType: "highlight", title: "A small group, fifteen people at most", sortOrder: 1 },
            { id: "feat_cv_inc", featureType: "included", title: "An English and Romanian speaking guide", sortOrder: 2 },
            { id: "feat_cv_exc", featureType: "excluded", title: "Anything you order at Hanul lui Manuc", sortOrder: 3 },
            { id: "feat_cv_bring", featureType: "what_to_bring", title: "Comfortable shoes", description: "Parts of the route are cobbled.", sortOrder: 4 },
            { id: "feat_cv_access", featureType: "not_suitable_for", title: "Visitors with reduced mobility", description: "The route includes steps and uneven paving.", sortOrder: 5 },
          ],
          faqs: [],
        },
        live: {
          capabilities: [
            {
              id: "catalog.availability.v1",
              available: true,
              methods: ["POST"],
              endpoint: "/v1/public/theme/catalog/availability",
            },
          ],
        },
      },
    ],
    cruiseIndex: {
      kind: "cruiseIndex",
      path: "/cruises",
      locale: "en",
      site: { name: "Bucharest" },
      navigation: cruiseNavigation,
      settings: cruiseSettings,
      menus: chromeMenus,
      title: "Cruises",
      seo: {
        title: "Voyages by sea and river",
        description: "Published cruise stories with live sailing search and managed itinerary booking.",
      },
      cruises: [
        {
          id: "cruise_danube",
          slug: "danube-cities",
          name: "Danube cities",
          shortDescription: "A week between historic capitals, quiet bends, and vineyard towns.",
          descriptionHtml: "<p>Travel the Danube at an unhurried pace, with long port calls and evenings on deck.</p>",
          coverMedia: { id: "media_danube_cover", mediaType: "image", name: "Parliament at sunset", url: "https://images.unsplash.com/photo-1761157845286-7663794fd91d?w=1600&q=80&auto=format&fit=crop", altText: "The Hungarian Parliament above the Danube at sunset", width: 1600, height: 1067, sortOrder: 0 },
          media: [{ id: "media_danube_bridge", mediaType: "image", name: "River boat below a bridge", url: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=1600&q=80&auto=format&fit=crop", altText: "A river boat passing beneath a bridge", width: 1600, height: 1067, sortOrder: 1 }, { id: "media_danube_city", mediaType: "image", name: "Boat on the river", url: "https://images.unsplash.com/photo-1773016976756-df949b42cba0?w=1600&q=80&auto=format&fit=crop", altText: "A boat on the river below the city's bridges", width: 1600, height: 1067, sortOrder: 2 }],
          ports: [
            { id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", coverMedia: { id: "media_port_budapest", mediaType: "image", name: "Chain Bridge, Budapest", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 } },
            { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", coverMedia: { id: "media_port_vienna", mediaType: "image", name: "Riverside town", url: "https://images.unsplash.com/photo-1780134758196-8206dee53f6e?w=1600&q=80&auto=format&fit=crop", altText: "A riverside town with a church spire above the water", width: 1600, height: 1067, sortOrder: 0 } },
          ],
          ships: [
            {
              id: "ship_aurora",
              slug: "aurora",
              name: "Aurora",
              cruiseLine: "Voyant River",
              launchedYear: 2025,
              deckCount: 4,
              coverMedia: { id: "media_aurora_cover", mediaType: "image", name: "Aurora moored on the Danube", url: "https://images.unsplash.com/photo-1761953743924-a31e6159d465?w=1600&q=80&auto=format&fit=crop", altText: "A river cruise ship moored on the Danube", width: 1600, height: 1067, sortOrder: 0 },
              media: [],
              cabinCategories: [
                { id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 2, deckNames: ["Upper deck"], coverMedia: { id: "media_panorama", mediaType: "image", name: "Panorama suite", url: "https://images.unsplash.com/photo-1731336250970-dc942b5e0746?w=1600&q=80&auto=format&fit=crop", altText: "A bed made up beside the cabin window", width: 1600, height: 1067, sortOrder: 0 } },
              ],
            },
          ],
          sailings: [
            {
              id: "sailing_danube_september",
              slug: "danube-september",
              name: "Danube cities in September",
              cruiseId: "cruise_danube",
              shipId: "ship_aurora",
              coverMedia: { id: "media_sailing_cover", mediaType: "image", name: "Buda Castle at night", url: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=1600&q=80&auto=format&fit=crop", altText: "Buda Castle lit above the Danube at night", width: 1600, height: 1067, sortOrder: 0 },
              media: [],
              departure: {
                startsOn: "2026-09-12",
                endsOn: "2026-09-19",
                durationNights: 7,
                embarkationPort: { id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", coverMedia: { id: "media_port_budapest", mediaType: "image", name: "Chain Bridge, Budapest", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 } },
                disembarkationPort: { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", coverMedia: { id: "media_port_vienna", mediaType: "image", name: "Riverside town", url: "https://images.unsplash.com/photo-1780134758196-8206dee53f6e?w=1600&q=80&auto=format&fit=crop", altText: "A riverside town with a church spire above the water", width: 1600, height: 1067, sortOrder: 0 } },
              },
              itinerary: {
                id: "itinerary_danube",
                name: "Seven nights on the Danube",
                days: [
                  { dayNumber: 1, title: "Budapest", coverMedia: { id: "media_cruise_day_one", mediaType: "image", name: "Chain Bridge", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 }, ports: [{ id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", coverMedia: { id: "media_port_budapest", mediaType: "image", name: "Chain Bridge, Budapest", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 } }], atSea: false },
                  { dayNumber: 2, title: "Along the Danube Bend", ports: [], atSea: true },
                ],
              },
              cabinCategories: [
                { id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 2, deckNames: ["Upper deck"], coverMedia: { id: "media_panorama", mediaType: "image", name: "Panorama suite", url: "https://images.unsplash.com/photo-1731336250970-dc942b5e0746?w=1600&q=80&auto=format&fit=crop", altText: "A bed made up beside the cabin window", width: 1600, height: 1067, sortOrder: 0 } },
              ],
            },
          ],
        },
      ],
      live: {
        capabilities: [
          { id: "cruise.search.v1", available: true, methods: ["GET"], endpoint: "/v1/public/theme/cruise/search" },
          { id: "shopping.search.v1", available: true, methods: ["POST"], endpoint: PUBLIC_API_PATHS.shoppingSearch },
          { id: "shopping.trip-selections.v1", available: true, methods: ["POST", "PATCH"], endpoint: PUBLIC_API_PATHS.tripSelections },
          { id: "shopping.trip-booking.v1", available: true, methods: ["POST"], endpoint: PUBLIC_API_PATHS.tripSelectionBook },
          { id: "booking.session.v1", available: true, methods: ["POST", "PATCH"], endpoint: PUBLIC_API_PATHS.bookingSessions },
          { id: "checkout.v1", available: true, methods: ["POST"], endpoint: PUBLIC_API_PATHS.checkoutStart },
        ],
      },
    },
    cruiseDetail: [
      {
        kind: "cruiseDetail",
        path: "/cruises/danube-cities",
        slug: "danube-cities",
        locale: "en",
        site: { name: "Bucharest" },
        navigation: cruiseNavigation,
        settings: cruiseSettings,
        menus: chromeMenus,
        title: "Danube cities",
        seo: { title: "Danube cities", description: "A seven-night river voyage from Budapest to Vienna." },
        cruise: {
          id: "cruise_danube",
          slug: "danube-cities",
          name: "Danube cities",
          shortDescription: "A week between historic capitals, quiet bends, and vineyard towns.",
          descriptionHtml: "<p>Travel the Danube at an unhurried pace, with long port calls and evenings on deck.</p>",
          coverMedia: { id: "media_danube_cover", mediaType: "image", name: "Parliament at sunset", url: "https://images.unsplash.com/photo-1761157845286-7663794fd91d?w=1600&q=80&auto=format&fit=crop", altText: "The Hungarian Parliament above the Danube at sunset", width: 1600, height: 1067, sortOrder: 0 }, media: [{ id: "media_danube_bridge", mediaType: "image", name: "River boat below a bridge", url: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=1600&q=80&auto=format&fit=crop", altText: "A river boat passing beneath a bridge", width: 1600, height: 1067, sortOrder: 1 }, { id: "media_danube_city", mediaType: "image", name: "Boat on the river", url: "https://images.unsplash.com/photo-1773016976756-df949b42cba0?w=1600&q=80&auto=format&fit=crop", altText: "A boat on the river below the city's bridges", width: 1600, height: 1067, sortOrder: 2 }], ports: [{ id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", coverMedia: { id: "media_port_budapest", mediaType: "image", name: "Chain Bridge, Budapest", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 }, media: [] }, { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", coverMedia: { id: "media_port_vienna", mediaType: "image", name: "Riverside town", url: "https://images.unsplash.com/photo-1780134758196-8206dee53f6e?w=1600&q=80&auto=format&fit=crop", altText: "A riverside town with a church spire above the water", width: 1600, height: 1067, sortOrder: 0 }, media: [] }],
          ships: [{ id: "ship_aurora", slug: "aurora", name: "Aurora", cruiseLine: "Voyant River", launchedYear: 2025, deckCount: 4, coverMedia: { id: "media_aurora_cover", mediaType: "image", name: "Aurora moored on the Danube", url: "https://images.unsplash.com/photo-1761953743924-a31e6159d465?w=1600&q=80&auto=format&fit=crop", altText: "A river cruise ship moored on the Danube", width: 1600, height: 1067, sortOrder: 0 }, media: [], cabinCategories: [{ id: "cabin_interior", slug: "interior", name: "Interior cabin", maxOccupancy: 2, deckNames: ["Main deck"] }, { id: "cabin_exterior", slug: "exterior", name: "Outside cabin with porthole", maxOccupancy: 2, deckNames: ["Main deck", "Middle deck"] }, { id: "cabin_balcon", slug: "balcon", name: "Balcony cabin", maxOccupancy: 3, deckNames: ["Middle deck"] }, { id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 4, deckNames: ["Upper deck"], coverMedia: { id: "media_panorama", mediaType: "image", name: "Panorama suite", url: "https://images.unsplash.com/photo-1731336250970-dc942b5e0746?w=1600&q=80&auto=format&fit=crop", altText: "A bed made up beside the cabin window", width: 1600, height: 1067, sortOrder: 0 } }] }],
          sailings: [{ id: "sailing_danube_september", slug: "danube-september", name: "Danube cities in September", cruiseId: "cruise_danube", shipId: "ship_aurora", coverMedia: { id: "media_sailing_cover", mediaType: "image", name: "Buda Castle at night", url: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=1600&q=80&auto=format&fit=crop", altText: "Buda Castle lit above the Danube at night", width: 1600, height: 1067, sortOrder: 0 }, media: [], departure: { startsOn: "2026-09-12", endsOn: "2026-09-19", durationNights: 7, embarkationPort: { id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", coverMedia: { id: "media_port_budapest", mediaType: "image", name: "Chain Bridge, Budapest", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 } }, disembarkationPort: { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", coverMedia: { id: "media_port_vienna", mediaType: "image", name: "Riverside town", url: "https://images.unsplash.com/photo-1780134758196-8206dee53f6e?w=1600&q=80&auto=format&fit=crop", altText: "A riverside town with a church spire above the water", width: 1600, height: 1067, sortOrder: 0 } } }, itinerary: { id: "itinerary_danube", name: "Seven nights on the Danube", days: [{ dayNumber: 1, title: "Budapest", coverMedia: { id: "media_cruise_day_one", mediaType: "image", name: "Chain Bridge", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 }, ports: [{ id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", coverMedia: { id: "media_port_budapest", mediaType: "image", name: "Chain Bridge, Budapest", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 } }], atSea: false }] }, cabinCategories: [{ id: "cabin_interior", slug: "interior", name: "Interior cabin", maxOccupancy: 2, deckNames: ["Main deck"] }, { id: "cabin_exterior", slug: "exterior", name: "Outside cabin with porthole", maxOccupancy: 2, deckNames: ["Main deck", "Middle deck"] }, { id: "cabin_balcon", slug: "balcon", name: "Balcony cabin", maxOccupancy: 3, deckNames: ["Middle deck"] }, { id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 4, deckNames: ["Upper deck"], coverMedia: { id: "media_panorama", mediaType: "image", name: "Panorama suite", url: "https://images.unsplash.com/photo-1731336250970-dc942b5e0746?w=1600&q=80&auto=format&fit=crop", altText: "A bed made up beside the cabin window", width: 1600, height: 1067, sortOrder: 0 } }] }],
        },
      },
    ],
    shipDetail: [
      {
        kind: "shipDetail", path: "/ships/aurora", slug: "aurora", locale: "en",
        site: { name: "Bucharest" }, navigation: cruiseNavigation, settings: cruiseSettings, menus: chromeMenus, title: "Aurora",
        seo: { title: "Aurora", description: "Meet the Aurora river ship." },
        ship: { id: "ship_aurora", slug: "aurora", name: "Aurora", cruiseLine: "Voyant River", launchedYear: 2025, deckCount: 4, coverMedia: { id: "media_aurora_cover", mediaType: "image", name: "Aurora moored on the Danube", url: "https://images.unsplash.com/photo-1761953743924-a31e6159d465?w=1600&q=80&auto=format&fit=crop", altText: "A river cruise ship moored on the Danube", width: 1600, height: 1067, sortOrder: 0 }, media: [], cabinCategories: [{ id: "cabin_interior", slug: "interior", name: "Interior cabin", maxOccupancy: 2, deckNames: ["Main deck"] }, { id: "cabin_exterior", slug: "exterior", name: "Outside cabin with porthole", maxOccupancy: 2, deckNames: ["Main deck", "Middle deck"] }, { id: "cabin_balcon", slug: "balcon", name: "Balcony cabin", maxOccupancy: 3, deckNames: ["Middle deck"] }, { id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 4, deckNames: ["Upper deck"], coverMedia: { id: "media_panorama", mediaType: "image", name: "Panorama suite", url: "https://images.unsplash.com/photo-1731336250970-dc942b5e0746?w=1600&q=80&auto=format&fit=crop", altText: "A bed made up beside the cabin window", width: 1600, height: 1067, sortOrder: 0 } }] },
      },
    ],
    sailingDetail: [
      {
        kind: "sailingDetail", path: "/sailings/danube-september", slug: "danube-september", locale: "en",
        site: { name: "Bucharest" }, navigation: cruiseNavigation, settings: cruiseSettings, menus: chromeMenus, title: "Danube cities in September",
        seo: { title: "Danube cities in September", description: "A published seven-night Danube itinerary." },
        sailing: { id: "sailing_danube_september", slug: "danube-september", name: "Danube cities in September", cruiseId: "cruise_danube", shipId: "ship_aurora", coverMedia: { id: "media_sailing_cover", mediaType: "image", name: "Buda Castle at night", url: "https://images.unsplash.com/photo-1699521609597-6f0a2a0e9694?w=1600&q=80&auto=format&fit=crop", altText: "Buda Castle lit above the Danube at night", width: 1600, height: 1067, sortOrder: 0 }, media: [], departure: { startsOn: "2026-09-12", endsOn: "2026-09-19", durationNights: 7, embarkationPort: { id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", coverMedia: { id: "media_port_budapest", mediaType: "image", name: "Chain Bridge, Budapest", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 } }, disembarkationPort: { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", coverMedia: { id: "media_port_vienna", mediaType: "image", name: "Riverside town", url: "https://images.unsplash.com/photo-1780134758196-8206dee53f6e?w=1600&q=80&auto=format&fit=crop", altText: "A riverside town with a church spire above the water", width: 1600, height: 1067, sortOrder: 0 } } }, itinerary: { id: "itinerary_danube", name: "Seven nights on the Danube", days: [{ dayNumber: 1, title: "Budapest", coverMedia: { id: "media_cruise_day_one", mediaType: "image", name: "Chain Bridge", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 }, ports: [{ id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", coverMedia: { id: "media_port_budapest", mediaType: "image", name: "Chain Bridge, Budapest", url: "https://images.unsplash.com/photo-1764488846358-d71c3cb9c909?w=1600&q=80&auto=format&fit=crop", altText: "The Chain Bridge across the Danube in Budapest", width: 1600, height: 1067, sortOrder: 0 } }], atSea: false }, { dayNumber: 2, title: "Along the Danube Bend", ports: [], atSea: true }] }, cabinCategories: [{ id: "cabin_interior", slug: "interior", name: "Interior cabin", maxOccupancy: 2, deckNames: ["Main deck"] }, { id: "cabin_exterior", slug: "exterior", name: "Outside cabin with porthole", maxOccupancy: 2, deckNames: ["Main deck", "Middle deck"] }, { id: "cabin_balcon", slug: "balcon", name: "Balcony cabin", maxOccupancy: 3, deckNames: ["Middle deck"] }, { id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 4, deckNames: ["Upper deck"], coverMedia: { id: "media_panorama", mediaType: "image", name: "Panorama suite", url: "https://images.unsplash.com/photo-1731336250970-dc942b5e0746?w=1600&q=80&auto=format&fit=crop", altText: "A bed made up beside the cabin window", width: 1600, height: 1067, sortOrder: 0 } }] },
      },
    ],
    notFound: {
      kind: "notFound",
      path: "/404",
      locale: "en",
      site: { name: "Bucharest" },
      navigation: fixtureNavigation,
      settings: chromeSettings,
      menus: chromeMenus,
      title: "Page not found",
      seo: { title: "Page not found", noIndex: true },
      message: "The requested page does not exist.",
    },
  },
})
