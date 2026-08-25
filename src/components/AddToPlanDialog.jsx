import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Stepper } from './ui.jsx';
import { KEYS, usePersistentState } from '../lib/storage.js';
import { useToast } from '../context/AppProviders.jsx';
import {
  SLOTS,
  addToPlan,
  dateKey,
  isToday,
  planEntryFrom,
  startOfWeek,
  weekDays,
} from '../lib/plan.js';

/** Puts a recipe into a day and meal slot, at a serving count the cook picks. */
export function AddToPlanDialog({ open, onClose, recipe }) {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [, setPlan] = usePersistentState(KEYS.mealPlan, {});

  const [day, setDay] = useState(() => dateKey(new Date()));
  const [slot, setSlot] = useState('dinner');
  const [servings, setServings] = useState(recipe?.servings || 2);

  // Reset to sensible defaults each time the dialog opens for a recipe.
  useEffect(() => {
    if (!open) return;
    setDay(dateKey(new Date()));
    setSlot('dinner');
    setServings(recipe?.servings || 2);
  }, [open, recipe]);

  if (!recipe) return null;

  // Two weeks ahead is as far as anyone plans; more is a scrolling problem.
  const days = [
    ...weekDays(startOfWeek(new Date())),
    ...weekDays(startOfWeek(new Date(Date.now() + 7 * 864e5))),
  ].filter((date) => dateKey(date) >= dateKey(new Date()));

  const confirm = () => {
    setPlan((current) =>
      addToPlan(current, day, slot, planEntryFrom(recipe, servings))
    );
    onClose();
    notify(`Added to ${SLOTS.find((s) => s.key === slot).label.toLowerCase()}.`, {
      tone: 'success',
      action: { label: 'Open plan', onClick: () => navigate('/planner') },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add to meal plan" size="sm">
      <div className="space-y-5">
        <div>
          <p className="label">Day</p>
          <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {days.map((date) => {
              const key = dateKey(date);
              const active = key === day;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDay(key)}
                  aria-pressed={active}
                  className={`chip shrink-0 flex-col !items-center !gap-0 !px-3 !py-2 ${
                    active ? 'chip-active' : ''
                  }`}
                >
                  <span className="text-2xs uppercase tracking-wide opacity-75">
                    {isToday(date)
                      ? 'Today'
                      : date.toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span className="text-sm font-semibold">{date.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="label">Meal</p>
          <div className="flex flex-wrap gap-2">
            {SLOTS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSlot(option.key)}
                aria-pressed={slot === option.key}
                className={`chip ${slot === option.key ? 'chip-active' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="label !mb-0">Servings</p>
            <p className="text-xs text-muted">
              Quantities on the shopping list scale to this.
            </p>
          </div>
          <Stepper value={servings} onChange={setServings} label="servings" />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={confirm}>
          Add to plan
        </button>
      </div>
    </Modal>
  );
}

export default AddToPlanDialog;
