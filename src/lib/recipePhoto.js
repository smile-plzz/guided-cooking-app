import { useEffect, useRef, useState } from 'react';
import { KEYS, readStorage, writeStorage } from './storage.js';

/**
 * Most bundled recipes ship with no usable photo (see RecipeImage.jsx). Rather
 * than leave every card as a generated plate forever, look one up on demand
 * from Wikimedia Commons — no API key, CORS-enabled via `origin=*`, images are
 * openly licensed. This runs in the visitor's browser, not at build time: this
 * app has no server-side image pipeline, so "someone's browser has to ask"
 * either happens here or not at all. Results are cached in localStorage so a
 * given recipe is only ever looked up once per device.
 */
const CACHE_KEY = KEYS.photoCache;
const RETRY_MISS_AFTER_MS = 30 * 24 * 60 * 60 * 1000; // a miss may find a match later as Commons grows
const JUNK_TITLE = /\b(icon|logo|flag|map|symbol|diagram|question mark|placeholder)\b/i;

const inFlight = new Map();

function readCache() {
  return readStorage(CACHE_KEY, {});
}

function writeCacheEntry(id, entry) {
  const cache = readCache();
  cache[id] = entry;
  writeStorage(CACHE_KEY, cache);
}

async function searchCommons(query) {
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: `${query} filetype:bitmap`,
      gsrnamespace: '6',
      gsrlimit: '3',
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '640',
      format: 'json',
      origin: '*',
    });

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {});
  for (const page of pages) {
    if (JUNK_TITLE.test(page.title || '')) continue;
    const info = page.imageinfo?.[0];
    if (!info || !/^image\/(jpeg|png|webp)$/.test(info.mime || '')) continue;
    return info.thumburl || info.url || null;
  }
  return null;
}

async function resolvePhoto(id, title) {
  if (inFlight.has(id)) return inFlight.get(id);

  const promise = (async () => {
    try {
      const url = (await searchCommons(`${title} food`)) || (await searchCommons(title));
      writeCacheEntry(id, { url: url || null, ts: Date.now() });
      return url || null;
    } catch {
      return null;
    } finally {
      inFlight.delete(id);
    }
  })();

  inFlight.set(id, promise);
  return promise;
}

/**
 * Resolves a recipe photo lazily, once the card is near the viewport, and
 * only for recipes that don't already carry a usable `image`. Returns null
 * until (if ever) a match is found — callers keep showing their placeholder
 * until then.
 */
export function useRecipePhoto(recipe) {
  const [src, setSrc] = useState(null);
  const ref = useRef(null);
  const id = recipe?.id;
  const title = recipe?.titleEn || recipe?.title;

  useEffect(() => {
    if (!id || !title || typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;

    const cached = readCache()[id];
    if (cached && (cached.url || Date.now() - cached.ts < RETRY_MISS_AFTER_MS)) {
      setSrc(cached.url || null);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          resolvePhoto(id, title).then((url) => setSrc(url));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id, title]);

  return { src, ref };
}
