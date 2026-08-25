import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../components/ui.jsx';
import { Alert, ArrowLeft, Check, Plus, Trash } from '../components/icons.jsx';
import {
  blankRecipe,
  useMyRecipes,
  validateRecipe,
} from '../lib/recipes.js';
import { useToast } from '../context/AppProviders.jsx';

const CATEGORIES = [
  'Starter',
  'Main',
  'Side',
  'Dessert',
  'Breakfast',
  'Snack',
  'Vegetarian',
  'Fish',
  'Seafood',
  'Beef',
  'Chicken',
];

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ember-600 dark:text-ember-300">
      <Alert size={13} />
      {children}
    </p>
  );
}

export function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { byId, save } = useMyRecipes();

  const editing = Boolean(id);
  const existing = editing ? byId.get(id) : null;

  const [draft, setDraft] = useState(() =>
    existing ? { ...existing } : blankRecipe()
  );
  const [errors, setErrors] = useState({});

  // The stored recipes load asynchronously from localStorage on first render.
  useEffect(() => {
    if (editing && existing) setDraft({ ...existing });
  }, [editing, existing]);

  if (editing && !existing) {
    return (
      <div className="page">
        <EmptyState
          icon={Alert}
          title="That recipe is not in this browser"
          action={
            <Link to="/saved" className="btn-primary mt-2">
              Back to your recipes
            </Link>
          }
        >
          Your recipes are stored locally, so they do not follow you between
          devices.
        </EmptyState>
      </div>
    );
  }

  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const setIngredient = (index, key, value) =>
    setDraft((current) => {
      const ingredients = [...current.ingredients];
      ingredients[index] = { ...ingredients[index], [key]: value };
      return { ...current, ingredients };
    });

  const addIngredient = () =>
    setDraft((current) => ({
      ...current,
      ingredients: [...current.ingredients, { name: '', amount: null, unit: '' }],
    }));

  const removeIngredient = (index) =>
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, i) => i !== index),
    }));

  const setStep = (index, value) =>
    setDraft((current) => {
      const steps = [...current.steps];
      steps[index] = { ...steps[index], text: value };
      return { ...current, steps };
    });

  const addStep = () =>
    setDraft((current) => ({
      ...current,
      steps: [...current.steps, { number: current.steps.length + 1, text: '' }],
    }));

  const removeStep = (index) =>
    setDraft((current) => ({
      ...current,
      steps: current.steps.filter((_, i) => i !== index),
    }));

  const submit = (event) => {
    event.preventDefault();
    const found = validateRecipe(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      notify('Some fields still need attention.', { tone: 'error' });
      return;
    }
    const saved = save(draft);
    notify(editing ? 'Recipe updated.' : 'Recipe saved.', { tone: 'success' });
    navigate(`/recipe/${saved.id}`);
  };

  return (
    <form onSubmit={submit} className="page max-w-3xl space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn-ghost -ml-2 px-2"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      <header className="space-y-2">
        <p className="eyebrow">{editing ? 'Edit recipe' : 'New recipe'}</p>
        <h1 className="text-3xl font-semibold">
          {editing ? draft.title || 'Edit recipe' : 'Write it down'}
        </h1>
        <p className="text-muted">
          Saved in this browser only — nothing is uploaded anywhere.
        </p>
      </header>

      <section className="card space-y-4 p-5">
        <div>
          <label htmlFor="title" className="label">
            Name
          </label>
          <input
            id="title"
            value={draft.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="Nani's khichuri"
            className="field"
            aria-invalid={Boolean(errors.title)}
          />
          <FieldError>{errors.title}</FieldError>
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={draft.description || ''}
            onChange={(event) => set('description', event.target.value)}
            placeholder="What makes it worth cooking?"
            className="field resize-y"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="cuisine" className="label">
              Cuisine
            </label>
            <input
              id="cuisine"
              value={draft.cuisine || ''}
              onChange={(event) => set('cuisine', event.target.value)}
              placeholder="Bengali"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="category" className="label">
              Course
            </label>
            <select
              id="category"
              value={draft.category}
              onChange={(event) => set('category', event.target.value)}
              className="field"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minutes" className="label">
              Total minutes
            </label>
            <input
              id="minutes"
              type="number"
              min="1"
              value={draft.readyInMinutes ?? ''}
              onChange={(event) => set('readyInMinutes', event.target.value)}
              placeholder="45"
              className="field"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="servings" className="label">
              Servings
            </label>
            <input
              id="servings"
              type="number"
              min="1"
              value={draft.servings}
              onChange={(event) => set('servings', event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="image" className="label">
              Photo URL <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="image"
              type="url"
              value={draft.image || ''}
              onChange={(event) => set('image', event.target.value)}
              placeholder="https://…"
              className="field"
            />
          </div>
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <button type="button" onClick={addIngredient} className="btn-secondary">
            <Plus size={15} />
            Add
          </button>
        </div>
        <FieldError>{errors.ingredients}</FieldError>

        <ul className="space-y-2">
          {draft.ingredients.map((ingredient, index) => (
            <li key={index} className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0"
                value={ingredient.amount ?? ''}
                onChange={(event) =>
                  setIngredient(index, 'amount', event.target.value)
                }
                placeholder="2"
                aria-label={`Ingredient ${index + 1} amount`}
                className="field w-20 shrink-0"
              />
              <input
                value={ingredient.unit || ''}
                onChange={(event) => setIngredient(index, 'unit', event.target.value)}
                placeholder="tbsp"
                aria-label={`Ingredient ${index + 1} unit`}
                className="field w-24 shrink-0"
              />
              <input
                value={ingredient.name}
                onChange={(event) => setIngredient(index, 'name', event.target.value)}
                placeholder="mustard oil"
                aria-label={`Ingredient ${index + 1} name`}
                className="field flex-1"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={draft.ingredients.length === 1}
                className="btn-ghost shrink-0 rounded-xl p-2.5"
                aria-label={`Remove ingredient ${index + 1}`}
              >
                <Trash size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Method</h2>
          <button type="button" onClick={addStep} className="btn-secondary">
            <Plus size={15} />
            Add step
          </button>
        </div>
        <FieldError>{errors.steps}</FieldError>

        <ol className="space-y-2">
          {draft.steps.map((step, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-2.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[color:var(--surface-sunken)] text-xs font-semibold text-strong">
                {index + 1}
              </span>
              <textarea
                rows={2}
                value={step.text}
                onChange={(event) => setStep(index, event.target.value)}
                placeholder="Heat the mustard oil until it smokes, then take it off the heat for a minute."
                aria-label={`Step ${index + 1}`}
                className="field flex-1 resize-y"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                disabled={draft.steps.length === 1}
                className="btn-ghost mt-1 shrink-0 self-start rounded-xl p-2.5"
                aria-label={`Remove step ${index + 1}`}
              >
                <Trash size={16} />
              </button>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted">
          Mention a duration — “simmer for 20 minutes” — and guided mode offers a
          timer for that step automatically.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary btn-lg">
          <Check size={17} />
          {editing ? 'Save changes' : 'Save recipe'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary btn-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default RecipeForm;
