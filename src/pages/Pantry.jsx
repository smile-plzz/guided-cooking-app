import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';
import { EmptyState, InfoTip, SectionHeading } from '../components/ui.jsx';
import { Fridge, Plus, Trash, X } from '../components/icons.jsx';
import { BUNDLED, matchAgainstPantry } from '../lib/catalog.js';
import { KEYS, useIdSet, usePersistentState } from '../lib/storage.js';
import { useMyRecipes } from '../lib/recipes.js';
import { useToast } from '../context/AppProviders.jsx';

/** Staples most kitchens have; seeds an empty pantry in one tap each. */
const SUGGESTIONS = [
  'Salt',
  'Black pepper',
  'Olive oil',
  'Onion',
  'Garlic',
  'Butter',
  'Eggs',
  'Flour',
  'Rice',
  'Turmeric',
  'Cumin',
  'Green chili',
  'Mustard oil',
  'Ginger',
  'Tomato',
  'Milk',
];

export function Pantry() {
  const { notify } = useToast();
  const [items, setItems] = usePersistentState(KEYS.pantry, []);
  const [draft, setDraft] = useState('');
  const favorites = useIdSet(KEYS.favorites);
  const { recipes: myRecipes } = useMyRecipes();

  const names = useMemo(
    () => items.map((item) => item.name.toLowerCase()),
    [items]
  );

  const add = (name) => {
    const clean = name.trim();
    if (!clean) return;
    if (names.includes(clean.toLowerCase())) {
      notify(`${clean} is already in your pantry.`);
      return;
    }
    setItems((current) => [
      { id: `${Date.now()}-${clean}`, name: clean },
      ...current,
    ]);
    setDraft('');
  };

  const remove = (id) =>
    setItems((current) => current.filter((item) => item.id !== id));

  const matches = useMemo(
    () => matchAgainstPantry([...myRecipes, ...BUNDLED], items).slice(0, 12),
    [items, myRecipes]
  );

  const readyNow = matches.filter((match) => match.missing.length === 0);
  const almost = matches.filter(
    (match) => match.missing.length > 0 && match.missing.length <= 3
  );

  return (
    <div className="page space-y-10">
      <header className="space-y-2">
        <p className="eyebrow">Pantry</p>
        <h1 className="text-3xl font-semibold">What is in your kitchen</h1>
        <p className="max-w-2xl text-muted">
          List what you already have and the app ranks recipes by how little you
          would need to buy.
        </p>
      </header>

      <section className="card p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            add(draft);
          }}
          className="flex gap-2"
        >
          <label htmlFor="pantry-add" className="sr-only">
            Add an ingredient
          </label>
          <input
            id="pantry-add"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add an ingredient — “smoked paprika”"
            className="field flex-1"
          />
          <button type="submit" className="btn-primary" disabled={!draft.trim()}>
            <Plus size={16} />
            Add
          </button>
        </form>

        {items.length ? (
          <>
            <ul className="mt-5 flex flex-wrap gap-2">
              {items.map((item) => (
                <li key={item.id}>
                  <span className="chip !pr-1.5">
                    {item.name}
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="rounded-full p-0.5 text-[color:var(--text-muted)] hover:text-ember-600"
                    >
                      <X size={13} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setItems([]);
                notify('Pantry cleared.');
              }}
              className="btn-ghost mt-4 -ml-2 text-xs"
            >
              <Trash size={14} />
              Clear pantry
            </button>
          </>
        ) : (
          <div className="mt-5">
            <p className="label">Start with the usual suspects</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="chip"
                  onClick={() => add(suggestion)}
                >
                  <Plus size={12} />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {!items.length ? (
        <EmptyState icon={Fridge} title="Nothing in the pantry yet">
          Add a few ingredients above and matching recipes appear here.
        </EmptyState>
      ) : null}

      {readyNow.length ? (
        <section>
          <SectionHeading
            eyebrow="Nothing to buy"
            title={
              <span className="inline-flex items-center gap-1.5">
                You can cook these right now
                <InfoTip label="What does this mean?">
                  Every ingredient these recipes call for is already in your pantry
                  list.
                </InfoTip>
              </span>
            }
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {readyNow.map((match, index) => (
              <RecipeCard
                key={match.recipe.id}
                recipe={match.recipe}
                index={index}
                isFavorite={favorites.has(match.recipe.id)}
                onToggleFavorite={favorites.toggle}
              />
            ))}
          </div>
        </section>
      ) : null}

      {almost.length ? (
        <section>
          <SectionHeading
            eyebrow="Almost there"
            title={
              <span className="inline-flex items-center gap-1.5">
                A short shop away
                <InfoTip label="What does this mean?">
                  These recipes are missing 3 ingredients or fewer from your
                  pantry. The count on each card is have/total.
                </InfoTip>
              </span>
            }
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {almost.map((match) => (
              <li key={match.recipe.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/recipe/${match.recipe.id}`}
                    className="font-semibold text-strong hover:text-ember-600"
                    lang={match.recipe.lang === 'bn' ? 'bn' : undefined}
                  >
                    {match.recipe.title}
                  </Link>
                  <span className="shrink-0 text-xs text-muted">
                    {match.have}/{match.total}
                  </span>
                </div>
                <p
                  lang={match.recipe.lang === 'bn' ? 'bn' : undefined}
                  className="mt-2 text-sm text-muted"
                >
                  Missing: {match.missing.join(', ')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {items.length && !readyNow.length && !almost.length ? (
        <EmptyState icon={Fridge} title="No close matches yet">
          Add a few more staples — most recipes need five or six things before
          they show up here.
        </EmptyState>
      ) : null}
    </div>
  );
}

export default Pantry;
