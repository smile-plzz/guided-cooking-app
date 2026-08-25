/** Week/meal-slot helpers shared by the planner and the add-to-plan dialog. */

export const SLOTS = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

/** ISO date key (YYYY-MM-DD) in the user's own timezone, not UTC. */
export function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Monday of the week containing `date`. */
export function startOfWeek(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const offset = (start.getDay() + 6) % 7; // Sunday is 0; shift so Monday is 0.
  start.setDate(start.getDate() - offset);
  return start;
}

export function weekDays(weekStart) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
}

export function addWeeks(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count * 7);
  return next;
}

export function formatWeekRange(weekStart) {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 6);
  const sameMonth = weekStart.getMonth() === end.getMonth();
  const startText = weekStart.toLocaleDateString(undefined, {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  });
  const endText = end.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: end.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
  return `${startText} – ${endText}`;
}

export const isToday = (date) => dateKey(date) === dateKey(new Date());

/**
 * Stores just enough of a recipe to render the plan and build a shopping list
 * without another network call — the plan has to survive going offline.
 */
export function planEntryFrom(recipe, servings) {
  return {
    key: `${recipe.id}-${Date.now()}`,
    id: recipe.id,
    title: recipe.title,
    image: recipe.image || null,
    lang: recipe.lang || 'en',
    baseServings: recipe.servings || 1,
    servings: servings || recipe.servings || 1,
    ingredients: (recipe.ingredients || []).map((i) => ({
      name: i.name,
      nameClean: i.nameClean || (i.name || '').toLowerCase(),
      amount: i.amount ?? null,
      unit: i.unit || '',
      aisle: i.aisle || 'Other',
      original: i.original || '',
    })),
  };
}

export function addToPlan(plan, day, slot, entry) {
  const dayPlan = plan[day] || {};
  return {
    ...plan,
    [day]: { ...dayPlan, [slot]: [...(dayPlan[slot] || []), entry] },
  };
}

export function removeFromPlan(plan, day, slot, entryKey) {
  const dayPlan = plan[day];
  if (!dayPlan?.[slot]) return plan;
  const remaining = dayPlan[slot].filter((entry) => entry.key !== entryKey);
  const nextDay = { ...dayPlan, [slot]: remaining };
  // Drop empty days so the stored plan does not grow forever.
  const stillUsed = SLOTS.some((s) => (nextDay[s.key] || []).length > 0);
  if (!stillUsed) {
    const { [day]: _removed, ...rest } = plan;
    return rest;
  }
  return { ...plan, [day]: nextDay };
}

/** Every planned entry across a set of days, in order. */
export function entriesForDays(plan, days) {
  const out = [];
  for (const day of days) {
    const key = dateKey(day);
    for (const slot of SLOTS) {
      for (const entry of plan[key]?.[slot.key] || []) {
        out.push({ ...entry, day: key, slot: slot.key });
      }
    }
  }
  return out;
}
