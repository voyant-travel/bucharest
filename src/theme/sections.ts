/**
 * The sections this release adds to the four Bucharest already shipped.
 *
 * Extracted from `theme.config.ts` rather than inlined: the manifest is the
 * operator-facing surface of the whole theme, and at this size a single
 * literal is unreadable and merges badly. The four original sections stay
 * where they were, ids untouched.
 *
 * Two rules hold throughout. Repeated content is a `block`, never a numbered
 * settings key — the contract has real repeaters, so a card list is a list.
 * And every section renders with nothing filled in, because an operator places
 * a section before writing its copy and a blank screen reads as broken.
 */

import type { ThemeSection } from "@voyant-travel/theme"

/**
 * One entry in a section's `settings`. Annotating each shared helper with this
 * is what narrows `type` to its literal — without it TypeScript widens the
 * field to `string` and no member of the contract's union matches.
 */
type SectionSetting = NonNullable<ThemeSection["settings"]>[number]


/** The background and rhythm controls almost every section carries. */
const tone = (fallback = "canvas"): SectionSetting => ({
  id: "tone",
  label: "Background",
  type: "select",
  default: fallback,
  options: [
    { label: "Canvas", value: "canvas" },
    { label: "Surface", value: "surface" },
    { label: "Sunken", value: "sunk" },
    { label: "Accent", value: "accent" },
    { label: "Accent wash", value: "accent-wash" },
  ],
})

const spacing = (fallback = "regular"): SectionSetting => ({
  id: "spacing",
  label: "Vertical space",
  type: "select",
  default: fallback,
  options: [
    { label: "Regular", value: "regular" },
    { label: "Tight", value: "tight" },
    { label: "Roomy", value: "roomy" },
    { label: "Flush", value: "flush" },
  ],
})

const eyebrow: SectionSetting = { id: "eyebrow", label: "Eyebrow", type: "text" }
const heading: SectionSetting = {
  id: "heading",
  label: "Heading",
  type: "inline_richtext",
}
const introduction: SectionSetting = {
  id: "introduction",
  label: "Introduction",
  type: "textarea",
}

const layout = (options: Array<[string, string]>): SectionSetting => ({
  id: "layout",
  label: "Layout",
  type: "select",
  default: options[0]![0]!,
  options: options.map(([value, label]) => ({ value, label })),
})

/** Everywhere an operator points at one of their own pages. */
const linkPair: SectionSetting[] = [
  { id: "label", label: "Link label", type: "text" },
  { id: "page", label: "Link destination", type: "page" },
]

export const sections: ThemeSection[] = [
  {
    id: "journey-cards",
    name: "Journeys",
    description:
      "Hand-picked itineraries. Feature-first gives the first card the full width, which is how you lead with a flagship trip.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["grid", "Grid of three"],
        ["feature-first", "One large, then a grid"],
        ["rail", "Horizontal rail"],
        ["editorial-list", "Editorial list"],
      ]),
      ...linkPair,
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "journey",
        name: "Journey",
        settings: [
          { id: "title", label: "Title", type: "text", required: true },
          { id: "region", label: "Region", type: "text" },
          { id: "meta", label: "Duration and style", type: "text" },
          { id: "price", label: "Price", type: "text" },
          { id: "badge", label: "Corner badge", type: "text" },
          { id: "image", label: "Photograph", type: "image_picker" },
          { id: "image-alt", label: "Image description", type: "text" },
          { id: "page", label: "Destination", type: "page" },
        ],
      },
    ],
    max_blocks: 12,
    presets: [
      {
        name: "Journeys leaving soon",
        settings: {
          eyebrow: "This season",
          heading: "Itineraries leaving soon",
          introduction:
            "Each one is a starting point. We will take it apart and rebuild it around your dates.",
          layout: "feature-first",
          tone: "sunk",
        },
        blocks: [
          {
            type: "journey",
            settings: {
              title: "A flagship journey",
              region: "Where it goes",
              meta: "16 days · Guided",
              price: "From £8,400",
            },
          },
          {
            type: "journey",
            settings: {
              title: "A second journey",
              region: "Where it goes",
              meta: "11 days · Small group",
            },
          },
          {
            type: "journey",
            settings: {
              title: "A third journey",
              region: "Where it goes",
              meta: "12 days · Private",
            },
          },
        ],
      },
    ],
    templates: ["home"],
  },

  {
    id: "destination-grid",
    name: "Destinations",
    description:
      "Places rather than trips. Mosaic varies the card heights, which suits mixed landscape and portrait photography.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["mosaic", "Mosaic"],
        ["even", "Even grid"],
        ["rail", "Horizontal rail"],
      ]),
      ...linkPair,
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "place",
        name: "Place",
        settings: [
          { id: "title", label: "Place", type: "text", required: true },
          { id: "meta", label: "Small label", type: "text" },
          { id: "image", label: "Photograph", type: "image_picker" },
          { id: "image-alt", label: "Image description", type: "text" },
          { id: "page", label: "Destination", type: "page" },
        ],
      },
    ],
    max_blocks: 12,
    presets: [
      {
        name: "Where we work",
        settings: {
          eyebrow: "Where we work",
          heading: "Places we know by name",
          layout: "mosaic",
        },
        blocks: [
          { type: "place", settings: { title: "First place", meta: "14 journeys" } },
          { type: "place", settings: { title: "Second place", meta: "9 journeys" } },
          { type: "place", settings: { title: "Third place", meta: "6 journeys" } },
        ],
      },
    ],
    templates: ["home"],
  },

  {
    id: "alternating-features",
    name: "Alternating features",
    description:
      "Photograph and prose, side alternating down a central rule. Four is the most that reads as a rhythm rather than a list.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["timeline", "Joined by a central rule"],
        ["zigzag", "Free-standing"],
      ]),
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "feature",
        name: "Feature",
        settings: [
          { id: "title", label: "Title", type: "text", required: true },
          { id: "label", label: "Small label", type: "text" },
          { id: "description", label: "Description", type: "textarea" },
          { id: "image", label: "Photograph", type: "image_picker" },
          { id: "image-alt", label: "Image description", type: "text" },
          { id: "page", label: "Destination", type: "page" },
        ],
      },
    ],
    max_blocks: 4,
    presets: [
      {
        name: "Why people come back",
        settings: {
          eyebrow: "How we differ",
          heading: "Why people come back to us",
          layout: "timeline",
          spacing: "roomy",
        },
        blocks: [
          {
            type: "feature",
            settings: {
              label: "Written by hand",
              title: "No two itineraries are the same",
              description:
                "Every journey is drafted from scratch by the person who will look after you.",
            },
          },
          {
            type: "feature",
            settings: {
              label: "Rooms we have slept in",
              title: "We only sell what we have seen",
              description:
                "Every property on the list visited in the last three years by someone on this staff.",
            },
          },
        ],
      },
    ],
    templates: ["home"],
  },

  {
    id: "stat-band",
    name: "Figures",
    description: "A few numbers that make the case — years trading, guests, guides.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["bordered", "Bordered columns"],
        ["row", "Plain row"],
        ["stacked", "Beside the heading"],
      ]),
      tone("accent"),
      spacing("tight"),
    ],
    blocks: [
      {
        type: "stat",
        name: "Figure",
        settings: [
          { id: "value", label: "Figure", type: "text", required: true },
          { id: "label", label: "Label", type: "text" },
        ],
      },
    ],
    max_blocks: 4,
    presets: [
      {
        name: "Four figures",
        settings: { layout: "bordered", tone: "accent", spacing: "tight" },
        blocks: [
          { type: "stat", settings: { value: "51", label: "Years arranging journeys" } },
          { type: "stat", settings: { value: "140", label: "Guides on long-term contracts" } },
          { type: "stat", settings: { value: "26", label: "Countries we work in" } },
        ],
      },
    ],
    templates: ["home"],
  },

  {
    id: "testimonials",
    name: "What travellers say",
    description: "Quotes with attribution, and an optional rating.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["grid", "Grid"],
        ["single", "One at a time, large"],
        ["rail", "Horizontal rail"],
      ]),
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "testimonial",
        name: "Quote",
        settings: [
          { id: "quote", label: "Quote", type: "textarea", required: true },
          { id: "author", label: "Name", type: "text" },
          { id: "role", label: "Trip or place", type: "text" },
          { id: "image", label: "Portrait", type: "image_picker" },
          { id: "image-alt", label: "Image description", type: "text" },
          {
            id: "rating",
            label: "Rating out of five",
            type: "range",
            min: 0,
            max: 5,
            step: 1,
            default: 5,
          },
        ],
      },
    ],
    max_blocks: 9,
    presets: [
      {
        name: "Three quotes",
        settings: { eyebrow: "In their words", heading: "What travellers say", tone: "sunk" },
        blocks: [
          {
            type: "testimonial",
            settings: {
              quote: "They rewrote four days of the trip overnight and we only found out afterwards.",
              author: "A traveller",
              role: "Where they went",
              rating: 5,
            },
          },
        ],
      },
    ],
    templates: ["home"],
  },

  {
    id: "quote-feature",
    name: "Pull quote",
    description: "One sentence, given the room to land.",
    settings: [
      { id: "quote", label: "Quote", type: "textarea", required: true },
      { id: "author", label: "Attributed to", type: "text" },
      { id: "role", label: "Role or trip", type: "text" },
      { id: "image", label: "Photograph", type: "image_picker" },
      { id: "image-alt", label: "Image description", type: "text" },
      layout([
        ["plain", "Type only"],
        ["portrait", "Beside a portrait"],
        ["over-image", "Over a photograph"],
      ]),
      tone(),
      spacing(),
    ],
    blocks: [],
    presets: [
      {
        name: "A single quote",
        settings: { layout: "plain", quote: "One sentence worth the whole page." },
        blocks: [],
      },
    ],
    templates: ["home"],
  },

  {
    id: "gallery",
    name: "Gallery",
    description: "Photography on its own terms. Mosaic is the editorial arrangement.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["mosaic", "Mosaic"],
        ["grid", "Even grid"],
        ["rail", "Horizontal rail"],
      ]),
      { id: "caption", label: "Caption", type: "text" },
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "photograph",
        name: "Photograph",
        settings: [
          { id: "image", label: "Photograph", type: "image_picker", required: true },
          { id: "image-alt", label: "Image description", type: "text" },
        ],
      },
    ],
    max_blocks: 12,
    presets: [
      {
        name: "Photograph mosaic",
        settings: { heading: "Photographs from the last twelve months", layout: "mosaic" },
        blocks: [{ type: "photograph", settings: {} }],
      },
    ],
    templates: ["home"],
  },

  {
    id: "steps",
    name: "How it works",
    description: "The path from enquiry to departure, in a few numbered steps.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["row", "Numbered row"],
        ["vertical", "Vertical with a rule"],
      ]),
      ...linkPair,
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "step",
        name: "Step",
        settings: [
          { id: "title", label: "Title", type: "text", required: true },
          { id: "description", label: "Description", type: "textarea" },
        ],
      },
    ],
    max_blocks: 6,
    presets: [
      {
        name: "From first call to coming home",
        settings: { eyebrow: "Working with us", heading: "From first call to coming home" },
        blocks: [
          {
            type: "step",
            settings: {
              title: "A conversation",
              description: "An hour on the telephone, no itinerary yet.",
            },
          },
          {
            type: "step",
            settings: { title: "A draft", description: "A written journey within five working days." },
          },
        ],
      },
    ],
    templates: ["home"],
  },

  {
    id: "faq",
    name: "Questions",
    description: "Questions that open in place, with no script behind them.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["side-heading", "Heading beside the questions"],
        ["single", "Single column"],
      ]),
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "question",
        name: "Question",
        settings: [
          { id: "question", label: "Question", type: "text", required: true },
          { id: "answer", label: "Answer", type: "richtext" },
        ],
      },
    ],
    max_blocks: 16,
    presets: [
      {
        name: "Common questions",
        settings: { eyebrow: "Before you ask", heading: "The questions we are asked most" },
        blocks: [
          {
            type: "question",
            settings: {
              question: "How far ahead should we book?",
              answer: "<p>Ten to twelve months for the busiest months; four is plenty elsewhere.</p>",
            },
          },
        ],
      },
    ],
    templates: ["home"],
  },

  {
    id: "logo-strip",
    name: "Accreditations",
    description: "Press, bonding and membership marks.",
    settings: [
      { id: "label", label: "Label", type: "text" },
      layout([
        ["static", "Static row"],
        ["marquee", "Slow marquee"],
      ]),
      {
        id: "treatment",
        label: "Mark treatment",
        type: "radio",
        default: "muted",
        options: [
          { label: "Muted until hovered", value: "muted" },
          { label: "Full strength", value: "full" },
        ],
      },
      tone(),
      spacing("tight"),
    ],
    blocks: [
      {
        type: "mark",
        name: "Mark",
        settings: [
          { id: "image", label: "Mark", type: "image_picker", required: true },
          { id: "image-alt", label: "Image description", type: "text" },
        ],
      },
    ],
    max_blocks: 12,
    presets: [
      {
        name: "As recommended in",
        settings: { label: "As recommended in", layout: "static", spacing: "tight" },
        blocks: [{ type: "mark", settings: {} }],
      },
    ],
    templates: ["home"],
  },

  {
    id: "text-media",
    name: "Text and photograph",
    description: "A passage of prose beside one photograph, with optional points.",
    settings: [
      eyebrow,
      heading,
      { id: "body", label: "Body", type: "richtext" },
      { id: "image", label: "Photograph", type: "image_picker" },
      { id: "image-alt", label: "Image description", type: "text" },
      { id: "caption", label: "Photograph caption", type: "text" },
      layout([
        ["media-right", "Photograph right"],
        ["media-left", "Photograph left"],
        ["media-full", "Photograph across the full width"],
      ]),
      ...linkPair,
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "point",
        name: "Point",
        settings: [{ id: "text", label: "Point", type: "text", required: true }],
      },
    ],
    max_blocks: 6,
    presets: [
      {
        name: "A note beside a photograph",
        settings: {
          heading: "Something worth explaining at length",
          body: "<p>Two or three paragraphs that earn the space they take.</p>",
          layout: "media-right",
        },
        blocks: [],
      },
    ],
    templates: ["home"],
  },

  {
    id: "prose",
    name: "Passage",
    description: "Set text on its own, at reading width.",
    settings: [
      eyebrow,
      heading,
      { id: "body", label: "Body", type: "richtext" },
      layout([
        ["narrow", "Reading width"],
        ["side-heading", "Heading beside the text"],
        ["wide", "Wide"],
      ]),
      tone(),
      spacing(),
    ],
    blocks: [],
    presets: [
      {
        name: "A passage",
        settings: {
          heading: "A heading for the passage",
          body: "<p>The paragraphs that belong under it.</p>",
          layout: "narrow",
        },
        blocks: [],
      },
    ],
    templates: ["home"],
  },

  {
    id: "newsletter",
    name: "Newsletter",
    description: "One field and a button, posting to whatever list the operator runs.",
    settings: [
      eyebrow,
      heading,
      introduction,
      { id: "image", label: "Photograph", type: "image_picker" },
      { id: "image-alt", label: "Image description", type: "text" },
      { id: "action", label: "Where the form posts", type: "text" },
      { id: "field-name", label: "Email field name", type: "text", default: "email" },
      { id: "placeholder", label: "Placeholder", type: "text", default: "you@example.com" },
      { id: "submit-label", label: "Button label", type: "text", default: "Subscribe" },
      { id: "note", label: "Small print", type: "text" },
      layout([
        ["panel", "Panel"],
        ["split", "Beside a photograph"],
        ["inline", "Inline row"],
      ]),
      tone(),
      spacing(),
    ],
    blocks: [],
    presets: [
      {
        name: "Newsletter panel",
        settings: {
          heading: "Six letters a year, and nothing else",
          "submit-label": "Subscribe",
          layout: "panel",
        },
        blocks: [],
      },
    ],
    templates: ["home"],
  },

  {
    id: "contact-cards",
    name: "Ways to reach us",
    description: "A few routes in — telephone, email, an office.",
    settings: [
      eyebrow,
      heading,
      introduction,
      layout([
        ["three", "Cards"],
        ["row", "One bordered row"],
      ]),
      tone(),
      spacing(),
    ],
    blocks: [
      {
        type: "method",
        name: "Method",
        settings: [
          { id: "title", label: "Title", type: "text", required: true },
          { id: "detail", label: "Detail", type: "text" },
          {
            id: "icon",
            label: "Icon",
            type: "select",
            default: "phone",
            options: [
              { label: "Telephone", value: "phone" },
              { label: "Email", value: "mail" },
              { label: "Map pin", value: "pin" },
              { label: "Clock", value: "clock" },
              { label: "Compass", value: "compass" },
            ],
          },
          { id: "page", label: "Destination", type: "page" },
        ],
      },
    ],
    max_blocks: 4,
    presets: [
      {
        name: "Three ways in",
        settings: { heading: "Three ways in", layout: "three" },
        blocks: [
          { type: "method", settings: { icon: "phone", title: "Telephone", detail: "+44 20 7946 0812" } },
          { type: "method", settings: { icon: "mail", title: "Email", detail: "travel@example.com" } },
        ],
      },
    ],
    templates: ["home"],
  },

  {
    id: "divider",
    name: "Divider",
    description: "Space, a hairline, or a small mark between two sections.",
    settings: [
      {
        id: "style",
        label: "Style",
        type: "radio",
        default: "rule",
        options: [
          { label: "Hairline", value: "rule" },
          { label: "Space only", value: "blank" },
          { label: "Small mark", value: "mark" },
        ],
      },
      {
        id: "size",
        label: "Size",
        type: "select",
        default: "medium",
        options: [
          { label: "Small", value: "small" },
          { label: "Medium", value: "medium" },
          { label: "Large", value: "large" },
        ],
      },
      tone(),
    ],
    blocks: [],
    presets: [
      { name: "Hairline", settings: { style: "rule", size: "medium" }, blocks: [] },
    ],
    templates: ["home"],
  },
]
