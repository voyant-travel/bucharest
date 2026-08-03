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

Bucharest is published to the Voyant theme catalog as a public theme, so every
operator can select it without connecting a repository of their own. Git is the
theme author's concern, not the operator's.

## Version pinning

`@voyant-travel/theme` is pinned to an exact version, not a range. The platform
build lane selects one SDK version and rejects any theme that does not pin the
same one, because a range would let two builds of the same commit resolve
different SDKs. Bump it deliberately, in step with the platform.

Do not add `@voyant-travel/cli` as a dependency. The lane supplies its own
pinned copy, and depending on it pulls the operator runtime into the theme.

The lane verifies the uploaded artifact against its recorded size.

Artifacts are verified against their recorded size and digest.

Build evidence is written alongside the artifact.

The build lane records provenance for every release.

Releases are immutable once recorded.

A release records the exact commit, SDK and artifact digest.

The publish lane deploys each release into the dispatch namespaces.

Each release is deployed under the same worker name in both namespaces.
