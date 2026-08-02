# Bucharest

The first Voyant storefront theme. Astro, built and served as a Cloudflare
Worker through the Voyant theme pipeline.

## Develop

```sh
npm install
npm run dev
```

`npm run dev` serves the fixtures declared in `theme.config.ts`. A published
site resolves page context from an immutable publication snapshot instead,
through the same `resolveThemeContext` call.

## Validate

```sh
npm run theme:check   # contract and fixture diagnostics
npm run build         # validates, then builds the Worker entrypoint
```

## Build shape

`astro.config.mjs` sets `output: "server"` with the Cloudflare adapter because
the theme must emit `dist/server/entry.mjs`. A fully prerendered build emits no
server entrypoint and `voyant theme build` rejects the artifact.

`package-lock.json` is committed deliberately: the platform build lane detects
the package manager from the lockfile and installs with a frozen lockfile, so a
theme without one cannot be built.

## Publishing

Bucharest is published to the Voyant theme catalog as a public theme, so any
operator can select it without connecting a repository of their own. Git is the
theme author's concern, not the operator's.
