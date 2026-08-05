import { defineTheme } from "@voyant-travel/theme"

export default defineTheme({
  contractVersion: "v1alpha3",
  manifest: {
    id: "bucharest",
    name: "Bucharest",
    version: "0.2.7",
    routes: [
      { id: "home", pattern: "/", context: "home" },
      { id: "content", pattern: "/[...path]", context: "content" },
      { id: "not-found", pattern: "/404", context: "notFound" },
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
        ],
      },
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
    sections: [],
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
      navigation: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
      ],
      settings: {},
      title: "Bucharest",
      seo: { title: "Bucharest" },
      sections: [],
    },
    content: [
      {
        kind: "content",
        path: "/about",
        slug: "about",
        locale: "en",
        site: { name: "Bucharest" },
        navigation: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ],
        settings: {},
        title: "About",
        seo: { title: "About", description: "A fixture-backed content page." },
        summary: "A fixture-backed content page.",
        body: "Replace this copy from the Voyant editor once the site is live.",
      },
    ],
    notFound: {
      kind: "notFound",
      path: "/404",
      locale: "en",
      site: { name: "Bucharest" },
      navigation: [{ label: "Home", href: "/" }],
      settings: {},
      title: "Page not found",
      seo: { title: "Page not found", noIndex: true },
      message: "The requested page does not exist.",
    },
  },
})
