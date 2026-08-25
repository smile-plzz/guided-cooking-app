import { searchMeals, filterMeals, randomMeals } from '../_lib/mealdb.js';
import { sendJson, sendError, requireGet } from '../_lib/respond.js';

/**
 * GET /api/recipes
 *
 * Online recipe discovery. The app's own bundled catalog is searched on the
 * client, so this endpoint only covers the external source and the two are
 * merged in the UI.
 *
 * Query: q, cuisine, category, ingredient. With none of them, returns a
 * rotating set of suggestions for the empty state.
 */
export default async function handler(req, res) {
  if (!requireGet(req, res)) return;

  const { q = '', cuisine = '', category = '', ingredient = '' } = req.query;

  try {
    if (q.trim()) {
      const results = await searchMeals(q.trim());
      return sendJson(res, 200, { results, complete: true });
    }
    if (cuisine || category || ingredient) {
      const results = await filterMeals({ cuisine, category, ingredient });
      // filter.php returns cards without ingredients or steps; the UI fetches
      // the full record when a card is opened.
      return sendJson(res, 200, { results, complete: false });
    }
    const results = await randomMeals(8);
    return sendJson(res, 200, { results, complete: true }, { maxAge: 300 });
  } catch (error) {
    return sendError(res, error);
  }
}
