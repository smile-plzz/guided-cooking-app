import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RecipeImage from './RecipeImage.jsx';
import { Clock, Users, Heart } from './icons.jsx';
import { humanizeMinutes } from '../lib/timers.js';
import { totalMinutes } from '../lib/recipes.js';

const SOURCE_LABEL = {
  bangla: 'Bengali collection',
  local: 'House recipe',
  user: 'Yours',
  mealdb: 'Community',
};

export function RecipeCard({ recipe, isFavorite, onToggleFavorite, index = 0 }) {
  const minutes = totalMinutes(recipe);
  const bengali = recipe.lang === 'bn';

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.03 }}
      className="group relative"
    >
      <Link
        to={`/recipe/${recipe.id}`}
        className="card block h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--surface-sunken)]">
          <RecipeImage
            recipe={recipe}
            priority={index < 4}
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            className="transition duration-500 group-hover:scale-[1.04]"
          />
          {recipe.cuisine ? (
            <span className="absolute left-3 top-3 rounded-full bg-stone-900/70 px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-white backdrop-blur">
              {recipe.cuisine}
            </span>
          ) : null}
        </div>

        <div className="space-y-2 p-4">
          <p className="eyebrow">{SOURCE_LABEL[recipe.source] || 'Recipe'}</p>
          <h3
            lang={bengali ? 'bn' : undefined}
            className="line-clamp-2 text-base font-semibold leading-snug"
          >
            {recipe.title}
          </h3>
          {recipe.subtitle ? (
            <p className="line-clamp-2 text-sm text-muted">{recipe.subtitle}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted">
            {minutes ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {humanizeMinutes(minutes)}
                {recipe.timeIsEstimate ? <span aria-hidden="true">*</span> : null}
              </span>
            ) : null}
            {recipe.servings ? (
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} />
                Serves {recipe.servings}
              </span>
            ) : null}
            {recipe.partial ? (
              <span className="text-[color:var(--text-muted)]">Tap for details</span>
            ) : null}
          </div>
        </div>
      </Link>

      {onToggleFavorite ? (
        <button
          type="button"
          onClick={() => onToggleFavorite(recipe.id)}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${recipe.title} from favourites`
              : `Save ${recipe.title} to favourites`
          }
          className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur transition
            ${
              isFavorite
                ? 'bg-ember-600 text-white'
                : 'bg-stone-900/55 text-white hover:bg-stone-900/80'
            }`}
        >
          <Heart size={16} filled={isFavorite} />
        </button>
      ) : null}
    </motion.article>
  );
}

export default RecipeCard;
