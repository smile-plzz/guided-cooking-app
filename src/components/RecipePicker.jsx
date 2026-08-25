import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from './ui.jsx';
import RecipeImage from './RecipeImage.jsx';
import { Search } from './icons.jsx';
import { searchBundled } from '../lib/catalog.js';
import { searchOnline, fetchOnlineRecipe } from '../lib/api.js';
import { useMyRecipes, isOnlineId } from '../lib/recipes.js';
import { humanizeMinutes } from '../lib/timers.js';
import { totalMinutes } from '../lib/recipes.js';

/**
 * Recipe chooser used by the meal planner. Searches the bundled catalog and the
 * user's own recipes instantly, and the online source in the background.
 *
 * `onPick` receives a *complete* recipe: online results arrive as summary cards
 * without ingredients, so the full record is fetched before handing it over —
 * the plan needs the ingredients to build a shopping list later.
 */
export function RecipePicker({ open, onClose, onPick, title = 'Choose a recipe' }) {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const { recipes: myRecipes } = useMyRecipes();

  useEffect(() => {
    if (!open) {
      setTerm('');
      setDebounced('');
      return undefined;
    }
    const timer = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term, open]);

  const offline = useMemo(() => {
    const needle = debounced.toLowerCase();
    const mine = myRecipes.filter(
      (recipe) => !needle || recipe.title.toLowerCase().includes(needle)
    );
    return [...mine, ...searchBundled(debounced)];
  }, [debounced, myRecipes]);

  const online = useQuery({
    queryKey: ['picker', debounced],
    enabled: open && debounced.length > 2,
    staleTime: 10 * 60 * 1000,
    queryFn: () => searchOnline({ q: debounced }),
  });

  const results = useMemo(() => {
    const seen = new Set(offline.map((r) => r.id));
    const extra = (online.data || []).filter((r) => !seen.has(r.id));
    return [...offline, ...extra].slice(0, 40);
  }, [offline, online.data]);

  const choose = async (recipe) => {
    // Summary cards from the online source carry no ingredients yet.
    if (isOnlineId(recipe.id) && (recipe.partial || !recipe.ingredients?.length)) {
      setLoadingId(recipe.id);
      try {
        const full = await fetchOnlineRecipe(recipe.id);
        if (full) {
          onPick(full);
          return;
        }
      } catch {
        // Fall through and use what we have rather than blocking the pick.
      } finally {
        setLoadingId(null);
      }
    }
    onPick(recipe);
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="relative mb-4">
        <label htmlFor="picker-search" className="sr-only">
          Search recipes
        </label>
        <Search
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
        />
        <input
          id="picker-search"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search your recipes and the wider catalogue"
          className="field pl-10"
          autoComplete="off"
        />
      </div>

      {online.isLoading ? (
        <p className="mb-3 text-xs text-muted">Searching the wider catalogue…</p>
      ) : null}

      {results.length ? (
        <ul className="space-y-1">
          {results.map((recipe) => {
            const minutes = totalMinutes(recipe);
            return (
              <li key={recipe.id}>
                <button
                  type="button"
                  onClick={() => choose(recipe)}
                  disabled={loadingId === recipe.id}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[color:var(--surface-sunken)] disabled:opacity-50"
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[color:var(--surface-sunken)]">
                    <RecipeImage recipe={recipe} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-sm font-medium text-strong"
                      lang={recipe.lang === 'bn' ? 'bn' : undefined}
                    >
                      {recipe.title}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {[recipe.cuisine, minutes ? humanizeMinutes(minutes) : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  {loadingId === recipe.id ? (
                    <span className="text-xs text-muted">Loading…</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-8 text-center text-sm text-muted">
          {debounced
            ? 'Nothing matched that search.'
            : 'Start typing to search, or browse the collection below.'}
        </p>
      )}
    </Modal>
  );
}

export default RecipePicker;
