import { defineTheme } from "@voyant-travel/theme"

export default defineTheme({
  contractVersion: "v1alpha2",
  manifest: {
    id: "bucharest",
    name: "Bucharest",
    version: "0.1.0",
    routes: [
      { id: "home", pattern: "/", context: "home" },
      { id: "content", pattern: "/[...path]", context: "content" },
      { id: "not-found", pattern: "/404", context: "notFound" },
    ],
    settings: [],
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
