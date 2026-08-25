import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Alert, Check, Info } from './icons.jsx';
import { useToast } from '../context/AppProviders.jsx';

/** Recipe-card-shaped placeholder, so loading does not reflow the grid. */
export function CardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ icon: IconComponent, title, children, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      {IconComponent ? (
        <span className="rounded-2xl bg-[color:var(--surface-sunken)] p-3 text-[color:var(--text-muted)]">
          <IconComponent size={24} />
        </span>
      ) : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {children ? (
        <p className="max-w-sm text-sm text-muted">{children}</p>
      ) : null}
      {action}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, action, id }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
        <h2 id={id} className="text-2xl font-semibold">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/**
 * Modal dialog. Traps focus, restores it on close, and closes on Escape or a
 * click on the backdrop.
 */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    // Let the panel mount before moving focus into it.
    const focusTimer = setTimeout(() => panelRef.current?.focus(), 30);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = overflow;
      clearTimeout(focusTimer);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  const width = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' }[size];

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/55 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`surface relative flex max-h-[90vh] w-full ${width} flex-col
              overflow-hidden rounded-t-3xl shadow-lift outline-none sm:rounded-3xl`}
          >
            <header className="flex items-center justify-between gap-4 border-b border-[color:var(--border-soft)] px-5 py-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost -mr-2 rounded-full p-2"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

const TONE_STYLE = {
  info: { icon: Info, className: 'text-[color:var(--text-strong)]' },
  success: { icon: Check, className: 'text-herb-600 dark:text-herb-300' },
  error: { icon: Alert, className: 'text-ember-600 dark:text-ember-300' },
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 safe-bottom"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const tone = TONE_STYLE[toast.tone] || TONE_STYLE.info;
          const ToneIcon = tone.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="card pointer-events-auto flex w-full max-w-md items-center gap-3 px-4 py-3 shadow-lift"
            >
              <span className={tone.className}>
                <ToneIcon size={18} />
              </span>
              <p className="flex-1 text-sm text-strong">{toast.message}</p>
              {toast.action ? (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick();
                    dismiss(toast.id);
                  }}
                  className="text-sm font-semibold text-ember-600 dark:text-ember-300"
                >
                  {toast.action.label}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="btn-ghost -mr-1 rounded-full p-1.5"
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}

/**
 * Small "i" icon that reveals a short explanation on hover, focus, or tap.
 * Use next to a control or label whose purpose, behaviour, or terminology
 * isn't obvious at a glance — keep the text to one or two sentences.
 * Keyboard/screen-reader accessible: it's a real button with `aria-describedby`
 * pointing at the tooltip text, and the tooltip closes on Escape or blur.
 */
export function InfoTip({ label = 'More info', children, side = 'top' }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const position =
    side === 'bottom'
      ? 'top-full mt-2'
      : side === 'left'
        ? 'right-full mr-2 top-1/2 -translate-y-1/2'
        : side === 'right'
          ? 'left-full ml-2 top-1/2 -translate-y-1/2'
          : 'bottom-full mb-2';

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-[color:var(--text-muted)] outline-none transition hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      >
        <Info size={14} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === 'bottom' ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className={`pointer-events-none absolute z-50 w-56 rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-3 py-2 text-xs leading-relaxed text-strong shadow-lift ${position}`}
          >
            {children}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

/** −/+ stepper used for servings and quantities. */
export function Stepper({ value, onChange, min = 1, max = 40, label }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-1">
      <button
        type="button"
        className="btn-ghost rounded-full p-1.5 disabled:opacity-30"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <span aria-hidden="true">−</span>
      </button>
      <span className="min-w-[2.5rem] text-center text-sm font-semibold tabular-nums text-strong">
        {value}
      </span>
      <button
        type="button"
        className="btn-ghost rounded-full p-1.5 disabled:opacity-30"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}

/** Segmented control — one visible choice out of a short list. */
export function Segmented({ options, value, onChange, label }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-sunken)] p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            value === option.value
              ? 'bg-[color:var(--surface-card)] text-strong shadow-card'
              : 'text-muted hover:text-strong'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
