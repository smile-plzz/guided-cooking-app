/**
 * Normalizes the raw recipe sources in `sources/` into the single unified
 * catalog the app consumes (`data/recipes.json`).
 *
 * Run with: npm run data:build
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeMeal } from '../api/_lib/mealdb.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const bangla = read('sources/bangla.json');
const local = read('sources/local.json');
const curated = read('sources/curated.json');
const imported = read('sources/imported.json');
// Optional: only present after running `node scripts/fetch-mealdb.mjs`.
const mealdbPath = path.join(ROOT, 'sources/mealdb.json');
const mealdb = fs.existsSync(mealdbPath) ? JSON.parse(fs.readFileSync(mealdbPath, 'utf8')) : [];

// Romanised titles let the Bengali recipes surface in English-language search.
const BN_META = {
  1000001: ['Shorshe Ilish', 'Hilsa in mustard sauce', 'Fish'],
  1000002: ['Kosha Mangsho', 'Slow-cooked mutton curry', 'Beef'],
  1000003: ['Aloo Posto', 'Potatoes in poppy seed paste', 'Side'],
  1000004: ['Chingri Malaikari', 'Prawns in coconut milk', 'Seafood'],
  1000005: ['Mishti Doi', 'Sweet Bengali yoghurt', 'Dessert'],
  1000006: ['Macher Jhol', 'Bengali fish curry', 'Fish'],
  1000007: ['Cholar Dal', 'Bengal gram with coconut', 'Vegetarian'],
  1000008: ['Begun Bhaja', 'Pan-fried aubergine', 'Side'],
  1000009: ['Shukto', 'Mixed vegetable bitter stew', 'Vegetarian'],
  1000010: ['Bhapa Ilish', 'Hilsa steamed in banana leaf', 'Fish'],
};

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);

function flattenSteps(analyzed) {
  const out = [];
  for (const block of analyzed || []) {
    for (const s of block.steps || []) {
      const text = (s.step || '').trim();
      if (text) out.push({ number: out.length + 1, text });
    }
  }
  return out;
}

const banglaRecipes = bangla.map((r) => {
  const [titleEn, subtitle, category] = BN_META[r.id] || [];
  return {
    id: `bn-${r.id}`,
    source: 'bangla',
    lang: 'bn',
    title: r.title,
    titleEn: titleEn || null,
    subtitle: subtitle || null,
    description: r.description || '',
    image: null,
    cuisine: 'Bengali',
    category: category || 'Main',
    tags: ['Bengali', 'Bangladeshi'],
    prepMinutes: r.preparationTimeMinutes || null,
    cookMinutes: r.cookTimeMinutes || null,
    readyInMinutes:
      (r.preparationTimeMinutes || 0) + (r.cookTimeMinutes || 0) || null,
    servings: r.servings || 4,
    ingredients: (r.ingredients || []).map((i) => ({
      name: i.name || i.originalName || '',
      nameClean: i.nameClean || null,
      amount: typeof i.amount === 'number' ? i.amount : null,
      unit: i.unit || '',
      original: i.original || '',
      aisle: i.aisle || 'Other',
    })),
    steps: flattenSteps(r.analyzedInstructions),
  };
});

/**
 * The seed data carries three kinds of useless image reference: absolute URLs
 * to the old dev server, 1x1 base64 placeholders, and names of files that were
 * committed empty. None of them render, so they resolve to null and the app
 * draws its generated plate instead. Only a real remote URL survives.
 */
function usableImage(image) {
  if (typeof image !== 'string' || !image.trim()) return null;
  if (image.startsWith('data:')) return null;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(image)) return null;
  return /^https?:\/\//.test(image) ? image : null;
}

// The seed file accumulated a couple of throwaway rows during development.
const isRealRecipe = (r) =>
  (r.extendedIngredients || []).length > 2 &&
  (r.title || '').trim().length > 3 &&
  /\s/.test((r.title || '').trim());

/** Both sources/local.json (dev seed data) and sources/curated.json (hand-authored
 * real recipes) share this Spoonacular-like shape, so one mapper covers both. */
function mapLocalShaped(list, { idPrefix, source }) {
  return list.filter(isRealRecipe).map((r) => ({
    id: `${idPrefix}-${r.id}`,
    source,
    lang: 'en',
    title: r.title,
    titleEn: r.title,
    subtitle: r.subtitle || null,
    description: r.description || '',
    image: usableImage(r.image),
    cuisine: r.cuisine || 'International',
    category: r.category || 'Main',
    tags: [r.difficulty].filter(Boolean),
    prepMinutes: null,
    cookMinutes: null,
    readyInMinutes: r.readyInMinutes || null,
    servings: r.servings || 2,
    difficulty: r.difficulty || null,
    ingredients: (r.extendedIngredients || []).map((i) => ({
      name: i.name,
      nameClean: (i.name || '').toLowerCase(),
      amount: typeof i.amount === 'number' ? i.amount : null,
      unit: i.unit || '',
      original: [i.amount, i.unit, i.name].filter(Boolean).join(' '),
      aisle: i.aisle || 'Other',
    })),
    steps: flattenSteps(r.analyzedInstructions),
  }));
}

const localRecipes = mapLocalShaped(local, { idPrefix: 'lc', source: 'local' });
const curatedRecipes = mapLocalShaped(curated, { idPrefix: 'cu', source: 'curated' });
const importedRecipes = mapLocalShaped(imported, { idPrefix: 'im', source: 'imported' });
const mealdbRecipes = mealdb.map((meal) => normalizeMeal(meal));

const catalog = [
  ...localRecipes,
  ...curatedRecipes,
  ...importedRecipes,
  ...banglaRecipes,
  ...mealdbRecipes,
].map((r) => ({
  ...r,
  slug: slugify(r.titleEn || r.title) || r.id,
}));

fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
// Readable copy, for review and diffing.
fs.writeFileSync(
  path.join(ROOT, 'data/recipes.json'),
  JSON.stringify(catalog, null, 2) + '\n'
);
// The module the app actually imports — a plain ES module, so it works
// unchanged in the Vite bundle and inside a Node serverless function without
// JSON import attributes or filesystem reads.
fs.writeFileSync(
  path.join(ROOT, 'data/catalog.js'),
  '// Generated by scripts/build-data.mjs — do not edit by hand.\n' +
    '// Run `npm run data:build` after changing anything under sources/.\n' +
    'export const catalog = ' +
    JSON.stringify(catalog) +
    ';\n\nexport default catalog;\n'
);

console.log(`Wrote data/catalog.js — ${catalog.length} recipes`);
for (const r of catalog) {
  console.log(
    `  ${r.id.padEnd(16)} ${r.steps.length} steps  ${r.ingredients.length} ingredients  ${r.titleEn || r.title}`
  );
}
