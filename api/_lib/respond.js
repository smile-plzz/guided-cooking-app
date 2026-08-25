/** Small helpers shared by the serverless handlers. */

/**
 * Sends JSON with a cache policy. Recipe data barely changes, so responses are
 * cached at the edge and served stale while revalidating — that keeps the app
 * fast and keeps us well inside TheMealDB's rate limits.
 */
export function sendJson(res, status, body, { maxAge = 3600 } = {}) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    status === 200
      ? `public, s-maxage=${maxAge}, stale-while-revalidate=86400`
      : 'no-store'
  );
  res.status(status).send(JSON.stringify(body));
}

export function sendError(res, error) {
  const status = error?.status || 500;
  const message =
    status === 429
      ? 'The recipe service is rate limiting us. Try again in a moment.'
      : status === 502
        ? 'The recipe service is unavailable right now.'
        : error?.message || 'Something went wrong.';
  sendJson(res, status, { error: message });
}

/** Rejects anything but GET so the functions cannot be used as an open proxy. */
export function requireGet(req, res) {
  if (req.method === 'GET') return true;
  res.setHeader('Allow', 'GET');
  sendJson(res, 405, { error: 'Method not allowed' });
  return false;
}
