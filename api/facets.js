import { listFacets } from './_lib/mealdb.js';
import { sendJson, sendError, requireGet } from './_lib/respond.js';

/** GET /api/facets — cuisine and category lists used to build the filter menus. */
export default async function handler(req, res) {
  if (!requireGet(req, res)) return;
  try {
    const facets = await listFacets();
    return sendJson(res, 200, facets, { maxAge: 86400 });
  } catch (error) {
    return sendError(res, error);
  }
}
