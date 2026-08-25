# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## What this is

**Mise** — a guided-cooking web app. You find a recipe, scale it to the number of people you are
actually feeding, and then cook it hands-free: guided mode shows one step at a time and turns any
duration mentioned in the step text into a one-tap timer. It also carries a pantry, a shopping
list and a weekly meal planner. Ships a bundled recipe catalog (curated English recipes plus a
Bengali collection) and searches an external catalogue alongside it.

Single-page React app deployed on Vercel at https://guided-cooking-app.vercel.app, with three
serverless functions for the external recipe source. No accounts, no database.

## Commands

```sh
npm install
npm run dev          # Vite dev server on http://localhost:3000
npm run build        # production build into dist/
npm run preview      # serve the built dist/
npm test             # Vitest, 51 unit tests
npm run lint         # ESLint (flat config is .eslintrc.cjs, eslint 8)
npm run data:build   # regenerate data/ from sources/ — run after editing sources/
```

`npm run dev` proxies `/api` to `localhost:3001`. To exercise the serverless functions locally,
run `vercel dev --listen 3001` alongside it; without it the bundled catalog still works in full
and only community results go quiet.

**No environment variables are needed, in development or production.** TheMealDB's developer
endpoint is keyless, which is the whole reason the deployment works with zero configuration. Do
not reintroduce a required secret without saying so loudly — a missing key is what made v1
undeployable.

Deployment is automatic: the Vercel project `guided-cooking-app` builds every push to `main`.

## Architecture

### Data pipeline (build time, not runtime)

- `sources/bangla.json`, `sources/local.json` — the raw, hand-edited recipe sources. Edit these.
- `scripts/build-data.mjs` — normalises both into one recipe shape. Holds `BN_META` (romanised
  titles and subtitles for the ten Bengali recipes, which is what makes them findable in English
  search) and `usableImage()`, which rejects `data:` URIs, localhost URLs and bare filenames.
- `data/catalog.js` — **generated, never edit by hand.** A plain ES module (`export const
  catalog = [...]`) rather than JSON, deliberately: it imports unchanged into both the Vite bundle
  and a Node serverless function with no JSON import attributes and no filesystem reads.
  `data/recipes.json` is a readable copy for diffing only; nothing imports it.

### Serverless API (`api/`)

- `api/_lib/mealdb.js` — the TheMealDB client. `normalizeMeal()` converts their flat
  `strIngredient1..20`/`strMeasure1..20` columns into our ingredient list, `parseMeasure()` parses
  `"1 1/2 tbs"` and vulgar-fraction glyphs, `parseSteps()`/`splitParagraph()` break one long
  instruction blob into steps guided mode can page through.
- `api/_lib/respond.js` — `sendJson`/`sendError`/`requireGet`. Sets the edge cache headers
  (`s-maxage` + `stale-while-revalidate`) that keep us inside TheMealDB's rate limits.
- `api/recipes/index.js` (`GET /api/recipes`) — search/filter, or random suggestions with no query.
- `api/recipes/[id].js` (`GET /api/recipes/:id`) — one full external recipe.
- `api/facets.js` (`GET /api/facets`) — cuisine and category lists.

### Client (`src/`)

Libraries — the parts worth knowing before editing anything:

- `src/lib/catalog.js` — searches the bundled catalog client-side (`searchBundled`), and
  `matchAgainstPantry()` ranks recipes by pantry coverage.
- `src/lib/recipes.js` — `useRecipe(id)` resolves *any* id to a full recipe regardless of origin;
  `useMyRecipes()` is CRUD over the user's own; `normalizeUserRecipe`/`validateRecipe` back the form.
- `src/lib/units.js` — `formatAmount` (fraction glyphs), `convert`, `scaleIngredient`, and
  `aggregateIngredients`, which merges the same ingredient across recipes.
- `src/lib/timers.js` — `extractDurations()` finds durations in step text in **both English and
  Bengali numerals**; `formatDuration`, `humanizeMinutes`.
- `src/lib/useTimers.js` — concurrent kitchen timers, `playAlarm()` (Web Audio, no asset file),
  `useWakeLock()`.
- `src/lib/plan.js` — week/slot maths and the plan mutations.
- `src/lib/storage.js` — the entire persistence layer. `KEYS`, `usePersistentState`, export/import.
- `src/lib/substitutions.js` — the offline substitution table.

Pages are lazy-loaded from `src/App.jsx` except `Discover`, which is the landing route and ships in
the main bundle.

## Data & storage

Everything the user creates lives in `localStorage` under the `mise.*` keys in
`src/lib/storage.js`. There is no server-side storage and no accounts.

A recipe id carries its origin as a prefix, and a lot of the app branches on it:

| Prefix | Origin | Resolved by |
|---|---|---|
| `lc-` | bundled English recipe | `BUNDLED_BY_ID`, synchronously |
| `bn-` | bundled Bengali recipe | `BUNDLED_BY_ID`, synchronously |
| `my-` | written by the user | `localStorage` |
| `md-` | TheMealDB | `/api/recipes/:id` |

## Conventions to preserve when editing

- **`usePersistentState`'s updater form must stay pure.** The write to `localStorage` happens
  *after* the updater returns, so anything that throws inside it loses the write silently. This
  already shipped as a real bug: firing a toast (`notify()`) from inside the updater aborted the
  update, and both "Build shopping list" and "Add all to shopping list" added nothing at all with
  no error anywhere. Compute from the current value, write, *then* notify.
- **`data/catalog.js` is generated.** Edit `sources/` and run `npm run data:build`; a hand-edit
  there is erased by the next build.
- **Never assume a recipe has a photograph.** Most bundled ones do not, and external URLs 404.
  Always render images through `src/components/RecipeImage.jsx`, which falls back to a generated
  plate keyed off the title.
- **Bengali text needs `lang="bn"`.** Inter has no Bengali coverage; the `:lang(bn)` rule in
  `src/index.css` is what switches it to Hind Siliguri. When an ingredient or title travels to a
  new surface (shopping list, meal plan, pantry), carry its `lang` with it — this has been lost
  once already.
- **Guided mode's resume prompt reads stored progress once, on mount.** It must not watch the
  progress store: every step writes to that store, so a watcher re-opens the dialog on each step.
- **Nothing may float over the app's sticky header** (`z-40`, variable height because of the
  mobile search row). The guided-mode timer rail is deliberately in the flow beneath the cook
  header rather than `position: fixed` for exactly this reason.
- **Degrade, don't empty the page, when the external source fails.** `searchOnline` is allowed to
  return nothing; the bundled catalog is always there.
