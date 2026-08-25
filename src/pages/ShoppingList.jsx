import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui.jsx';
import { Basket, Check, Plus, Trash, X } from '../components/icons.jsx';
import { formatAmount } from '../lib/units.js';
import { KEYS, usePersistentState } from '../lib/storage.js';
import { useToast } from '../context/AppProviders.jsx';

/**
 * Aisle order follows how a supermarket is actually laid out, so the list reads
 * top to bottom as you walk it.
 */
const AISLE_ORDER = [
  'Produce',
  'Seafood',
  'Meat',
  'Milk, Eggs, Other Dairy',
  'Cheese',
  'Bakery/Bread',
  'Pasta and Rice',
  'Canned and Jarred',
  'Spices and Seasonings',
  'Oil, Vinegar, Salad Dressing',
  'Baking',
  'Frozen',
  'Beverages',
  'Other',
];

const aisleRank = (aisle) => {
  const index = AISLE_ORDER.indexOf(aisle);
  return index === -1 ? AISLE_ORDER.length : index;
};

export function ShoppingList() {
  const { notify } = useToast();
  const [items, setItems] = usePersistentState(KEYS.shoppingList, []);
  const [, setPantry] = usePersistentState(KEYS.pantry, []);
  const [draft, setDraft] = useState('');

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const item of items) {
      const aisle = item.aisle || 'Other';
      if (!groups.has(aisle)) groups.set(aisle, []);
      groups.get(aisle).push(item);
    }
    return [...groups.entries()]
      .sort((a, b) => aisleRank(a[0]) - aisleRank(b[0]))
      .map(([aisle, group]) => [
        aisle,
        [...group].sort((a, b) => Number(a.checked) - Number(b.checked)),
      ]);
  }, [items]);

  const openCount = items.filter((item) => !item.checked).length;

  const toggle = (id) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );

  const remove = (id) =>
    setItems((current) => current.filter((item) => item.id !== id));

  const addManual = (event) => {
    event.preventDefault();
    const name = draft.trim();
    if (!name) return;
    setItems((current) => [
      ...current,
      {
        id: `manual-${Date.now()}`,
        name,
        amount: null,
        unit: '',
        aisle: 'Other',
        from: null,
        checked: false,
      },
    ]);
    setDraft('');
  };

  /** Ticked items are things you now own — move them into the pantry. */
  const stockPantry = () => {
    const bought = items.filter((item) => item.checked);
    if (!bought.length) {
      notify('Tick off what you bought first.');
      return;
    }
    setPantry((current) => {
      const existing = new Set(current.map((item) => item.name.toLowerCase()));
      const additions = bought
        .filter((item) => !existing.has(item.name.toLowerCase()))
        .map((item) => ({ id: `${Date.now()}-${item.name}`, name: item.name }));
      return [...additions, ...current];
    });
    setItems((current) => current.filter((item) => !item.checked));
    notify(`${bought.length} items moved to your pantry.`, { tone: 'success' });
  };

  const copyToClipboard = async () => {
    const text = items
      .filter((item) => !item.checked)
      .map((item) =>
        [formatAmount(item.amount), item.unit, item.name]
          .filter(Boolean)
          .join(' ')
      )
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      notify('List copied.', { tone: 'success' });
    } catch {
      notify('Could not copy — your browser blocked clipboard access.', {
        tone: 'error',
      });
    }
  };

  return (
    <div className="page space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Shopping</p>
          <h1 className="text-3xl font-semibold">
            {openCount ? `${openCount} to buy` : 'Shopping list'}
          </h1>
        </div>
        {items.length ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyToClipboard} className="btn-secondary">
              Copy list
            </button>
            <button type="button" onClick={stockPantry} className="btn-secondary">
              <Check size={16} />
              Move ticked to pantry
            </button>
            <button
              type="button"
              onClick={() => {
                setItems([]);
                notify('Shopping list cleared.');
              }}
              className="btn-ghost"
            >
              <Trash size={16} />
              Clear
            </button>
          </div>
        ) : null}
      </header>

      <form onSubmit={addManual} className="flex gap-2">
        <label htmlFor="list-add" className="sr-only">
          Add an item
        </label>
        <input
          id="list-add"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add something — “washing-up liquid”"
          className="field flex-1"
        />
        <button type="submit" className="btn-primary" disabled={!draft.trim()}>
          <Plus size={16} />
          Add
        </button>
      </form>

      {!items.length ? (
        <EmptyState
          icon={Basket}
          title="Your list is empty"
          action={
            <Link to="/" className="btn-primary mt-2">
              Find a recipe
            </Link>
          }
        >
          Add ingredients from any recipe, or generate a whole week&rsquo;s list
          from your meal plan.
        </EmptyState>
      ) : null}

      <div className="space-y-6">
        {grouped.map(([aisle, group]) => (
          <section key={aisle}>
            <h2 className="eyebrow mb-2">{aisle}</h2>
            <ul className="card divide-y divide-[color:var(--border-soft)] overflow-hidden">
              {group.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-pressed={item.checked}
                    aria-label={`${item.checked ? 'Untick' : 'Tick'} ${item.name}`}
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                      item.checked
                        ? 'border-herb-500 bg-herb-500 text-white'
                        : 'border-[color:var(--border-soft)] text-transparent hover:border-herb-500'
                    }`}
                  >
                    <Check size={14} />
                  </button>

                  <div className={`min-w-0 flex-1 ${item.checked ? 'opacity-45' : ''}`}>
                    <p
                      className={`text-sm text-strong ${item.checked ? 'line-through' : ''}`}
                    >
                      {item.amount || item.unit ? (
                        <span className="font-semibold tabular-nums">
                          {formatAmount(item.amount)}
                          {item.unit ? ` ${item.unit}` : ''}{' '}
                        </span>
                      ) : null}
                      {item.name}
                    </p>
                    {item.from ? (
                      <p className="truncate text-xs text-muted">{item.from}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="btn-ghost rounded-full p-1.5"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export default ShoppingList;
