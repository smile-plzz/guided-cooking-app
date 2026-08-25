/** Ingredient amount scaling, unit conversion, and human-readable formatting. */

const VULGAR = [
  [1, '1'],
  [0.75, '¾'],
  [2 / 3, '⅔'],
  [0.5, '½'],
  [1 / 3, '⅓'],
  [0.25, '¼'],
  [0.125, '⅛'],
];

/**
 * Formats a quantity the way a recipe would print it: whole numbers stay whole,
 * common fractions use their glyph, and everything else falls back to at most
 * two decimals. 1.5 -> "1½", 0.333 -> "⅓", 2.47 -> "2.47".
 */
export function formatAmount(amount) {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '';
  if (amount === 0) return '0';

  const whole = Math.floor(amount);
  const remainder = amount - whole;

  if (remainder < 0.02) return String(whole);

  for (const [value, glyph] of VULGAR) {
    if (Math.abs(remainder - value) < 0.02) {
      return whole > 0 ? `${whole}${glyph}` : glyph;
    }
  }

  // Below one, decimals read worse than a rounded fraction of a teaspoon etc.
  const rounded = Math.round(amount * 100) / 100;
  return String(rounded);
}

/**
 * Conversion factors into a canonical unit per measurement family. Only units
 * that actually appear in recipes are listed; anything unknown is left alone.
 */
const VOLUME_ML = {
  tsp: 4.929,
  teaspoon: 4.929,
  teaspoons: 4.929,
  tbsp: 14.787,
  tbs: 14.787,
  tablespoon: 14.787,
  tablespoons: 14.787,
  cup: 236.588,
  cups: 236.588,
  'fl oz': 29.574,
  pint: 473.176,
  pints: 473.176,
  quart: 946.353,
  quarts: 946.353,
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  litre: 1000,
};

const WEIGHT_G = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

const normalizeUnit = (unit) => (unit || '').trim().toLowerCase();

export function unitFamily(unit) {
  const u = normalizeUnit(unit);
  if (u in VOLUME_ML) return 'volume';
  if (u in WEIGHT_G) return 'weight';
  return null;
}

/**
 * Converts an amount into the requested system. Returns the input untouched
 * when the unit is not a convertible measure ("clove", "টুকরা", "to taste").
 */
export function convert(amount, unit, system) {
  if (amount === null || amount === undefined) return { amount, unit };
  const family = unitFamily(unit);
  if (!family) return { amount, unit };

  if (family === 'weight') {
    const grams = amount * WEIGHT_G[normalizeUnit(unit)];
    if (system === 'metric') {
      return grams >= 1000
        ? { amount: round(grams / 1000, 2), unit: 'kg' }
        : { amount: round(grams, 0), unit: 'g' };
    }
    return grams >= 453.592
      ? { amount: round(grams / 453.592, 2), unit: 'lb' }
      : { amount: round(grams / 28.35, 1), unit: 'oz' };
  }

  const ml = amount * VOLUME_ML[normalizeUnit(unit)];
  if (system === 'metric') {
    return ml >= 1000
      ? { amount: round(ml / 1000, 2), unit: 'l' }
      : { amount: round(ml, 0), unit: 'ml' };
  }
  if (ml >= 236.588) return { amount: round(ml / 236.588, 2), unit: 'cup' };
  if (ml >= 14.787) return { amount: round(ml / 14.787, 2), unit: 'tbsp' };
  return { amount: round(ml / 4.929, 2), unit: 'tsp' };
}

function round(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Scales one ingredient to a new serving count and converts its unit.
 * `system` of 'original' leaves units exactly as the recipe wrote them.
 */
export function scaleIngredient(ingredient, factor, system = 'original') {
  const base =
    typeof ingredient.amount === 'number' ? ingredient.amount * factor : null;

  if (base === null) {
    return { ...ingredient, displayAmount: '', displayUnit: ingredient.unit };
  }

  const converted =
    system === 'original'
      ? { amount: base, unit: ingredient.unit }
      : convert(base, ingredient.unit, system);

  return {
    ...ingredient,
    scaledAmount: converted.amount,
    displayAmount: formatAmount(converted.amount),
    displayUnit: converted.unit,
  };
}

/**
 * Merges the same ingredient appearing across several recipes into one line.
 * Amounts only combine when the units share a family; otherwise each distinct
 * unit keeps its own entry so nothing is silently mis-added.
 */
export function aggregateIngredients(entries) {
  const buckets = new Map();

  for (const entry of entries) {
    const name = (entry.nameClean || entry.name || '').trim();
    if (!name) continue;
    const key = `${name.toLowerCase()}|${unitFamily(entry.unit) || normalizeUnit(entry.unit)}`;

    if (!buckets.has(key)) {
      buckets.set(key, {
        name: entry.name,
        unit: entry.unit,
        amount: typeof entry.amount === 'number' ? entry.amount : null,
        aisle: entry.aisle || 'Other',
        sources: entry.from ? [entry.from] : [],
        originals: [entry.original].filter(Boolean),
      });
      continue;
    }

    const bucket = buckets.get(key);
    if (typeof entry.amount === 'number') {
      const family = unitFamily(entry.unit);
      const sameUnit = normalizeUnit(entry.unit) === normalizeUnit(bucket.unit);
      if (sameUnit) {
        bucket.amount = (bucket.amount || 0) + entry.amount;
      } else if (family && family === unitFamily(bucket.unit)) {
        const { amount } = convert(entry.amount, entry.unit, 'metric');
        const base = convert(bucket.amount || 0, bucket.unit, 'metric');
        bucket.amount = (base.amount || 0) + (amount || 0);
        bucket.unit = base.unit;
      } else {
        // Genuinely incompatible — keep the note rather than a wrong total.
        bucket.originals.push(entry.original);
      }
    }
    if (entry.from && !bucket.sources.includes(entry.from)) {
      bucket.sources.push(entry.from);
    }
  }

  return [...buckets.values()].map((b) => ({
    ...b,
    displayAmount: formatAmount(b.amount),
  }));
}
