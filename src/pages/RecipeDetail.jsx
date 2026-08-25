import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RecipeImage from '../components/RecipeImage.jsx';
import { EmptyState, Modal, Segmented, Stepper } from '../components/ui.jsx';
import {
  Alert,
  ArrowLeft,
  Basket,
  Calendar,
  Check,
  Clock,
  Flame,
  Heart,
  Note,
  Pencil,
  Play,
  Swap,
  Trash,
  Users,
} from '../components/icons.jsx';
import { scaleIngredient } from '../lib/units.js';
import { humanizeMinutes } from '../lib/timers.js';
import { findSubstitutes } from '../lib/substitutions.js';
import {
  displayTitle,
  isUserId,
  totalMinutes,
  useMyRecipes,
  useRecipe,
} from '../lib/recipes.js';
import { KEYS, useIdSet, usePersistentState } from '../lib/storage.js';
import { useToast } from '../context/AppProviders.jsx';
import AddToPlanDialog from '../components/AddToPlanDialog.jsx';

const UNIT_OPTIONS = [
  { value: 'original', label: 'As written' },
  { value: 'metric', label: 'Metric' },
  { value: 'us', label: 'US' },
];

function MetaPill({ icon: IconComponent, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface-sunken)] px-3 py-1.5 text-xs font-medium text-body">
      <IconComponent size={14} />
      {children}
    </span>
  );
}

export function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: recipe, isLoading, isError, error } = useRecipe(id);

  const favorites = useIdSet(KEYS.favorites);
  const [notes, setNotes] = usePersistentState(KEYS.notes, {});
  const [shoppingItems, setShoppingList] = usePersistentState(
    KEYS.shoppingList,
    []
  );
  const { remove: removeMyRecipe } = useMyRecipes();

  const [servings, setServings] = useState(null);
  const [system, setSystem] = usePersistentState(KEYS.units, 'original');
  const [substituteFor, setSubstituteFor] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const baseServings = recipe?.servings || 1;
  const currentServings = servings ?? baseServings;
  const factor = currentServings / baseServings;

  const ingredients = useMemo(
    () =>
      (recipe?.ingredients || []).map((ingredient) =>
        scaleIngredient(ingredient, factor, system)
      ),
    [recipe, factor, system]
  );

  if (isLoading) {
    return (
      <div className="page space-y-6">
        <div className="skeleton aspect-[16/7] w-full rounded-3xl" />
        <div className="skeleton h-8 w-2/3 rounded" />
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="page">
        <EmptyState
          icon={Alert}
          title="That recipe is not available"
          action={
            <Link to="/" className="btn-primary mt-2">
              Back to Discover
            </Link>
          }
        >
          {error?.status === 404
            ? 'It may have been deleted, or the link is wrong.'
            : 'The recipe service did not respond. Try again in a moment.'}
        </EmptyState>
      </div>
    );
  }

  const bengali = recipe.lang === 'bn';
  const minutes = totalMinutes(recipe);
  const note = notes[recipe.id] || '';
  const isFavorite = favorites.has(recipe.id);

  const addAllToList = () => {
    const entries = ingredients.map((ingredient) => ({
      id: `${recipe.id}:${ingredient.name}`,
      name: ingredient.name,
      amount: ingredient.scaledAmount ?? null,
      unit: ingredient.displayUnit || ingredient.unit || '',
      aisle: ingredient.aisle || 'Other',
      from: displayTitle(recipe),
      checked: false,
    }));

    const existing = new Set(shoppingItems.map((item) => item.id));
    const added = entries.filter((entry) => !existing.has(entry.id));

    if (!added.length) {
      notify('Those ingredients are already on your list.');
      return;
    }

    setShoppingList([...shoppingItems, ...added]);
    notify(`Added ${added.length} ingredients to your shopping list.`, {
      tone: 'success',
      action: { label: 'View', onClick: () => navigate('/shopping-list') },
    });
  };

  const addOneToList = (ingredient) => {
    const entry = {
      id: `${recipe.id}:${ingredient.name}`,
      name: ingredient.name,
      amount: ingredient.scaledAmount ?? null,
      unit: ingredient.displayUnit || ingredient.unit || '',
      aisle: ingredient.aisle || 'Other',
      from: displayTitle(recipe),
      checked: false,
    };
    if (shoppingItems.some((item) => item.id === entry.id)) {
      notify(`${ingredient.name} is already on your list.`);
      return;
    }

    setShoppingList([...shoppingItems, entry]);
    notify(`${ingredient.name} added to your list.`, { tone: 'success' });
  };

  const deleteRecipe = () => {
    removeMyRecipe(recipe.id);
    setConfirmDelete(false);
    notify('Recipe deleted.', { tone: 'success' });
    navigate('/saved');
  };

  const substitutes = substituteFor ? findSubstitutes(substituteFor) : [];

  return (
    <article className="page space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-ghost -ml-2 px-2"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <header className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-[color:var(--surface-sunken)] shadow-card lg:aspect-[5/4]">
          <RecipeImage recipe={recipe} priority />
        </div>

        <div className="space-y-4">
          <p className="eyebrow">{recipe.cuisine || 'Recipe'}</p>
          <h1
            lang={bengali ? 'bn' : undefined}
            className="text-3xl font-semibold leading-tight sm:text-4xl"
          >
            {recipe.title}
          </h1>
          {recipe.subtitle ? (
            <p className="text-lg text-muted">{recipe.subtitle}</p>
          ) : null}
          {recipe.description ? (
            <p lang={bengali ? 'bn' : undefined} className="text-body">
              {recipe.description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            {minutes ? (
              <MetaPill icon={Clock}>
                {humanizeMinutes(minutes)}
                {recipe.timeIsEstimate ? ' (estimated)' : ''}
              </MetaPill>
            ) : null}
            <MetaPill icon={Users}>Serves {currentServings}</MetaPill>
            <MetaPill icon={Flame}>{recipe.steps.length} steps</MetaPill>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link to={`/recipe/${recipe.id}/cook`} className="btn-primary btn-lg">
              <Play size={17} />
              Start cooking
            </Link>
            <button
              type="button"
              onClick={() => favorites.toggle(recipe.id)}
              aria-pressed={isFavorite}
              className={isFavorite ? 'btn-primary' : 'btn-secondary'}
            >
              <Heart size={16} filled={isFavorite} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setPlanOpen(true)}
              className="btn-secondary"
            >
              <Calendar size={16} />
              Add to plan
            </button>
            <button type="button" onClick={addAllToList} className="btn-secondary">
              <Basket size={16} />
              Shopping list
            </button>
            <button
              type="button"
              onClick={() => setNoteOpen(true)}
              className="btn-secondary"
            >
              <Note size={16} />
              {note ? 'Edit note' : 'Add note'}
            </button>
            {isUserId(recipe.id) ? (
              <>
                <Link to={`/recipes/${recipe.id}/edit`} className="btn-secondary">
                  <Pencil size={16} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="btn-ghost text-ember-600 dark:text-ember-300"
                >
                  <Trash size={16} />
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {note ? (
        <aside className="card border-l-4 border-l-saffron-500 p-4">
          <p className="eyebrow mb-1">Your note</p>
          <p className="whitespace-pre-wrap text-sm text-body">{note}</p>
        </aside>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
        <section aria-labelledby="ingredients-heading" className="card p-5 lg:sticky lg:top-24">
          <h2 id="ingredients-heading" className="text-xl font-semibold">
            Ingredients
          </h2>

          <div className="mt-4 space-y-3 border-b border-[color:var(--border-soft)] pb-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted">Servings</span>
              <Stepper
                value={currentServings}
                onChange={setServings}
                label="servings"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted">Units</span>
              <Segmented
                label="Unit system"
                options={UNIT_OPTIONS}
                value={system}
                onChange={setSystem}
              />
            </div>
          </div>

          <ul className="mt-4 space-y-1">
            {ingredients.map((ingredient, index) => {
              const hasSwap = findSubstitutes(ingredient.name).length > 0;
              return (
                <li
                  key={`${ingredient.name}-${index}`}
                  className="group flex items-start gap-2 rounded-lg px-2 py-2 transition hover:bg-[color:var(--surface-sunken)]"
                >
                  <span className="flex-1 text-sm" lang={bengali ? 'bn' : undefined}>
                    {ingredient.displayAmount ? (
                      <span className="font-semibold tabular-nums text-strong">
                        {ingredient.displayAmount}
                        {ingredient.displayUnit ? ` ${ingredient.displayUnit}` : ''}{' '}
                      </span>
                    ) : null}
                    {ingredient.name}
                  </span>
                  <span className="flex shrink-0 gap-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                    {hasSwap ? (
                      <button
                        type="button"
                        onClick={() => setSubstituteFor(ingredient.name)}
                        className="btn-ghost rounded-lg p-1.5"
                        aria-label={`Substitutes for ${ingredient.name}`}
                        title="Substitutes"
                      >
                        <Swap size={15} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => addOneToList(ingredient)}
                      className="btn-ghost rounded-lg p-1.5"
                      aria-label={`Add ${ingredient.name} to shopping list`}
                      title="Add to shopping list"
                    >
                      <Basket size={15} />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>

          <button type="button" onClick={addAllToList} className="btn-secondary mt-4 w-full">
            <Basket size={16} />
            Add all to shopping list
          </button>

          {factor !== 1 ? (
            <p className="mt-3 text-xs text-muted">
              Scaled {factor > 1 ? 'up' : 'down'} from {baseServings} servings.
              Cooking times stay roughly the same — check for doneness rather
              than the clock.
            </p>
          ) : null}
        </section>

        <section aria-labelledby="method-heading" className="space-y-4">
          <h2 id="method-heading" className="text-xl font-semibold">
            Method
          </h2>
          <ol className="space-y-3">
            {recipe.steps.map((step) => (
              <li key={step.number} className="card flex gap-4 p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ember-600/10 text-sm font-semibold text-ember-700 dark:bg-ember-500/15 dark:text-ember-300">
                  {step.number}
                </span>
                <p
                  lang={bengali ? 'bn' : undefined}
                  className="pt-0.5 leading-relaxed text-body"
                >
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          {recipe.video ? (
            <a
              href={recipe.video}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-secondary"
            >
              Watch the method on video
            </a>
          ) : null}

          <div className="card flex items-center gap-4 p-5">
            <div className="flex-1">
              <h3 className="text-base font-semibold">Ready to cook?</h3>
              <p className="text-sm text-muted">
                Guided mode shows one step at a time and keeps the screen awake.
              </p>
            </div>
            <Link to={`/recipe/${recipe.id}/cook`} className="btn-primary shrink-0">
              <Play size={16} />
              Start
            </Link>
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(substituteFor)}
        onClose={() => setSubstituteFor(null)}
        title={`Instead of ${substituteFor || ''}`}
        size="sm"
      >
        <ul className="space-y-2">
          {substitutes.map((swap) => (
            <li key={swap} className="flex gap-3 rounded-xl bg-[color:var(--surface-sunken)] p-3 text-sm">
              <Check size={16} className="mt-0.5 shrink-0 text-herb-600 dark:text-herb-300" />
              <span>{swap}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Substitutions change the result. Taste as you go and adjust the
          seasoning.
        </p>
      </Modal>

      <NoteDialog
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        value={note}
        onSave={(value) => {
          setNotes((current) => ({ ...current, [recipe.id]: value }));
          setNoteOpen(false);
          notify(value ? 'Note saved.' : 'Note cleared.', { tone: 'success' });
        }}
      />

      <AddToPlanDialog
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        recipe={recipe}
      />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this recipe?"
        size="sm"
      >
        <p className="text-sm text-body">
          “{displayTitle(recipe)}” will be removed from this browser. This cannot
          be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => setConfirmDelete(false)}>
            Keep it
          </button>
          <button type="button" className="btn-primary bg-ember-700" onClick={deleteRecipe}>
            <Trash size={16} />
            Delete
          </button>
        </div>
      </Modal>
    </article>
  );
}

function NoteDialog({ open, onClose, value, onSave }) {
  const [draft, setDraft] = useState(value);

  // The dialog stays mounted between openings, so reset the draft each time it
  // opens rather than only on first render.
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  return (
    <Modal open={open} onClose={onClose} title="Your note" size="sm">
      <label htmlFor="recipe-note" className="label">
        What would you do differently next time?
      </label>
      <textarea
        id="recipe-note"
        rows={6}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Halve the chilli. Needed 5 more minutes in the oven."
        className="field resize-y"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={() => onSave(draft.trim())}>
          Save note
        </button>
      </div>
    </Modal>
  );
}

export default RecipeDetail;
