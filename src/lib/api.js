/** Thin client for the app's own serverless endpoints. */

async function request(path) {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(body.error || 'Request failed'), {
      status: response.status,
    });
  }
  return body;
}

/**
 * Online recipe search. Returns `[]` rather than throwing when the external
 * source is down — the bundled catalog still has results to show, and a dead
 * third party should not empty the page.
 */
export async function searchOnline({ q, cuisine, category, ingredient } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (cuisine) params.set('cuisine', cuisine);
  if (category) params.set('category', category);
  if (ingredient) params.set('ingredient', ingredient);

  const body = await request(`/api/recipes?${params.toString()}`);
  return body.results || [];
}

export async function fetchOnlineRecipe(id) {
  const body = await request(`/api/recipes/${encodeURIComponent(id)}`);
  return body.recipe || null;
}

export async function fetchFacets() {
  return request('/api/facets');
}
