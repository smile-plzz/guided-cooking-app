import { Suspense, lazy } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Discover from './pages/Discover.jsx';
import { EmptyState, GridSkeleton } from './components/ui.jsx';
import { Alert } from './components/icons.jsx';

// Discover is the landing route and ships in the main bundle; everything else
// loads on demand so the first paint stays small.
const RecipeDetail = lazy(() => import('./pages/RecipeDetail.jsx'));
const CookMode = lazy(() => import('./pages/CookMode.jsx'));
const MealPlanner = lazy(() => import('./pages/MealPlanner.jsx'));
const ShoppingList = lazy(() => import('./pages/ShoppingList.jsx'));
const Pantry = lazy(() => import('./pages/Pantry.jsx'));
const Saved = lazy(() => import('./pages/Saved.jsx'));
const RecipeForm = lazy(() => import('./pages/RecipeForm.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

function RouteFallback() {
  return (
    <div className="page">
      <GridSkeleton count={4} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="page">
      <EmptyState
        icon={Alert}
        title="Page not found"
        action={
          <Link to="/" className="btn-primary mt-2">
            Back to Discover
          </Link>
        }
      >
        That link does not lead anywhere in the app.
      </EmptyState>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Discover />} />
        <Route
          path="recipe/:id"
          element={
            <Suspense fallback={<RouteFallback />}>
              <RecipeDetail />
            </Suspense>
          }
        />
        <Route
          path="recipe/:id/cook"
          element={
            <Suspense fallback={<RouteFallback />}>
              <CookMode />
            </Suspense>
          }
        />
        <Route
          path="planner"
          element={
            <Suspense fallback={<RouteFallback />}>
              <MealPlanner />
            </Suspense>
          }
        />
        <Route
          path="shopping-list"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ShoppingList />
            </Suspense>
          }
        />
        <Route
          path="pantry"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Pantry />
            </Suspense>
          }
        />
        <Route
          path="saved"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Saved />
            </Suspense>
          }
        />
        <Route
          path="recipes/new"
          element={
            <Suspense fallback={<RouteFallback />}>
              <RecipeForm />
            </Suspense>
          }
        />
        <Route
          path="recipes/:id/edit"
          element={
            <Suspense fallback={<RouteFallback />}>
              <RecipeForm />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Settings />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
