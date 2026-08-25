import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState, InfoTip, Modal, Stepper } from '../components/ui.jsx';
import {
  Alert,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pause,
  Play,
  Rotate,
  X,
} from '../components/icons.jsx';
import { extractDurations, formatDuration } from '../lib/timers.js';
import { scaleIngredient } from '../lib/units.js';
import { displayTitle, useRecipe } from '../lib/recipes.js';
import { KEYS, readStorage, usePersistentState } from '../lib/storage.js';
import { playAlarm, useTimers, useWakeLock } from '../lib/useTimers.js';
import { useToast } from '../context/AppProviders.jsx';

/**
 * Rail of running timers — visible on every step, not just the one that started
 * it. It sits in the flow directly under the cook-mode header rather than
 * floating, so it can never end up behind the app's sticky header.
 */
function TimerRail({ timers, onPause, onResume, onReset, onDismiss }) {
  if (!timers.length) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-4 pt-3 sm:px-6">
      <AnimatePresence initial={false}>
        {timers.map((timer) => (
          <motion.div
            key={timer.id}
            layout
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-2.5 shadow-lift ${
              timer.finished
                ? 'bg-ember-600 text-white'
                : 'surface text-[color:var(--text-strong)]'
            }`}
          >
            <Clock size={17} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs opacity-80">{timer.label}</p>
              <p className="text-lg font-semibold tabular-nums leading-tight">
                {timer.finished ? 'Time!' : formatDuration(timer.remaining)}
              </p>
            </div>
            {timer.finished ? (
              <button
                type="button"
                onClick={() => onReset(timer.id)}
                className="rounded-full p-2 hover:bg-white/15"
                aria-label="Restart timer"
              >
                <Rotate size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (timer.running ? onPause(timer.id) : onResume(timer.id))}
                className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label={timer.running ? 'Pause timer' : 'Resume timer'}
              >
                {timer.running ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(timer.id)}
              className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Dismiss timer"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function CookMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: recipe, isLoading, isError } = useRecipe(id);

  const [, setProgressStore] = usePersistentState(KEYS.cookProgress, {});
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState([]);
  const [servings, setServings] = useState(null);
  const [system] = usePersistentState(KEYS.units, 'original');
  const [showIngredients, setShowIngredients] = useState(false);
  const [resumeOffer, setResumeOffer] = useState(null);
  const [finished, setFinished] = useState(false);

  const { timers, start, pause, resume, reset, dismiss } = useTimers({
    onFinish: (timer) => {
      playAlarm();
      notify(`${timer.label} is up.`, { tone: 'success', duration: 8000 });
    },
  });

  useWakeLock(Boolean(recipe) && !finished);

  const steps = useMemo(() => recipe?.steps || [], [recipe]);

  // Offer to pick up where the last session stopped, rather than silently
  // jumping to a step the cook may not have expected. This reads the stored
  // progress once, the first time the recipe resolves — watching the store
  // itself would re-open the dialog on every step, since each step writes to it.
  const offeredResume = useRef(false);
  useEffect(() => {
    if (!recipe || offeredResume.current) return;
    offeredResume.current = true;
    const stored = readStorage(KEYS.cookProgress, {})[recipe.id];
    if (stored && stored.index > 0 && stored.index < steps.length) {
      setResumeOffer(stored);
    }
  }, [recipe, steps.length]);

  // Persist progress as the cook moves, so closing the tab is recoverable.
  useEffect(() => {
    // Nothing to record before the first step is done, and writing here would
    // erase the very progress the resume prompt is about to offer.
    if (!recipe || finished || (index === 0 && done.length === 0)) return;
    setProgressStore((current) => ({
      ...current,
      [recipe.id]: { index, done, at: Date.now() },
    }));
    // `setProgressStore` is stable; including `done`/`index` is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.id, index, done, finished]);

  const go = useCallback(
    (next) => {
      setIndex(Math.max(0, Math.min(steps.length - 1, next)));
    },
    [steps.length]
  );

  const completeStep = useCallback(() => {
    setDone((current) =>
      current.includes(index) ? current : [...current, index]
    );
    if (index >= steps.length - 1) setFinished(true);
    else go(index + 1);
  }, [index, steps.length, go]);

  // Arrow keys and space are the natural controls when your hands are busy.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target.matches?.('input, textarea')) return;
      if (event.key === 'ArrowRight') go(index + 1);
      else if (event.key === 'ArrowLeft') go(index - 1);
      else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        completeStep();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, go, completeStep]);

  if (isLoading) {
    return (
      <div className="page space-y-4">
        <div className="skeleton h-4 w-40 rounded" />
        <div className="skeleton h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !recipe || !steps.length) {
    return (
      <div className="page">
        <EmptyState
          icon={Alert}
          title="No steps to cook"
          action={
            <Link to="/" className="btn-primary mt-2">
              Find another recipe
            </Link>
          }
        >
          This recipe does not have step-by-step instructions.
        </EmptyState>
      </div>
    );
  }

  const bengali = recipe.lang === 'bn';
  const baseServings = recipe.servings || 1;
  const currentServings = servings ?? baseServings;
  const factor = currentServings / baseServings;
  const step = steps[index];
  const durations = extractDurations(step.text);
  const progress = ((index + (done.includes(index) ? 1 : 0)) / steps.length) * 100;

  const exit = () => navigate(`/recipe/${recipe.id}`);

  const finish = () => {
    setProgressStore((current) => {
      const { [recipe.id]: _cleared, ...rest } = current;
      return rest;
    });
    setFinished(true);
  };

  if (finished) {
    return (
      <div className="page flex min-h-[70vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid h-20 w-20 place-items-center rounded-full bg-herb-500 text-white"
        >
          <Check size={36} />
        </motion.div>
        <h1 className="mt-6 text-3xl font-semibold">Served.</h1>
        <p className="mt-2 max-w-sm text-muted">
          {displayTitle(recipe)} is done. Worth a note while it is fresh — what
          would you change next time?
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to={`/recipe/${recipe.id}`} className="btn-primary btn-lg">
            Back to the recipe
          </Link>
          <Link to="/" className="btn-secondary btn-lg">
            Find the next one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col">
      <header className="border-b border-[color:var(--border-soft)]">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <button type="button" onClick={exit} className="btn-ghost -ml-2 rounded-full p-2" aria-label="Leave guided mode">
            <X size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-strong" lang={bengali ? 'bn' : undefined}>
              {displayTitle(recipe)}
            </p>
            <p className="text-xs text-muted">
              Step {index + 1} of {steps.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowIngredients(true)}
            className="btn-secondary"
          >
            Ingredients
          </button>
        </div>
        <div
          className="h-1 bg-[color:var(--surface-sunken)]"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Cooking progress"
        >
          <motion.div
            className="h-full bg-ember-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      <TimerRail
        timers={timers}
        onPause={pause}
        onResume={resume}
        onReset={reset}
        onDismiss={dismiss}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            <p className="eyebrow">Step {step.number}</p>
            <p
              lang={bengali ? 'bn' : undefined}
              className="mt-3 font-display text-2xl leading-relaxed text-strong sm:text-3xl sm:leading-relaxed"
            >
              {step.text}
            </p>

            {durations.length ? (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <InfoTip label="About these timers" side="right">
                  Detected automatically from the step text. Tap to start a
                  countdown — it keeps running (with an alarm at the end) even
                  as you move to other steps.
                </InfoTip>
                {durations.map((duration) => (
                  <button
                    key={duration.seconds}
                    type="button"
                    onClick={() => start(duration.seconds, `Step ${step.number} — ${duration.label}`)}
                    className="btn-secondary"
                  >
                    <Clock size={16} />
                    Start {duration.label}
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="btn-secondary btn-lg"
            aria-label="Previous step"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button type="button" onClick={completeStep} className="btn-primary btn-lg flex-1">
            <Check size={18} />
            {index === steps.length - 1 ? 'Finish' : 'Done — next step'}
          </button>

          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === steps.length - 1}
            className="btn-secondary btn-lg"
            aria-label="Skip to next step"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <p>Arrow keys move between steps. Space marks one done.</p>
          <button type="button" onClick={finish} className="btn-ghost">
            Finish early
          </button>
        </div>
      </div>

      <Modal
        open={showIngredients}
        onClose={() => setShowIngredients(false)}
        title="Ingredients"
        size="sm"
      >
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[color:var(--border-soft)] pb-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            Servings
            <InfoTip label="About scaling">
              Adjusts every ingredient amount for this cooking session only —
              it does not change the recipe itself.
            </InfoTip>
          </span>
          <Stepper value={currentServings} onChange={setServings} label="servings" />
        </div>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, position) => {
            const scaled = scaleIngredient(ingredient, factor, system);
            return (
              <li
                key={`${ingredient.name}-${position}`}
                lang={bengali ? 'bn' : undefined}
                className="flex gap-2 text-sm"
              >
                {scaled.displayAmount ? (
                  <span className="min-w-[4.5rem] font-semibold tabular-nums text-strong">
                    {scaled.displayAmount}
                    {scaled.displayUnit ? ` ${scaled.displayUnit}` : ''}
                  </span>
                ) : null}
                <span>{ingredient.name}</span>
              </li>
            );
          })}
        </ul>
      </Modal>

      <Modal
        open={Boolean(resumeOffer)}
        onClose={() => setResumeOffer(null)}
        title="Pick up where you left off?"
        size="sm"
      >
        <p className="text-sm text-body">
          You stopped at step {(resumeOffer?.index || 0) + 1} of {steps.length}.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setResumeOffer(null);
              setIndex(0);
              setDone([]);
            }}
          >
            Start over
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setIndex(resumeOffer.index);
              setDone(resumeOffer.done || []);
              setResumeOffer(null);
            }}
          >
            Resume
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CookMode;
