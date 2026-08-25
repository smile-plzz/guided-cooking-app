import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import RecipeCard from '../components/RecipeCard.jsx';
import { EmptyState, GridSkeleton, InfoTip, SectionHeading } from '../components/ui.jsx';
import { Search, Sparkle, Wifi, Plus, Fridge } from '../components/icons.jsx';
import { BUNDLED_FACETS, searchBundled } from '../lib/catalog.js';
import { searchOnline } from '../lib/api.js';
import { KEYS, useIdSet, usePersistentState } from '../lib/storage.js';
import { useMyRecipes } from '../lib/recipes.js';

const COLLECTIONS = [
  { value: '', label: 'Everything' },
  { value: 'bangla', label: 'Bengali' },
  { value: 'local', label: 'House recipes' },
  { value: 'user', label: 'Yours' },
  { value: 'mealdb', label: 'Community' },
];

function FilterRail({ label, hint, options, value, onChange }) {
  if (!options.length) return null;
  return (
    <div>
      <p className="label inline-flex items-center gap-1.5">
        {label}
        {hint ? <InfoTip label={`About ${label.toLowerCase()}`}>{hint}</InfoTip> : null}
      </p>
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const active = value === optionValue;
          return (
            <button
              key={optionValue || 'all'}
              type="button"
              onClick={() => onChange(active ? '' : optionValue)}
              aria-pressed={active}
              className={`chip shrink-0 ${active ? 'chip-active' : ''}`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Discover() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const cuisine = params.get('cuisine') || '';
  const category = params.get('category') || '';
  const collection = params.get('from') || '';

  const { recipes: myRecipes } = useMyRecipes();
  const favorites = useIdSet(KEYS.favorites);
  const [recent, setRecent] = usePersistentState(KEYS.recentSearches, []);

  const [localSearch, setLocalSearch] = useState(query);
  useEffect(() => setLocalSearch(query), [query]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // Remember searches that returned something worth going back to.
  useEffect(() => {
    if (!query.trim()) return undefined;
    const timer = setTimeout(() => {
      setRecent((current) =>
        [query, ...current.filter((term) => term !== query)].slice(0, 6)
      );
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  /** Bundled catalog plus the user's own recipes, filtered client-side. */
  const offlineResults = useMemo(() => {
    const bundled =
      collection === 'user'
        ? []
        : searchBundled(query, {
            cuisine,
            category,
            source: collection === 'mealdb' ? '__none__' : collection,
          });

    const needle = query.trim().toLowerCase();
    const mine =
      collection && collection !== 'user'
        ? []
        : myRecipes.filter((recipe) => {
            if (cuisine && recipe.cuisine !== cuisine) return false;
            if (category && recipe.category !== category) return false;
            if (!needle) return true;
            const haystack = [
              recipe.title,
              recipe.cuisine,
              ...(recipe.ingredients || []).map((i) => i.name),
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            return haystack.includes(needle);
          });

    return [...mine, ...bundled];
  }, [query, cuisine, category, collection, myRecipes]);

  // Only reach for the network when it can add something: a real search, or a
  // cuisine/category the bundled catalog cannot satisfy on its own.
  const wantsOnline =
    collection !== 'user' &&
    collection !== 'bangla' &&
    collection !== 'local' &&
    Boolean(query.trim() || cuisine || category || !offlineResults.length);

  const online = useQuery({
    queryKey: ['discover', query, cuisine, category],
    enabled: wantsOnline,
    staleTime: 10 * 60 * 1000,
    queryFn: () =>
      searchOnline({
        q: query.trim() || undefined,
        cuisine: cuisine || undefined,
        category: category || undefined,
      }),
  });

  const onlineResults = useMemo(() => {
    if (!online.data) return [];
    const seen = new Set(offlineResults.map((r) => r.id));
    return online.data.filter((r) => !seen.has(r.id));
  }, [online.data, offlineResults]);

  const cuisines = useMemo(() => {
    const fromOnline = (online.data || []).map((r) => r.cuisine).filter(Boolean);
    return [...new Set([...BUNDLED_FACETS.cuisines, ...fromOnline])].sort();
  }, [online.data]);

  const categories = useMemo(() => {
    const fromOnline = (online.data || []).map((r) => r.category).filter(Boolean);
    return [...new Set([...BUNDLED_FACETS.categories, ...fromOnline])].sort();
  }, [online.data]);

  const total = offlineResults.length + onlineResults.length;
  const hasFilters = Boolean(query || cuisine || category || collection);
  const showOnlineSection = wantsOnline && (online.isLoading || onlineResults.length > 0);

  return (
    <div className="page space-y-10">
      {!hasFilters ? (
        <section className="card relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-ember-500/15 blur-3xl"
          />
          <div className="relative max-w-2xl space-y-4">
            <p className="eyebrow">Guided cooking</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Cook it properly, without holding your phone.
            </h1>
            <p className="text-base text-muted">
              Scale a recipe to the table you are actually feeding, then hand the
              steps over to guided mode — one instruction at a time, with the
              timers already set.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setParam('from', 'bangla')}
                className="btn-primary btn-lg"
              >
                <Sparkle size={17} />
                Bengali collection
              </button>
              <Link to="/pantry" className="btn-secondary btn-lg">
                <Fridge size={17} />
                Cook from my pantry
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setParam('q', localSearch.trim());
          }}
          role="search"
          className="relative"
        >
          <label htmlFor="discover-search" className="sr-only">
            Search recipes
          </label>
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
          />
          <input
            id="discover-search"
            type="search"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            placeholder="Try “ilish”, “pasta”, or an ingredient you have"
            className="field py-3.5 pl-11 pr-28 text-base"
          />
          <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2">
            Search
          </button>
        </form>

        {!query && recent.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Recent:</span>
            {recent.map((term) => (
              <button
                key={term}
                type="button"
                className="chip"
                onClick={() => setParam('q', term)}
              >
                {term}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <FilterRail
            label="Collection"
            hint="Where the recipe comes from: the Bengali collection, house recipes written for this app, recipes you've written, or results from the community catalogue (TheMealDB)."
            options={COLLECTIONS}
            value={collection}
            onChange={(value) => setParam('from', value)}
          />
          <FilterRail
            label="Cuisine"
            options={cuisines}
            value={cuisine}
            onChange={(value) => setParam('cuisine', value)}
          />
          <FilterRail
            label="Course"
            options={categories}
            value={category}
            onChange={(value) => setParam('category', value)}
          />
        </div>

        {hasFilters ? (
          <div className="flex items-center justify-between gap-3 text-sm text-muted">
            <p aria-live="polite">
              {total} {total === 1 ? 'recipe' : 'recipes'}
              {query ? ` for “${query}”` : ''}
            </p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </section>

      {offlineResults.length ? (
        <section>
          <SectionHeading
            eyebrow="In the app"
            title={query ? 'Matches in your library' : 'From the collection'}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offlineResults.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                isFavorite={favorites.has(recipe.id)}
                onToggleFavorite={favorites.toggle}
              />
            ))}
          </div>
        </section>
      ) : null}

      {showOnlineSection ? (
        <section>
          <SectionHeading
            eyebrow="Community recipes"
            title={
              <span className="inline-flex items-center gap-1.5">
                {query ? 'More from the wider catalogue' : 'Something to try tonight'}
                <InfoTip label="Where these come from">
                  Fetched live from TheMealDB, a free community recipe
                  database, and shown alongside the app&apos;s bundled
                  collection.
                </InfoTip>
              </span>
            }
          />
          {online.isLoading ? (
            <GridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {onlineResults.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  index={index}
                  isFavorite={favorites.has(recipe.id)}
                  onToggleFavorite={favorites.toggle}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {online.isError && !offlineResults.length ? (
        <EmptyState icon={Wifi} title="Could not reach the recipe service">
          The bundled collection is still searchable — clear the filters to browse
          it, or try again in a moment.
        </EmptyState>
      ) : null}

      {total === 0 && !online.isLoading && !online.isError ? (
        <EmptyState
          icon={Search}
          title="Nothing matched that"
          action={
            <Link to="/recipes/new" className="btn-primary mt-2">
              <Plus size={16} />
              Write it yourself
            </Link>
          }
        >
          Try a shorter search, drop a filter, or add the recipe to your own
          collection.
        </EmptyState>
      ) : null}
    </div>
  );
}

export default Discover;
