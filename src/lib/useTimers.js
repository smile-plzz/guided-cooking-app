import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Multiple concurrent kitchen timers.
 *
 * Each timer stores the wall-clock instant it should fire at, not a countdown
 * that gets decremented — a tab that is backgrounded or a phone that sleeps
 * throttles intervals badly, and a rice timer that quietly runs slow is worse
 * than no timer at all.
 */
export function useTimers({ onFinish } = {}) {
  const [timers, setTimers] = useState([]);
  const finishHandler = useRef(onFinish);
  finishHandler.current = onFinish;

  // One shared ticker drives every timer's display.
  useEffect(() => {
    if (!timers.some((timer) => timer.running)) return undefined;
    const interval = setInterval(() => {
      setTimers((current) => {
        let changed = false;
        const next = current.map((timer) => {
          if (!timer.running) return timer;
          const remaining = Math.round((timer.endsAt - Date.now()) / 1000);
          if (remaining <= 0 && !timer.finished) {
            changed = true;
            finishHandler.current?.(timer);
            return { ...timer, remaining: 0, running: false, finished: true };
          }
          if (remaining !== timer.remaining) {
            changed = true;
            return { ...timer, remaining };
          }
          return timer;
        });
        return changed ? next : current;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [timers]);

  const start = useCallback((seconds, label) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setTimers((current) => [
      ...current,
      {
        id,
        label: label || `${Math.round(seconds / 60)} min`,
        duration: seconds,
        remaining: seconds,
        endsAt: Date.now() + seconds * 1000,
        running: true,
        finished: false,
      },
    ]);
    return id;
  }, []);

  const pause = useCallback((id) => {
    setTimers((current) =>
      current.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              running: false,
              remaining: Math.max(
                0,
                Math.round((timer.endsAt - Date.now()) / 1000)
              ),
            }
          : timer
      )
    );
  }, []);

  const resume = useCallback((id) => {
    setTimers((current) =>
      current.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              running: true,
              finished: false,
              endsAt: Date.now() + timer.remaining * 1000,
            }
          : timer
      )
    );
  }, []);

  const reset = useCallback((id) => {
    setTimers((current) =>
      current.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              remaining: timer.duration,
              endsAt: Date.now() + timer.duration * 1000,
              running: true,
              finished: false,
            }
          : timer
      )
    );
  }, []);

  const dismiss = useCallback((id) => {
    setTimers((current) => current.filter((timer) => timer.id !== id));
  }, []);

  return { timers, start, pause, resume, reset, dismiss };
}

/**
 * Plays a short alarm through the Web Audio API. No audio file to ship, and it
 * works from a user gesture chain (starting a timer counts).
 */
export function playAlarm() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const now = context.currentTime;

    // Three rising beeps — audible over an extractor fan, not startling.
    [0, 0.28, 0.56].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 660 + index * 110;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.22);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.24);
    });

    setTimeout(() => context.close(), 1200);
  } catch {
    // Audio is a nicety; a blocked context must not break guided mode.
  }
}

/**
 * Keeps the screen on while cooking. Only Chromium-family browsers implement
 * this, so the whole thing is best-effort and silent when unsupported.
 */
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return undefined;

    let sentinel = null;
    let cancelled = false;

    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        // Denied, or the tab is not visible. Nothing to do.
      }
    };

    // The lock is dropped whenever the tab is hidden; take it again on return.
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) request();
    };

    request();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      sentinel?.release?.().catch(() => {});
    };
  }, [active]);
}
