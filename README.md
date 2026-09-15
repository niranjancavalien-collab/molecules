# MyAnatomy.ai — tech portal landing page

Remix + Tailwind + Framer Motion + React Three Fiber. Light/dark theming driven by a
class on `<html>`, with a theme-aware 3D molecular particle background.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build and serve

```bash
npm run build
npm start
```

## Structure

```
app/
  root.jsx                     document shell, theme init script, metadata
  entry.client.jsx             hydration
  entry.server.jsx             streaming SSR
  tailwind.css                 base layer + surface-card / text-gradient utilities
  routes/_index.jsx            the page — section order lives here
  lib/motion.js                shared Framer Motion variants
  components/
    ThemeProvider.jsx          theme context + pre-paint init script
    ClientOnly.jsx             hydration boundary (keeps WebGL off the server)
    MoleculeBackground.jsx     fixed surface + lazy-loaded canvas
    ParticleCanvas.jsx         R3F points, bonds, drift, pointer tracking
    ui.jsx                     Reveal, Section, buttons, Chip, Badge, headings
    Navbar.jsx Hero.jsx CandidateHub.jsx AssessmentsEngine.jsx
    NcetSection.jsx SandboxPro.jsx Ecosystem.jsx Footer.jsx
```

## Theming

`ThemeProvider` owns the `theme` state and writes `class="dark"` / `class="light"` plus
`color-scheme` onto `<html>`, persisting to `localStorage` under `myanatomy-theme`.

`themeInitScript` is injected into `<head>` as a blocking script, so the correct class is
applied before first paint — no flash, and no hydration mismatch. The server always renders
`dark`; the script corrects it from storage or `prefers-color-scheme`.

Every component styles light mode first and layers dark with `dark:` variants, per
`darkMode: "class"` in `tailwind.config.js`. Brand colours are tokens there:
`ink` `mist` `glow` `deep` `violetGlow` `violetDeep`.

## The 3D background

- `MoleculeBackground` renders the flat surface colour server-side and mounts the canvas
  only after hydration via `ClientOnly`, so `window`/`document` are never touched on the server.
- `ParticleCanvas` is a `React.lazy` import, keeping three.js (~800 kB) out of the first load.
- 1,800 points in a `Float32Array` on a shell distribution, plus up to 900 bond `lineSegments`
  computed once from a 620-node neighbour pass.
- Dark: `#38BDF8`, opacity `0.8`, `AdditiveBlending`. Light: `#0284C7`, opacity `0.45`,
  `NormalBlending`. Switching theme swaps material props on the same geometry.
- `useFrame` drives ambient Y/X drift and lerps `state.pointer` into rotation and position.
- `prefers-reduced-motion` pauses the frameloop (`frameloop="demand"`).

## Deploy

`npm run build` produces `build/client` (static assets) and `build/server`.

**Node / Docker / Fly / Render / Railway** — a `Dockerfile` is included:

```bash
docker build -t myanatomy-portal .
docker run -p 3000:3000 myanatomy-portal
```

Or on any Node 20+ host: build, then run `npm start` behind your proxy. Serve
`build/client/assets` with a long cache header (`immutable`, one year) — filenames are hashed.

**Vercel** — `npm i -D @vercel/remix`, then set the preset in `vite.config.js`:

```js
import { vercelPreset } from "@vercel/remix/vite";
remix({ presets: [vercelPreset()] })
```

**Netlify / Cloudflare** — install `@netlify/remix-adapter` or `@remix-run/cloudflare` and
follow that adapter's setup; no page code needs to change.

## Things to wire up before launch

- Footer newsletter input is local state only — point `subscribe()` at a Remix action or your ESP.
- Nav and footer links are in-page anchors; swap to `<Link>` from `@remix-run/react` once routes exist.
- Metrics, NCET distribution, schedule, and ecosystem items are hardcoded arrays at the top of
  each component — move to a loader when they come from an API.
- Add `public/favicon.ico` and an OG image, and set `og:` tags in `root.jsx`'s `meta`.
