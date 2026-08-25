import catalog from '@data/catalog.js';

/**
 * The bundled recipe catalog: the curated English recipes plus the Bengali
 * collection. It ships inside the JS bundle, so searching it is instant and
 * works with no network at all.
 */
export const BUNDLED = catalog;

export const BUNDLED_BY_ID = new Map(BUNDLED.map((r) => [r.id, r]));

/** Every searchable string for a recipe, lowercased once at module load. */
const INDEX = new Map(
  BUNDLED.map((recipe) => [
    recipe.id,
    [
      recipe.title,
      recipe.titleEn,
      recipe.subtitle,
      recipe.cuisine,
      recipe.category,
      ...(recipe.tags || []),
      ...(recipe.ingredients || []).map((i) => `${i.name} ${i.nameClean || ''}`),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  ])
);

export function searchBundled(query, { cuisine, category, source } = {}) {
  const needle = (query || '').trim().toLowerCase();

  return BUNDLED.filter((recipe) => {
    if (cuisine && recipe.cuisine !== cuisine) return false;
    if (category && recipe.category !== category) return false;
    if (source && recipe.source !== source) return false;
    if (!needle) return true;
    return INDEX.get(recipe.id)?.includes(needle);
  });
}

/**
 * Ranks recipes by how much of them the pantry already covers. Used by the
 * "cook from what you have" view.
 */
export function matchAgainstPantry(recipes, pantryItems) {
  const pantry = pantryItems
    .map((item) => (item.name || item).toLowerCase().trim())
    .filter(Boolean);
  if (!pantry.length) return [];

  return recipes
    .map((recipe) => {
      const ingredients = recipe.ingredients || [];
      if (!ingredients.length) return null;

      const missing = [];
      let have = 0;
      for (const ingredient of ingredients) {
        const name = (ingredient.nameClean || ingredient.name || '').toLowerCase();
        // Substring both ways: "onion" in the pantry should match "red onion",
        // and "spring onions" should match a pantry entry of "onion".
        const covered = pantry.some(
          (item) => name.includes(item) || item.includes(name)
        );
        if (covered) have += 1;
        else missing.push(ingredient.name);
      }

      return {
        recipe,
        have,
        total: ingredients.length,
        missing,
        ratio: have / ingredients.length,
      };
    })
    .filter((match) => match && match.have > 0)
    .sort((a, b) => b.ratio - a.ratio || a.missing.length - b.missing.length);
}

/** Facet values present in the bundled catalog, for the filter menus. */
export const BUNDLED_FACETS = {
  cuisines: [...new Set(BUNDLED.map((r) => r.cuisine).filter(Boolean))].sort(),
  categories: [...new Set(BUNDLED.map((r) => r.category).filter(Boolean))].sort(),
};
