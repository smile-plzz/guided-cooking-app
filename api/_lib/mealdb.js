/**
 * TheMealDB client.
 *
 * TheMealDB is keyless on its public developer endpoint, which is what lets the
 * deployed app work with no configuration at all. Its response shape is very
 * different from ours (ingredients live in 20 flat `strIngredient1..20` keys),
 * so everything is normalised here into the same recipe shape the bundled
 * catalog uses.
 */

const BASE = 'https://www.themealdb.com/api/json/v1/1';

async function get(pathAndQuery) {
  const res = await fetch(`${BASE}${pathAndQuery}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw Object.assign(new Error(`TheMealDB responded ${res.status}`), {
      status: res.status === 429 ? 429 : 502,
    });
  }
  return res.json();
}

/** Splits an instruction blob into numbered steps a cook can follow one at a time. */
function parseSteps(instructions) {
  if (!instructions) return [];
  const raw = instructions
    .replace(/\r\n/g, '\n')
    .split(/\n+|(?<=\.)\s{2,}/)
    .map((s) => s.trim())
    // Drop the "STEP 1" / "1." headers some entries use as their own line.
    .filter((s) => s.length > 0 && !/^(step\s*\d+|\d+[).:])$/i.test(s))
    .map((s) => s.replace(/^step\s*\d+[).:\s-]*/i, '').trim())
    .filter(Boolean);

  // A few entries are one long paragraph; split those on sentence boundaries so
  // guided mode still has something to page through.
  const steps = raw.length > 1 ? raw : splitParagraph(raw[0] || '');
  return steps.map((text, i) => ({ number: i + 1, text }));
}

function splitParagraph(text) {
  if (!text) return [];
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  const out = [];
  let buffer = '';
  for (const sentence of sentences) {
    buffer += sentence;
    // Group short sentences together so a step is a real unit of work.
    if (buffer.trim().length > 90) {
      out.push(buffer.trim());
      buffer = '';
    }
  }
  if (buffer.trim()) out.push(buffer.trim());
  return out;
}

/** Pulls `strIngredient1..20` / `strMeasure1..20` into a flat ingredient list. */
function parseIngredients(meal) {
  const out = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = (meal[`strIngredient${i}`] || '').trim();
    if (!name) continue;
    const measure = (meal[`strMeasure${i}`] || '').trim();
    const { amount, unit } = parseMeasure(measure);
    out.push({
      name,
      nameClean: name.toLowerCase(),
      amount,
      unit,
      original: measure ? `${measure} ${name}` : name,
      aisle: 'Other',
    });
  }
  return out;
}

const FRACTIONS = {
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
};

/** "1 1/2 tbs" -> { amount: 1.5, unit: 'tbs' }. Returns nulls when unparseable. */
export function parseMeasure(measure) {
  if (!measure) return { amount: null, unit: '' };
  let rest = measure.trim();
  for (const [glyph, value] of Object.entries(FRACTIONS)) {
    rest = rest.replace(glyph, ` ${value} `);
  }
  const match = rest.match(/^\s*(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+))?(?:\s+(\d+)\s*\/\s*(\d+))?\s*(.*)$/);
  if (!match) return { amount: null, unit: measure };

  const [, whole, denom, mixedNum, mixedDenom, tail] = match;
  let amount = Number(whole);
  if (denom) amount = amount / Number(denom);
  if (mixedNum && mixedDenom) amount += Number(mixedNum) / Number(mixedDenom);

  return {
    amount: Number.isFinite(amount) ? Math.round(amount * 1000) / 1000 : null,
    unit: (tail || '').trim(),
  };
}

export function normalizeMeal(meal) {
  const steps = parseSteps(meal.strInstructions);
  const ingredients = parseIngredients(meal);
  return {
    id: `md-${meal.idMeal}`,
    source: 'mealdb',
    lang: 'en',
    title: meal.strMeal,
    titleEn: meal.strMeal,
    subtitle: null,
    description: '',
    image: meal.strMealThumb || null,
    cuisine: meal.strArea || 'International',
    category: meal.strCategory || 'Main',
    tags: (meal.strTags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    // TheMealDB carries no timing data; estimate from the amount of work so the
    // card is not blank. Flagged as an estimate in the UI.
    readyInMinutes: steps.length ? Math.min(120, 10 + steps.length * 6) : null,
    timeIsEstimate: true,
    prepMinutes: null,
    cookMinutes: null,
    servings: 4,
    video: meal.strYoutube || null,
    sourceUrl: meal.strSource || null,
    ingredients,
    steps,
    slug: (meal.strMeal || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-'),
  };
}

/** Card-sized record: enough to render a tile without a per-recipe lookup. */
export function normalizeSummary(meal) {
  return {
    id: `md-${meal.idMeal}`,
    source: 'mealdb',
    lang: 'en',
    title: meal.strMeal,
    titleEn: meal.strMeal,
    image: meal.strMealThumb || null,
    cuisine: meal.strArea || null,
    category: meal.strCategory || null,
    partial: true,
  };
}

export async function searchMeals(query) {
  const data = await get(`/search.php?s=${encodeURIComponent(query || '')}`);
  return (data.meals || []).map(normalizeMeal);
}

export async function filterMeals({ cuisine, category, ingredient }) {
  let param = '';
  if (cuisine) param = `a=${encodeURIComponent(cuisine)}`;
  else if (category) param = `c=${encodeURIComponent(category)}`;
  else if (ingredient) param = `i=${encodeURIComponent(ingredient)}`;
  else return [];
  const data = await get(`/filter.php?${param}`);
  return (data.meals || []).map(normalizeSummary);
}

export async function lookupMeal(id) {
  const data = await get(`/lookup.php?i=${encodeURIComponent(id)}`);
  const meal = (data.meals || [])[0];
  return meal ? normalizeMeal(meal) : null;
}

export async function randomMeals(count = 1) {
  const results = await Promise.all(
    Array.from({ length: count }, () => get('/random.php'))
  );
  const seen = new Set();
  const meals = [];
  for (const data of results) {
    const meal = (data.meals || [])[0];
    if (meal && !seen.has(meal.idMeal)) {
      seen.add(meal.idMeal);
      meals.push(normalizeMeal(meal));
    }
  }
  return meals;
}

export async function listFacets() {
  const [areas, categories] = await Promise.all([
    get('/list.php?a=list'),
    get('/list.php?c=list'),
  ]);
  return {
    cuisines: (areas.meals || []).map((m) => m.strArea).filter(Boolean),
    categories: (categories.meals || []).map((m) => m.strCategory).filter(Boolean),
  };
}
