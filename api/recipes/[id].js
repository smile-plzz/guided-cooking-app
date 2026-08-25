import { lookupMeal } from '../_lib/mealdb.js';
import { sendJson, sendError, requireGet } from '../_lib/respond.js';

/**
 * GET /api/recipes/:id — full record for one external recipe.
 * Accepts either the app-prefixed id (`md-52772`) or the bare source id.
 */
export default async function handler(req, res) {
  if (!requireGet(req, res)) return;

  const raw = String(req.query.id || '');
  const mealId = raw.replace(/^md-/, '');
  if (!/^\d+$/.test(mealId)) {
    return sendJson(res, 400, { error: 'Not an external recipe id.' });
  }

  try {
    const recipe = await lookupMeal(mealId);
    if (!recipe) return sendJson(res, 404, { error: 'Recipe not found.' });
    return sendJson(res, 200, { recipe });
  } catch (error) {
    return sendError(res, error);
  }
}
