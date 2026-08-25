/**
 * Pulls cooking durations out of instruction text so guided mode can offer a
 * one-tap timer on the steps that need one.
 */

// English: "10 minutes", "1-2 hrs", "45 secs". Bengali: "১৫ মিনিট", "২ ঘন্টা".
const EN_PATTERN =
  /(\d+(?:\.\d+)?)\s*(?:-|–|to)?\s*(\d+(?:\.\d+)?)?\s*(hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/gi;

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const BN_PATTERN =
  /([০-৯]+(?:\.[০-৯]+)?)\s*(?:-|–|থেকে)?\s*([০-৯]+(?:\.[০-৯]+)?)?\s*(ঘণ্টা|ঘন্টা|মিনিট|সেকেন্ড)/g;

const bengaliToNumber = (text) =>
  Number(
    [...text]
      .map((ch) => {
        const index = BN_DIGITS.indexOf(ch);
        return index === -1 ? ch : String(index);
      })
      .join('')
  );

function unitToSeconds(unit) {
  const u = unit.toLowerCase();
  if (/^(h|hr|hrs|hour|hours|ঘণ্টা|ঘন্টা)$/.test(u)) return 3600;
  if (/^(s|sec|secs|second|seconds|সেকেন্ড)$/.test(u)) return 1;
  return 60;
}

/**
 * Returns every duration mentioned in a step, longest first. A range like
 * "10-12 minutes" resolves to its upper bound — under-timing food is the worse
 * failure, and the cook can always stop early.
 */
export function extractDurations(text) {
  if (!text) return [];
  const found = [];

  for (const match of text.matchAll(EN_PATTERN)) {
    const [, low, high, unit] = match;
    const value = Number(high || low);
    if (!Number.isFinite(value) || value <= 0) continue;
    found.push({
      seconds: Math.round(value * unitToSeconds(unit)),
      label: match[0].trim(),
    });
  }

  for (const match of text.matchAll(BN_PATTERN)) {
    const [, low, high, unit] = match;
    const value = bengaliToNumber(high || low);
    if (!Number.isFinite(value) || value <= 0) continue;
    found.push({
      seconds: Math.round(value * unitToSeconds(unit)),
      label: match[0].trim(),
    });
  }

  // Anything under 10s is almost always "sauté 5" style prose, not a timer.
  return found
    .filter((d) => d.seconds >= 10 && d.seconds <= 12 * 3600)
    .sort((a, b) => b.seconds - a.seconds)
    .filter(
      (d, i, all) => all.findIndex((other) => other.seconds === d.seconds) === i
    );
}

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** "1 hr 20 min" — for labels, where a clock readout would be noise. */
export function humanizeMinutes(minutes) {
  if (!minutes && minutes !== 0) return null;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h} hr ${m} min` : `${h} hr`;
}
