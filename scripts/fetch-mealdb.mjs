/**
 * Pulls the full public TheMealDB catalog and writes it to sources/mealdb.json
 * as raw meal objects (same shape api/_lib/mealdb.js normalizes at request
 * time), so `npm run data:build` can bake them into data/recipes.json for
 * offline/bundled use.
 *
 * TheMealDB's free endpoint has no bulk "list everything" call, so this
 * fetches by first letter (search.php?f=a..z) and dedupes by idMeal.
 *
 * Run with: node scripts/fetch-mealdb.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://www.themealdb.com/api/json/v1/1';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

async function get(pathAndQuery) {
  const res = await fetch(`${BASE}${pathAndQuery}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`TheMealDB responded ${res.status} for ${pathAndQuery}`);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const byId = new Map();
  for (const letter of LETTERS) {
    let data;
    try {
      data = await get(`/search.php?f=${letter}`);
    } catch (err) {
      console.error(`  letter "${letter}" failed: ${err.message}`);
      continue;
    }
    for (const meal of data.meals || []) {
      byId.set(meal.idMeal, meal);
    }
    console.log(`  "${letter}": ${(data.meals || []).length} meals (total ${byId.size})`);
    await sleep(150); // be polite to the free/keyless endpoint
  }

  const meals = [...byId.values()].sort((a, b) => Number(a.idMeal) - Number(b.idMeal));
  fs.writeFileSync(
    path.join(ROOT, 'sources/mealdb.json'),
    JSON.stringify(meals, null, 2) + '\n'
  );
  console.log(`Wrote sources/mealdb.json — ${meals.length} recipes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
