import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BUNDLED_BY_ID } from './catalog.js';
import { fetchOnlineRecipe } from './api.js';
import { KEYS, usePersistentState, readStorage } from './storage.js';

/**
 * A recipe id carries its origin as a prefix: `lc-` and `bn-` are bundled,
 * `my-` is written by the user, `md-` comes from the external source.
 */
export const originOf = (id) => String(id || '').split('-')[0];

export const isOnlineId = (id) => originOf(id) === 'md';
export const isUserId = (id) => originOf(id) === 'my';

export function blankRecipe() {
  return {
    id: `my-${Date.now()}`,
    source: 'user',
    lang: 'en',
    title: '',
    titleEn: '',
    subtitle: '',
    description: '',
    image: '',
    cuisine: '',
    category: 'Main',
    tags: [],
    readyInMinutes: null,
    servings: 2,
    ingredients: [{ name: '', amount: null, unit: '' }],
    steps: [{ number: 1, text: '' }],
  };
}

/** Normalises a form submission into the shape the rest of the app expects. */
export function normalizeUserRecipe(draft) {
  const ingredients = (draft.ingredients || [])
    .filter((i) => (i.name || '').trim())
    .map((i) => {
      const amount =
        i.amount === '' || i.amount === null || i.amount === undefined
          ? null
          : Number(i.amount);
      return {
        name: i.name.trim(),
        nameClean: i.name.trim().toLowerCase(),
        amount: Number.isFinite(amount) ? amount : null,
        unit: (i.unit || '').trim(),
        original: [i.amount, i.unit, i.name].filter(Boolean).join(' ').trim(),
        aisle: i.aisle || 'Other',
      };
    });

  const steps = (draft.steps || [])
    .map((s) => (typeof s === 'string' ? s : s.text) || '')
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({ number: index + 1, text }));

  const minutes = Number(draft.readyInMinutes);

  return {
    ...draft,
    source: 'user',
    title: (draft.title || '').trim(),
    titleEn: (draft.titleEn || draft.title || '').trim(),
    cuisine: (draft.cuisine || 'International').trim(),
    category: draft.category || 'Main',
    servings: Math.max(1, Number(draft.servings) || 1),
    readyInMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : null,
    image: (draft.image || '').trim() || null,
    ingredients,
    steps,
    updatedAt: new Date().toISOString(),
  };
}

export function validateRecipe(draft) {
  const errors = {};
  if (!(draft.title || '').trim()) errors.title = 'Give the recipe a name.';
  if (!(draft.ingredients || []).some((i) => (i.name || '').trim())) {
    errors.ingredients = 'Add at least one ingredient.';
  }
  const hasStep = (draft.steps || []).some((s) =>
    ((typeof s === 'string' ? s : s.text) || '').trim()
  );
  if (!hasStep) errors.steps = 'Add at least one step.';
  return errors;
}

/** CRUD over the user's own recipes. */
export function useMyRecipes() {
  const [recipes, setRecipes] = usePersistentState(KEYS.myRecipes, []);

  const save = useCallback(
    (draft) => {
      const recipe = normalizeUserRecipe(draft);
      setRecipes((current) => {
        const index = current.findIndex((r) => r.id === recipe.id);
        if (index === -1) return [recipe, ...current];
        const next = [...current];
        next[index] = recipe;
        return next;
      });
      return recipe;
    },
    [setRecipes]
  );

  const remove = useCallback(
    (id) => setRecipes((current) => current.filter((r) => r.id !== id)),
    [setRecipes]
  );

  const byId = useMemo(
    () => new Map(recipes.map((r) => [r.id, r])),
    [recipes]
  );

  return { recipes, byId, save, remove };
}

/** Reads user recipes outside React, for the query resolver below. */
const readMyRecipes = () => readStorage(KEYS.myRecipes, []);

/** Resolves any recipe id to a full recipe, whatever its origin. */
export function useRecipe(id) {
  return useQuery({
    queryKey: ['recipe', id],
    enabled: Boolean(id),
    // A bundled or user recipe never goes stale; only online lookups refetch.
    staleTime: isOnlineId(id) ? 60 * 60 * 1000 : Infinity,
    queryFn: async () => {
      if (BUNDLED_BY_ID.has(id)) return BUNDLED_BY_ID.get(id);

      if (isUserId(id)) {
        const mine = readMyRecipes().find((r) => r.id === id);
        if (mine) return mine;
        throw Object.assign(new Error('Recipe not found.'), { status: 404 });
      }

      if (isOnlineId(id)) {
        const recipe = await fetchOnlineRecipe(id);
        if (!recipe) {
          throw Object.assign(new Error('Recipe not found.'), { status: 404 });
        }
        return recipe;
      }

      throw Object.assign(new Error('Recipe not found.'), { status: 404 });
    },
  });
}

/** Total time to show on a card, whichever field the source populated. */
export function totalMinutes(recipe) {
  if (!recipe) return null;
  if (recipe.readyInMinutes) return recipe.readyInMinutes;
  const sum = (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
  return sum || null;
}

/** The title to show, preferring the reader's script but never losing the original. */
export function displayTitle(recipe) {
  if (!recipe) return '';
  return recipe.title || recipe.titleEn || 'Untitled recipe';
}
