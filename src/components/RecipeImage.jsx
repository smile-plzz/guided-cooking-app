import { useState } from 'react';

/**
 * Many recipes in the catalog have no photograph, and the external source's
 * images occasionally 404. Rather than a broken frame or a grey box, missing
 * art falls back to a generated plate: a warm gradient keyed off the title, so
 * a given recipe always looks the same and a grid of them still looks composed.
 */

const PALETTES = [
  ['#F4C2AF', '#D25334'],
  ['#F8CE70', '#D28D12'],
  ['#8CC7A1', '#2F7049'],
  ['#E7DFD5', '#877A6E'],
  ['#EC9B7E', '#963022'],
  ['#FEF1D6', '#EFA92C'],
];

function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) {
    value = (value * 31 + text.charCodeAt(i)) >>> 0;
  }
  return value;
}

function initials(title) {
  const words = (title || '?').trim().split(/\s+/).slice(0, 2);
  return words.map((w) => [...w][0]).join('');
}

export function RecipeImage({ recipe, className = '', sizes, priority = false }) {
  const [failed, setFailed] = useState(false);
  const title = recipe?.titleEn || recipe?.title || '';
  const src = recipe?.image;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={title}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const [from, to] = PALETTES[hash(title) % PALETTES.length];

  return (
    <div
      role="img"
      aria-label={title ? `${title} — no photograph available` : 'No photograph'}
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      <span
        aria-hidden="true"
        className="font-display text-3xl font-semibold text-white/85 drop-shadow-sm"
      >
        {initials(title)}
      </span>
    </div>
  );
}

export default RecipeImage;
