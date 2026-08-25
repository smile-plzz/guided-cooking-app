import { useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';
import { CardSkeleton, EmptyState } from '../components/ui.jsx';
import { Book, Heart, Note, Plus } from '../components/icons.jsx';
import { BUNDLED_BY_ID } from '../lib/catalog.js';
import { KEYS, useIdSet, usePersistentState } from '../lib/storage.js';
import { isOnlineId, useMyRecipes, useRecipe } from '../lib/recipes.js';

/**
 * A favourite is stored as an id. Bundled and user recipes resolve instantly;
 * an online one is fetched here so the card can render like any other.
 */
function FavoriteCard({ id, index, favorites }) {
  const local = BUNDLED_BY_ID.get(id);
  const { recipes: myRecipes } = useMyRecipes();
  const mine = myRecipes.find((recipe) => recipe.id === id);
  const needsFetch = !local && !mine && isOnlineId(id);

  const { data, isLoading, isError } = useRecipe(needsFetch ? id : null);
  const recipe = local || mine || data;

  if (needsFetch && isLoading) return <CardSkeleton />;

  if (!recipe) {
    return (
      <div className="card flex flex-col justify-between gap-3 p-4">
        <p className="text-sm text-muted">
          {isError
            ? 'This saved recipe could not be loaded — it may no longer exist.'
            : 'This saved recipe is no longer available.'}
        </p>
        <button
          type="button"
          onClick={() => favorites.toggle(id)}
          className="btn-secondary self-start"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <RecipeCard
      recipe={recipe}
      index={index}
      isFavorite
      onToggleFavorite={favorites.toggle}
    />
  );
}

const TABS = [
  { key: 'favorites', label: 'Favourites' },
  { key: 'mine', label: 'My recipes' },
  { key: 'notes', label: 'Notes' },
];

export function Saved() {
  const [tab, setTab] = useState('favorites');
  const favorites = useIdSet(KEYS.favorites);
  const { recipes: myRecipes } = useMyRecipes();
  const [notes, setNotes] = usePersistentState(KEYS.notes, {});

  const noteEntries = Object.entries(notes).filter(([, text]) => text?.trim());

  return (
    <div className="page space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Your kitchen</p>
          <h1 className="text-3xl font-semibold">Saved</h1>
        </div>
        <Link to="/recipes/new" className="btn-primary">
          <Plus size={16} />
          New recipe
        </Link>
      </header>

      <div
        role="tablist"
        aria-label="Saved content"
        className="flex gap-1 border-b border-[color:var(--border-soft)]"
      >
        {TABS.map((item) => (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`relative -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === item.key
                ? 'border-ember-600 text-strong'
                : 'border-transparent text-muted hover:text-strong'
            }`}
          >
            {item.label}
            <span className="ml-1.5 text-xs text-muted">
              {item.key === 'favorites'
                ? favorites.ids.length
                : item.key === 'mine'
                  ? myRecipes.length
                  : noteEntries.length}
            </span>
          </button>
        ))}
      </div>

      {tab === 'favorites' ? (
        favorites.ids.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.ids.map((id, index) => (
              <FavoriteCard key={id} id={id} index={index} favorites={favorites} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="No favourites yet"
            action={
              <Link to="/" className="btn-primary mt-2">
                Browse recipes
              </Link>
            }
          >
            Tap the heart on any recipe and it lands here.
          </EmptyState>
        )
      ) : null}

      {tab === 'mine' ? (
        myRecipes.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                isFavorite={favorites.has(recipe.id)}
                onToggleFavorite={favorites.toggle}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Book}
            title="No recipes of your own yet"
            action={
              <Link to="/recipes/new" className="btn-primary mt-2">
                <Plus size={16} />
                Write one
              </Link>
            }
          >
            Family recipes, the thing you improvised last Tuesday — write it down
            before you forget the quantities.
          </EmptyState>
        )
      ) : null}

      {tab === 'notes' ? (
        noteEntries.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {noteEntries.map(([id, text]) => (
              <li key={id} className="card border-l-4 border-l-saffron-500 p-4">
                <Link
                  to={`/recipe/${id}`}
                  className="text-sm font-semibold text-strong hover:text-ember-600"
                >
                  {BUNDLED_BY_ID.get(id)?.title ||
                    myRecipes.find((r) => r.id === id)?.title ||
                    'Saved recipe'}
                </Link>
                <p className="mt-2 whitespace-pre-wrap text-sm text-body">{text}</p>
                <button
                  type="button"
                  onClick={() =>
                    setNotes((current) => {
                      const { [id]: _removed, ...rest } = current;
                      return rest;
                    })
                  }
                  className="btn-ghost mt-3 -ml-2 text-xs"
                >
                  Delete note
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Note} title="No notes yet">
            Notes you add to a recipe — “needed 5 more minutes” — collect here.
          </EmptyState>
        )
      ) : null}
    </div>
  );
}

export default Saved;
