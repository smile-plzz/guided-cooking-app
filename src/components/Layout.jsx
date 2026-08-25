import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Basket,
  Calendar,
  Flame,
  Fridge,
  Heart,
  Moon,
  Plus,
  Search,
  Sun,
} from './icons.jsx';
import { Toaster } from './ui.jsx';
import { useTheme } from '../context/AppProviders.jsx';
import { KEYS, usePersistentState } from '../lib/storage.js';

const NAV = [
  { to: '/', label: 'Discover', icon: Search, end: true },
  { to: '/planner', label: 'Meal plan', icon: Calendar },
  { to: '/shopping-list', label: 'Shopping', icon: Basket },
  { to: '/pantry', label: 'Pantry', icon: Fridge },
  { to: '/saved', label: 'Saved', icon: Heart },
];

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 text-strong"
      aria-label="Mise — home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember-600 text-white">
        <Flame size={18} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Mise
      </span>
    </Link>
  );
}

/** Search box in the header; submitting routes to Discover with the query. */
function HeaderSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [term, setTerm] = useState('');

  // Keep the field in step with the URL when Discover owns the query.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setTerm(location.pathname === '/' ? params.get('q') || '' : '');
  }, [location.pathname, location.search]);

  const submit = (event) => {
    event.preventDefault();
    const query = term.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/');
  };

  return (
    <form onSubmit={submit} role="search" className="relative w-full max-w-sm">
      <label htmlFor="header-search" className="sr-only">
        Search recipes
      </label>
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
      />
      <input
        id="header-search"
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search recipes or an ingredient"
        className="field pl-10"
      />
    </form>
  );
}

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-ghost rounded-full p-2.5"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

/** Count badge on the shopping tab, so a growing list is visible everywhere. */
function useOpenListCount() {
  const [items] = usePersistentState(KEYS.shoppingList, []);
  return items.filter((item) => !item.checked).length;
}

export function Layout() {
  const location = useLocation();
  const openItems = useOpenListCount();

  // Every route change starts at the top; without this, opening a recipe from
  // halfway down the grid lands mid-page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [location.pathname]);

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ember-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-[color:var(--border-soft)] bg-[color:var(--surface-page)]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <div className="ml-auto hidden flex-1 justify-center md:flex">
            <HeaderSearch />
          </div>

          <nav
            aria-label="Main"
            className="ml-auto hidden items-center gap-1 lg:flex"
          >
            {NAV.slice(1).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[color:var(--surface-sunken)] text-strong'
                      : 'text-muted hover:text-strong'
                  }`
                }
              >
                {item.label}
                {item.to === '/shopping-list' && openItems > 0 ? (
                  <span className="ml-1.5 rounded-full bg-ember-600 px-1.5 py-0.5 text-2xs font-bold text-white">
                    {openItems}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <ThemeToggle />
            <Link to="/recipes/new" className="btn-primary hidden sm:inline-flex">
              <Plus size={16} />
              New recipe
            </Link>
          </div>
        </div>

        {/* The header search collapses on small screens; Discover has its own. */}
        <div className="border-t border-[color:var(--border-soft)] px-4 py-2.5 md:hidden">
          <HeaderSearch />
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="hidden border-t border-[color:var(--border-soft)] py-8 lg:block">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted sm:px-6 lg:px-8">
          <p>
            Mise — guided cooking. Your recipes, pantry and plan stay in this
            browser.
          </p>
          <Link to="/settings" className="hover:text-strong">
            Data &amp; settings
          </Link>
        </div>
      </footer>

      {/* Mobile tab bar. */}
      <nav
        aria-label="Main"
        className="sticky bottom-0 z-40 border-t border-[color:var(--border-soft)] bg-[color:var(--surface-page)]/95 backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1.5">
          {NAV.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-2xs font-medium transition ${
                    isActive ? 'text-ember-600 dark:text-ember-300' : 'text-muted'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
                {item.to === '/shopping-list' && openItems > 0 ? (
                  <span className="absolute right-1/2 top-0 translate-x-4 rounded-full bg-ember-600 px-1.5 text-2xs font-bold text-white">
                    {openItems}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Toaster />
    </div>
  );
}

export default Layout;
