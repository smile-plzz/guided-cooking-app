import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipePicker from '../components/RecipePicker.jsx';
import { EmptyState } from '../components/ui.jsx';
import {
  Basket,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash,
  X,
} from '../components/icons.jsx';
import { KEYS, usePersistentState } from '../lib/storage.js';
import { useToast } from '../context/AppProviders.jsx';
import { aggregateIngredients } from '../lib/units.js';
import {
  SLOTS,
  addToPlan,
  addWeeks,
  dateKey,
  entriesForDays,
  formatWeekRange,
  isToday,
  planEntryFrom,
  removeFromPlan,
  startOfWeek,
  weekDays,
} from '../lib/plan.js';

export function MealPlanner() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [plan, setPlan] = usePersistentState(KEYS.mealPlan, {});
  const [, setShoppingList] = usePersistentState(KEYS.shoppingList, []);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [picking, setPicking] = useState(null);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const entries = useMemo(() => entriesForDays(plan, days), [plan, days]);

  const handlePick = (recipe) => {
    if (!picking) return;
    setPlan((current) =>
      addToPlan(current, picking.day, picking.slot, planEntryFrom(recipe))
    );
    setPicking(null);
    notify(`${recipe.title} added.`, { tone: 'success' });
  };

  /**
   * Turns the week's plan into one list: every planned recipe's ingredients,
   * scaled to its planned servings, merged where the units allow it.
   */
  const generateList = () => {
    if (!entries.length) {
      notify('Add some meals to the plan first.');
      return;
    }

    const flattened = entries.flatMap((entry) => {
      const factor = (entry.servings || entry.baseServings) / (entry.baseServings || 1);
      return entry.ingredients.map((ingredient) => ({
        ...ingredient,
        amount:
          typeof ingredient.amount === 'number' ? ingredient.amount * factor : null,
        from: entry.title,
      }));
    });

    const merged = aggregateIngredients(flattened);
    setShoppingList((current) => {
      const existing = new Set(current.map((item) => item.name.toLowerCase()));
      const additions = merged
        .filter((item) => !existing.has(item.name.toLowerCase()))
        .map((item, index) => ({
          id: `plan-${Date.now()}-${index}`,
          name: item.name,
          amount: item.amount,
          unit: item.unit || '',
          aisle: item.aisle || 'Other',
          from: item.sources.slice(0, 2).join(', ') +
            (item.sources.length > 2 ? ` +${item.sources.length - 2} more` : ''),
          checked: false,
        }));

      if (!additions.length) {
        notify('Everything from this plan is already on your list.');
        return current;
      }
      notify(`${additions.length} items added to your shopping list.`, {
        tone: 'success',
        action: { label: 'View', onClick: () => navigate('/shopping-list') },
      });
      return [...current, ...additions];
    });
  };

  const clearWeek = () => {
    setPlan((current) => {
      const next = { ...current };
      for (const day of days) delete next[dateKey(day)];
      return next;
    });
    notify('Week cleared.');
  };

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Meal plan</p>
          <h1 className="text-3xl font-semibold">{formatWeekRange(weekStart)}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-[color:var(--border-soft)] p-1">
            <button
              type="button"
              onClick={() => setWeekStart((current) => addWeeks(current, -1))}
              className="btn-ghost rounded-full p-2"
              aria-label="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="px-2 text-xs font-semibold text-strong"
            >
              This week
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((current) => addWeeks(current, 1))}
              className="btn-ghost rounded-full p-2"
              aria-label="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button type="button" onClick={generateList} className="btn-primary">
            <Basket size={16} />
            Build shopping list
          </button>
          {entries.length ? (
            <button type="button" onClick={clearWeek} className="btn-ghost">
              <Trash size={16} />
              Clear week
            </button>
          ) : null}
        </div>
      </header>

      {!entries.length ? (
        <EmptyState icon={Calendar} title="Nothing planned this week">
          Tap a slot below to drop a recipe into it, then build the whole
          week&rsquo;s shopping list in one go.
        </EmptyState>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {days.map((date) => {
          const key = dateKey(date);
          const dayPlan = plan[key] || {};
          const today = isToday(date);

          return (
            <section
              key={key}
              className={`card p-4 ${today ? 'ring-2 ring-ember-500/40' : ''}`}
            >
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="text-base font-semibold">
                  {date.toLocaleDateString(undefined, { weekday: 'long' })}
                </h2>
                <span className={`text-xs ${today ? 'font-semibold text-ember-600 dark:text-ember-300' : 'text-muted'}`}>
                  {today
                    ? 'Today'
                    : date.toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                      })}
                </span>
              </header>

              <div className="space-y-3">
                {SLOTS.map((slot) => {
                  const planned = dayPlan[slot.key] || [];
                  return (
                    <div key={slot.key}>
                      <p className="eyebrow mb-1.5">{slot.label}</p>
                      <ul className="space-y-1.5">
                        {planned.map((entry) => (
                          <li
                            key={entry.key}
                            className="group flex items-center gap-2 rounded-lg bg-[color:var(--surface-sunken)] px-2.5 py-2"
                          >
                            <Link
                              to={`/recipe/${entry.id}`}
                              className="min-w-0 flex-1 truncate text-sm text-strong hover:text-ember-600"
                              lang={entry.lang === 'bn' ? 'bn' : undefined}
                            >
                              {entry.title}
                            </Link>
                            <span className="shrink-0 text-2xs text-muted">
                              ×{entry.servings}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPlan((current) =>
                                  removeFromPlan(current, key, slot.key, entry.key)
                                )
                              }
                              aria-label={`Remove ${entry.title} from ${slot.label}`}
                              className="shrink-0 rounded-full p-1 text-[color:var(--text-muted)] opacity-0 transition hover:text-ember-600 focus:opacity-100 group-hover:opacity-100"
                            >
                              <X size={13} />
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setPicking({ day: key, slot: slot.key })}
                        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[color:var(--border-soft)] py-1.5 text-xs text-muted transition hover:border-ember-400 hover:text-ember-600"
                      >
                        <Plus size={13} />
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <RecipePicker
        open={Boolean(picking)}
        onClose={() => setPicking(null)}
        onPick={handlePick}
        title={
          picking
            ? `Add to ${SLOTS.find((s) => s.key === picking.slot)?.label.toLowerCase()}`
            : 'Choose a recipe'
        }
      />
    </div>
  );
}

export default MealPlanner;
