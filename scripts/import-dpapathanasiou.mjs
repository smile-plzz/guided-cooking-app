/**
 * Imports a curated slice of the dpapathanasiou/recipes dataset
 * (https://github.com/dpapathanasiou/recipes, MIT licensed, ~73k recipes
 * scraped into simple { title, ingredients[], directions[] } JSON files)
 * into sources/imported.json, in the same shape sources/local.json and
 * sources/curated.json already use so build-data.mjs can bake them in.
 *
 * Run with: node scripts/import-dpapathanasiou.mjs <path-to-cloned-repo> [count]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRepo = process.argv[2];
const targetCount = Number(process.argv[3] || 600);

if (!srcRepo) {
  console.error('Usage: node scripts/import-dpapathanasiou.mjs <path-to-cloned-repo> [count]');
  process.exit(1);
}

const indexDir = path.join(srcRepo, 'index');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

console.log('Listing recipe files...');
const files = walk(indexDir).sort(); // deterministic, alphabetical (spreads across letter dirs)
console.log(`Found ${files.length} files.`);

// Stride evenly through the alphabetically-sorted list so the sample spans
// the whole dataset (many cuisines/styles) rather than clustering on "a".
const stride = Math.max(1, Math.floor(files.length / (targetCount * 3)));

const isDrink = (title) =>
  /\b(cocktail|martini|margarita|daiquiri|mojito|sangria|punch|shot|liqueur)\b/i.test(title);

function toIngredient(text) {
  // Best-effort split of a free-text ingredient line into amount/unit/name.
  // These lines are unstructured prose ("2 cloves garlic, minced"), so this
  // stays approximate; `original` always carries the full, faithful text.
  const match = text.match(
    /^\s*([\d/.\s]+)?\s*(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|ounce|ounces|oz|pound|pounds|lb|lbs|gram|grams|g|kg|clove|cloves|slice|slices|can|cans|package|packages|pinch|dash)?\s*(.*)$/i
  );
  let amount = null;
  let unit = '';
  let name = text;
  if (match) {
    const [, amt, u, rest] = match;
    if (amt && amt.trim()) {
      const parts = amt.trim().split(/\s+/);
      let total = 0;
      let any = false;
      for (const p of parts) {
        if (p.includes('/')) {
          const [n, d] = p.split('/').map(Number);
          if (d) {
            total += n / d;
            any = true;
          }
        } else if (!Number.isNaN(Number(p))) {
          total += Number(p);
          any = true;
        }
      }
      if (any) amount = Math.round(total * 1000) / 1000;
    }
    if (u) unit = u.toLowerCase();
    if (rest && rest.trim()) name = rest.trim();
  }
  return { name, amount, unit, original: text };
}

const recipes = [];
let id = 9000001;
for (let i = 0; i < files.length && recipes.length < targetCount; i += stride) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(files[i], 'utf8'));
  } catch {
    continue;
  }
  const title = (data.title || '').trim();
  const ingredients = (data.ingredients || []).filter((s) => (s || '').trim());
  const directions = (data.directions || []).filter((s) => (s || '').trim());
  if (!title || ingredients.length < 3 || directions.length < 1) continue;
  if (isDrink(title)) continue; // this is a cooking app, not a bar guide

  recipes.push({
    id: id++,
    title,
    subtitle: null,
    description: '',
    image: null,
    cuisine: 'International',
    category: 'Main',
    difficulty: null,
    readyInMinutes: null,
    servings: 4,
    extendedIngredients: ingredients.map(toIngredient),
    analyzedInstructions: [
      { steps: directions.map((step, idx) => ({ number: idx + 1, step })) },
    ],
    attribution: { source: data.source || null, url: data.url || null },
  });
}

fs.writeFileSync(
  path.join(ROOT, 'sources/imported.json'),
  JSON.stringify(recipes, null, 2) + '\n'
);
console.log(`Wrote sources/imported.json — ${recipes.length} recipes`);
