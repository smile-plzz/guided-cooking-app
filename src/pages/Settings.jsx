import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Segmented } from '../components/ui.jsx';
import { Download, Trash, Upload } from '../components/icons.jsx';
import {
  KEYS,
  clearUserData,
  exportUserData,
  importUserData,
  readStorage,
  usePersistentState,
} from '../lib/storage.js';
import { useTheme, useToast } from '../context/AppProviders.jsx';
import { SUBSTITUTION_COUNT } from '../lib/substitutions.js';
import { BUNDLED } from '../lib/catalog.js';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const UNIT_OPTIONS = [
  { value: 'original', label: 'As written' },
  { value: 'metric', label: 'Metric' },
  { value: 'us', label: 'US' },
];

function Stat({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-semibold text-strong tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { notify } = useToast();
  const [system, setSystem] = usePersistentState(KEYS.units, 'original');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const fileInput = useRef(null);

  const counts = {
    favorites: readStorage(KEYS.favorites, []).length,
    myRecipes: readStorage(KEYS.myRecipes, []).length,
    pantry: readStorage(KEYS.pantry, []).length,
    shopping: readStorage(KEYS.shoppingList, []).length,
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(exportUserData(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mise-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Backup downloaded.', { tone: 'success' });
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      importUserData(JSON.parse(await file.text()));
      notify('Backup restored.', { tone: 'success' });
    } catch (error) {
      notify(error.message || 'That file could not be read.', { tone: 'error' });
    } finally {
      event.target.value = '';
    }
  };

  const wipe = () => {
    clearUserData();
    setConfirmWipe(false);
    notify('Everything cleared.', { tone: 'success' });
  };

  return (
    <div className="page max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="eyebrow">Settings</p>
        <h1 className="text-3xl font-semibold">Data &amp; preferences</h1>
        <p className="text-muted">
          Mise has no accounts and no server-side storage. Everything you create
          lives in this browser, which also means clearing site data erases it.
        </p>
      </header>

      <section className="card space-y-5 p-5">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-strong">Theme</p>
            <p className="text-xs text-muted">Follows your system by default.</p>
          </div>
          <Segmented
            label="Theme"
            options={THEME_OPTIONS}
            value={theme}
            onChange={setTheme}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-strong">Default units</p>
            <p className="text-xs text-muted">
              Applied to every recipe you open.
            </p>
          </div>
          <Segmented
            label="Units"
            options={UNIT_OPTIONS}
            value={system}
            onChange={setSystem}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">What you have</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Favourites" value={counts.favorites} />
          <Stat label="Your recipes" value={counts.myRecipes} />
          <Stat label="Pantry items" value={counts.pantry} />
          <Stat label="On the list" value={counts.shopping} />
        </div>
        <p className="text-xs text-muted">
          {BUNDLED.length} recipes ship with the app, alongside{' '}
          {SUBSTITUTION_COUNT} ingredient substitutions that work offline.
        </p>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="text-lg font-semibold">Back up or move devices</h2>
        <p className="text-sm text-muted">
          Export a file, then import it in another browser to carry your recipes,
          plan and lists across.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={download} className="btn-secondary">
            <Download size={16} />
            Export a backup
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="btn-secondary"
          >
            <Upload size={16} />
            Import a backup
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            onChange={upload}
            className="sr-only"
            aria-label="Choose a backup file"
          />
        </div>
      </section>

      <section className="card space-y-4 border-ember-300 p-5 dark:border-ember-900">
        <h2 className="text-lg font-semibold">Clear everything</h2>
        <p className="text-sm text-muted">
          Deletes your recipes, favourites, notes, pantry, shopping list and meal
          plan from this browser. Export a backup first if you want to keep them.
        </p>
        <button
          type="button"
          onClick={() => setConfirmWipe(true)}
          className="btn-secondary self-start text-ember-600 dark:text-ember-300"
        >
          <Trash size={16} />
          Clear all my data
        </button>
      </section>

      <p className="text-xs text-muted">
        Community recipes come from{' '}
        <a
          href="https://www.themealdb.com"
          target="_blank"
          rel="noreferrer noopener"
          className="underline hover:text-strong"
        >
          TheMealDB
        </a>
        . The Bengali collection ships with the app.{' '}
        <Link to="/" className="underline hover:text-strong">
          Back to Discover
        </Link>
        .
      </p>

      <Modal
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        title="Clear all your data?"
        size="sm"
      >
        <p className="text-sm text-body">
          This removes {counts.myRecipes} of your own recipes,{' '}
          {counts.favorites} favourites and everything else stored here. It
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirmWipe(false)}
          >
            Cancel
          </button>
          <button type="button" className="btn-primary bg-ember-700" onClick={wipe}>
            <Trash size={16} />
            Clear everything
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Settings;
