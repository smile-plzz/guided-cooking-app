# Mise — Guided Cooking

Find a recipe, scale it to the table you are actually feeding, then hand the
steps over to guided mode: one instruction at a time, with the timers already
parsed out of the text.

**Live:** https://guided-cooking-app.vercel.app

---

## What it does

- **Discover** — search a bundled catalog of 700+ real recipes (hand-curated
  international dishes, a large imported collection, and a 34-recipe Bengali
  collection) and a wider community catalogue at the same time. Filter by
  collection, cuisine or course.
- **Scale and convert** — change the serving count and every quantity follows.
  Switch between the units as written, metric, or US.
- **Guided cooking** — full-screen step-by-step mode. Durations mentioned in a
  step ("simmer for 20 minutes", "৩০ মিনিট") become one-tap timers that keep
  running as you move through the recipe. The screen stays awake, progress is
  saved, and arrow keys work when your hands are busy.
- **Pantry** — list what you have and recipes are ranked by how little you would
  need to buy. "Nothing to buy" and "a short shop away" are separate sections.
- **Shopping list** — add a whole recipe or a single ingredient. Items group by
  supermarket aisle; quantities in compatible units merge into one line, and
  incompatible ones deliberately stay separate rather than adding up wrongly.
- **Meal planner** — a week grid of breakfast/lunch/dinner/snack slots. Build the
  entire week's shopping list in one action.
- **Your own recipes** — write, edit and delete recipes; add private notes to any
  recipe.
- **Substitutions** — an offline table covering 37 common ingredients, including
  Bengali staples (mustard oil, poppy seed, panch phoron).
- Light and dark themes, keyboard-navigable, works on a phone propped against a
  pan.

## Stack

| Layer | Choice |
| --- | --- |
| Build | Vite 5 |
| UI | React 18, React Router 6, Tailwind CSS 3, Framer Motion |
| Data fetching | TanStack Query 5 |
| API | Vercel serverless functions (Node) |
| Recipe source | [TheMealDB](https://www.themealdb.com) — keyless public endpoint |
| Persistence | The browser's `localStorage` |
| Tests | Vitest |

### Why there is no database

Everything the user creates — recipes, favourites, notes, pantry, shopping list,
meal plan — lives in `localStorage`. There are no accounts and nothing is
uploaded. That is a deliberate trade: the app has no sign-up, no privacy policy
to write, and deploys as static files plus three tiny functions. The cost is
that data does not follow you between devices, so **Settings** has export and
import for moving a backup across by hand.

The v1 backend (Express + Sequelize + SQLite) was removed for the same reason.
A serverless filesystem is ephemeral, so a SQLite file written at runtime would
be silently discarded between invocations.

## Project layout

```
api/                     Vercel serverless functions
  _lib/mealdb.js         TheMealDB client + normalisation into our recipe shape
  _lib/respond.js        JSON/caching/error helpers
  recipes/index.js       GET /api/recipes  — search and filter
  recipes/[id].js        GET /api/recipes/:id — one full recipe
  facets.js              GET /api/facets — cuisine and category lists
sources/                 Raw recipe sources, edited by hand
  bangla.json            The Bengali collection
  local.json             The original curated English recipes
  curated.json           68 hand-authored real recipes across world cuisines
  bengali-extra.json     24 additional hand-authored Bengali/Bangladeshi
                          recipes (everyday curries, biryani, snacks, sweets)
  imported.json          600 real recipes imported from the MIT-licensed
                          dpapathanasiou/recipes dataset (github.com/
                          dpapathanasiou/recipes), re-run via
                          scripts/import-dpapathanasiou.mjs
  mealdb.json            Optional — only present after running
                          scripts/fetch-mealdb.mjs against TheMealDB
scripts/build-data.mjs   Normalises sources/ into the unified catalog
data/                    Generated — catalog.js (imported) + recipes.json (readable)
src/
  lib/                   Catalog search, units, timers, plan, storage, substitutions
  components/            Layout, cards, dialogs, icons, UI primitives
  pages/                 Discover, RecipeDetail, CookMode, MealPlanner,
                         ShoppingList, Pantry, Saved, RecipeForm, Settings
  test/                  Vitest suites for the pure logic
```

### One recipe shape

Every source is normalised to the same record, so a bundled Bengali recipe, a
user-written one and a community one all render through the same components:

```js
{
  id: 'bn-1000001',        // prefix carries the origin: lc- bn- my- md-
  source: 'bangla',
  lang: 'bn',
  title, titleEn, subtitle, description, image,
  cuisine, category, tags: [],
  readyInMinutes, prepMinutes, cookMinutes, servings,
  ingredients: [{ name, nameClean, amount, unit, original, aisle }],
  steps: [{ number, text }],
}
```

## Running it locally

```sh
npm install
npm run dev          # http://localhost:3000
```

The dev server proxies `/api` to port 3001. To exercise the serverless functions
locally, run `vercel dev --listen 3001` alongside it. Without that, the bundled
catalog still works in full — only community results go quiet.

```sh
npm test             # 51 unit tests
npm run lint
npm run build        # production build into dist/
npm run data:build   # regenerate data/ after editing sources/
```

## Configuration

None required. TheMealDB's developer endpoint needs no key, which is why the
deployment works with zero environment variables.

## Deployment

Vercel, from the repository root:

- Framework preset: Vite
- Build: `npm run build`, output `dist`
- `vercel.json` rewrites all non-`/api` paths to `index.html` for client routing,
  and sets a long immutable cache on hashed assets.

API responses are cached at the edge (`s-maxage` with
`stale-while-revalidate`), which keeps the app quick and stays well inside
TheMealDB's rate limits.

## Testing

`npm test` covers the logic worth locking down: unit conversion and scaling,
shopping-list aggregation (including the case where units must *not* be added),
duration parsing in English and Bengali, week/plan maths, substitution lookup,
and normalisation of TheMealDB's flat ingredient columns.

## Accessibility notes

Focus is trapped and restored in dialogs, dialogs close on Escape, the tab bar
and header nav are real `<nav>` landmarks, every icon-only control has a label,
`prefers-reduced-motion` is honoured, and Bengali text is marked `lang="bn"` so
screen readers and the font stack both handle it correctly.

## Known limits

- Nutrition data is not shown. The v1 build sourced it from a paid API; rather
  than estimate it and be wrong, it was dropped.
- Community recipes carry no timings, so their cooking time is estimated from
  the number of steps and labelled as an estimate.
- Many bundled recipes have no photograph; those render a generated plate keyed
  off the title rather than a broken frame.
