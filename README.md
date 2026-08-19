# Bucharest

The first public Voyant Theme. It is an Astro project built and served as a
Cloudflare Worker through the Voyant Theme pipeline.

## Develop

```sh
npm install
npm run dev
```

For isolated work, `npm run dev` serves the fixtures declared in
`theme.config.ts`. A published Site resolves page context from an immutable
publication snapshot through the same `resolveThemeContext` call.

For normal development, connect this local Theme to a Theme installed on a
remote Voyant Site:

```sh
npm run theme:link -- \
  --theme <theme-id-or-slug> \
  --site <site-id-or-slug> \
  --installation <installation-id>
npm run dev
```

`theme link` records only the Voyant development target. `theme dev` creates a
short-lived session and starts Astro with remote content, Site data, and the
editor configuration for the local manifest. Use `npm run theme:status` to
inspect the link and `npm run theme:unlink` to remove it. Use `npm run
dev:local` when fixture-only development is intentional.

External hosting is independent. Deploying this Astro Theme to Vercel,
Cloudflare, or another host is the developer's responsibility and is not
registered back in Voyant. Configure that deployment with its own Content API
and Public API credentials and allowed origins.

The `/tours` and `/tours/:slug` fixtures demonstrate the v1 contract split:
editorial product identity and presentation are immutable page context, while
search, dates, prices, booking sessions, and checkout use platform-generated
same-origin capabilities. On a Voyant-managed Site, no provider endpoint or
credential reaches the Theme.

Bucharest is presentation-only. Its booking controls retain opaque session and
revision handles in memory for the current page attempt, then hand payment and
account journeys to managed platform capabilities. The theme does not persist
customer identity, profiles, booking or payment state, and it does not call an
engine or provider API directly.

On the home page, an operator-enabled `shopping.trip-booking.v1` capability can
freeze the exact opaque Trip revision into one managed itinerary Booking
Session. Bucharest submits only the selection capability, expected revision,
and a retry-stable idempotency key, then reuses `booking.session.v1` and
`checkout.v1` for quote, hold, commit, and secure checkout. It never receives
Trip, provider, source, connection, payment, or FX authority.

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

Bucharest is published to the Voyant Theme marketplace as a public Theme, so
every operator can install it on a Site without connecting a repository of
their own. Git is the Theme author's concern, not the operator's.

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
