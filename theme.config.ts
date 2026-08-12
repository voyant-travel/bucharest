import { defineTheme } from "@voyant-travel/theme"
import { sections as editorialSections } from "./src/theme/sections"

export default defineTheme({
  contractVersion: "v1",
  manifest: {
    id: "bucharest",
    name: "Bucharest",
    version: "0.9.6",
    routes: [
      { id: "home", pattern: "/", context: "home" },
      { id: "content", pattern: "/pages/[...path]", context: "content" },
      { id: "tours", pattern: "/tours", context: "tourIndex" },
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
      { id: "shopping.search.v1" },
      { id: "shopping.trip-selections.v1" },
      { id: "shopping.trip-booking.v1" },
      { id: "cruise.search.v1" },
      { id: "booking.session.v1" },
      { id: "checkout.v1" },
    ],
    // Declared in the order an operator should meet them, because the editor
    // renders this list as written rather than sorting it.
    settings: [
      {
        id: "palette",
        label: "Colour palette",
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
        label: "Accent colour",
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
            label: "Colour scheme",
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
        templates: ["home"],
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
        templates: ["home"],
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
        templates: ["home"],
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
          { id: "background", label: "Background colour", type: "color", default: "#e7efe9" },
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
        templates: ["home"],
      },
      ...editorialSections,
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
    ],
  },
  // Fixtures back local development and the deterministic build. They are never
  // served on a published hostname: the runtime resolves real content from the
  // publication snapshot and fails closed if those bindings are incomplete.
  fixtures: {
    home: {
      kind: "home",
      path: "/",
      locale: "und",
      site: { name: "Bucharest" },
      navigation: [
        { label: "Home", href: "/" },
        { label: "About", href: "/pages/about" },
      ],
      settings: {},
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
          type: "journey-search",
          data: {
            id: "home-journey-search",
            settings: {
              eyebrow: "Plan with live Voyant inventory",
              heading: "Search the whole journey",
              introduction:
                "Compare experiences, stays, flights, packages, and cruises, then arrange them into one trip.",
              "initial-journey": "indexed-inspiration",
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
              "submit-label": "Subscribe",
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
            endpoint: "/v1/public/theme/shopping/search",
          },
          {
            id: "shopping.trip-selections.v1",
            available: true,
            methods: ["POST", "PATCH"],
            endpoint: "/v1/public/theme/shopping/trip-selections",
          },
          {
            id: "shopping.trip-booking.v1",
            available: true,
            methods: ["POST"],
            endpoint: "/v1/public/theme/shopping/trip-selections/book",
          },
          {
            id: "booking.session.v1",
            available: true,
            methods: ["POST", "PATCH"],
            endpoint: "/v1/public/theme/booking/session",
          },
          {
            id: "checkout.v1",
            available: true,
            methods: ["POST"],
            endpoint: "/v1/public/theme/checkout",
          },
        ],
      },
    },
    content: [
      {
        kind: "content",
        path: "/pages/about",
        slug: "about",
        locale: "und",
        site: { name: "Bucharest" },
        navigation: [
          { label: "Home", href: "/" },
          { label: "About", href: "/pages/about" },
        ],
        settings: {},
        title: "About",
        seo: { title: "About", description: "A fixture-backed content page." },
        summary: "A fixture-backed content page.",
        body: "Replace this copy from the Voyant editor once the site is live.",
      },
    ],
    tourIndex: {
      kind: "tourIndex",
      path: "/tours",
      locale: "und",
      site: { name: "Bucharest" },
      navigation: [
        { label: "Home", href: "/" },
        { label: "Tours", href: "/tours" },
      ],
      settings: {},
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
            },
          ],
          locations: [],
          media: [],
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
        locale: "und",
        site: { name: "Bucharest" },
        navigation: [
          { label: "Home", href: "/" },
          { label: "Tours", href: "/tours" },
        ],
        settings: {},
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
            },
          ],
          locations: [],
          media: [],
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
            {
              id: "booking.session.v1",
              available: true,
              methods: ["POST", "PATCH"],
              endpoint: "/v1/public/theme/booking/session",
            },
            {
              id: "checkout.v1",
              available: true,
              methods: ["POST"],
              endpoint: "/v1/public/theme/checkout",
            },
          ],
        },
      },
    ],
    cruiseIndex: {
      kind: "cruiseIndex",
      path: "/cruises",
      locale: "und",
      site: { name: "Bucharest" },
      navigation: [
        { label: "Home", href: "/" },
        { label: "Tours", href: "/tours" },
        { label: "Cruises", href: "/cruises" },
      ],
      settings: {},
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
          media: [],
          ports: [
            { id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", media: [] },
            { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", media: [] },
          ],
          ships: [
            {
              id: "ship_aurora",
              slug: "aurora",
              name: "Aurora",
              cruiseLine: "Voyant River",
              launchedYear: 2025,
              deckCount: 4,
              media: [],
              cabinCategories: [
                { id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 2, deckNames: ["Upper deck"], media: [] },
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
              departure: {
                startsOn: "2026-09-12",
                endsOn: "2026-09-19",
                durationNights: 7,
                embarkationPort: { id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", media: [] },
                disembarkationPort: { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", media: [] },
              },
              itinerary: {
                id: "itinerary_danube",
                name: "Seven nights on the Danube",
                days: [
                  { dayNumber: 1, title: "Budapest", ports: [{ id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", media: [] }], atSea: false },
                  { dayNumber: 2, title: "Along the Danube Bend", ports: [], atSea: true },
                ],
              },
              cabinCategories: [
                { id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 2, deckNames: ["Upper deck"], media: [] },
              ],
            },
          ],
        },
      ],
      live: {
        capabilities: [
          { id: "cruise.search.v1", available: true, methods: ["GET"], endpoint: "/v1/public/theme/cruise/search" },
          { id: "shopping.search.v1", available: true, methods: ["POST"], endpoint: "/v1/public/theme/shopping/search" },
          { id: "shopping.trip-selections.v1", available: true, methods: ["POST", "PATCH"], endpoint: "/v1/public/theme/shopping/trip-selections" },
          { id: "shopping.trip-booking.v1", available: true, methods: ["POST"], endpoint: "/v1/public/theme/shopping/trip-selections/book" },
          { id: "booking.session.v1", available: true, methods: ["POST", "PATCH"], endpoint: "/v1/public/theme/booking/session" },
          { id: "checkout.v1", available: true, methods: ["POST"], endpoint: "/v1/public/theme/checkout" },
        ],
      },
    },
    cruiseDetail: [
      {
        kind: "cruiseDetail",
        path: "/cruises/danube-cities",
        slug: "danube-cities",
        locale: "und",
        site: { name: "Bucharest" },
        navigation: [{ label: "Home", href: "/" }, { label: "Cruises", href: "/cruises" }],
        settings: {},
        title: "Danube cities",
        seo: { title: "Danube cities", description: "A seven-night river voyage from Budapest to Vienna." },
        cruise: {
          id: "cruise_danube",
          slug: "danube-cities",
          name: "Danube cities",
          shortDescription: "A week between historic capitals, quiet bends, and vineyard towns.",
          descriptionHtml: "<p>Travel the Danube at an unhurried pace, with long port calls and evenings on deck.</p>",
          media: [], ports: [],
          ships: [{ id: "ship_aurora", slug: "aurora", name: "Aurora", cruiseLine: "Voyant River", launchedYear: 2025, deckCount: 4, media: [], cabinCategories: [{ id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 2, deckNames: ["Upper deck"], media: [] }] }],
          sailings: [{ id: "sailing_danube_september", slug: "danube-september", name: "Danube cities in September", cruiseId: "cruise_danube", shipId: "ship_aurora", departure: { startsOn: "2026-09-12", endsOn: "2026-09-19", durationNights: 7, embarkationPort: { id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", media: [] }, disembarkationPort: { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", media: [] } }, itinerary: { id: "itinerary_danube", name: "Seven nights on the Danube", days: [{ dayNumber: 1, title: "Budapest", ports: [{ id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", media: [] }], atSea: false }] }, cabinCategories: [{ id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 2, deckNames: ["Upper deck"], media: [] }] }],
        },
      },
    ],
    shipDetail: [
      {
        kind: "shipDetail", path: "/ships/aurora", slug: "aurora", locale: "und",
        site: { name: "Bucharest" }, navigation: [{ label: "Home", href: "/" }, { label: "Cruises", href: "/cruises" }], settings: {}, title: "Aurora",
        seo: { title: "Aurora", description: "Meet the Aurora river ship." },
        ship: { id: "ship_aurora", slug: "aurora", name: "Aurora", cruiseLine: "Voyant River", launchedYear: 2025, deckCount: 4, media: [], cabinCategories: [{ id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 2, deckNames: ["Upper deck"], media: [] }] },
      },
    ],
    sailingDetail: [
      {
        kind: "sailingDetail", path: "/sailings/danube-september", slug: "danube-september", locale: "und",
        site: { name: "Bucharest" }, navigation: [{ label: "Home", href: "/" }, { label: "Cruises", href: "/cruises" }], settings: {}, title: "Danube cities in September",
        seo: { title: "Danube cities in September", description: "A published seven-night Danube itinerary." },
        sailing: { id: "sailing_danube_september", slug: "danube-september", name: "Danube cities in September", cruiseId: "cruise_danube", shipId: "ship_aurora", departure: { startsOn: "2026-09-12", endsOn: "2026-09-19", durationNights: 7, embarkationPort: { id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", media: [] }, disembarkationPort: { id: "port_vienna", slug: "vienna", name: "Vienna", countryCode: "AT", media: [] } }, itinerary: { id: "itinerary_danube", name: "Seven nights on the Danube", days: [{ dayNumber: 1, title: "Budapest", ports: [{ id: "port_budapest", slug: "budapest", name: "Budapest", countryCode: "HU", media: [] }], atSea: false }, { dayNumber: 2, title: "Along the Danube Bend", ports: [], atSea: true }] }, cabinCategories: [{ id: "cabin_panorama", slug: "panorama", name: "Panorama suite", maxOccupancy: 2, deckNames: ["Upper deck"], media: [] }] },
      },
    ],
    notFound: {
      kind: "notFound",
      path: "/404",
      locale: "und",
      site: { name: "Bucharest" },
      navigation: [{ label: "Home", href: "/" }],
      settings: {},
      title: "Page not found",
      seo: { title: "Page not found", noIndex: true },
      message: "The requested page does not exist.",
    },
  },
})
