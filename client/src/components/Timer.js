import React, { useState, useEffect } from 'react';
import styles from './Timer.module.css';

function Timer({ initialMinutes = 0, initialSeconds = 0, onComplete }) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
    setIsRunning(false); // Reset timer when initialMinutes/initialSeconds change
  }, [initialMinutes, initialSeconds]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(timer);
          setIsRunning(false);
          if (onComplete) {
            onComplete();
          }
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds, onComplete]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className={`${styles.timerContainer} dark:bg-gray-700/70 dark:border-gray-600/50`}>
      <div className={`${styles.timerDisplay} dark:text-gray-100`}>
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>
      <div className={styles.timerControls}>
        {!isRunning && (minutes > 0 || seconds > 0) ? (
          <button onClick={startTimer} className="bg-gray-600 text-white px-5 py-2 rounded-full cursor-pointer text-lg font-semibold transition-all duration-300 mx-2 hover:bg-gray-700 -translate-y-0.5">
            Start
          </button>
        ) : (
          <button onClick={pauseTimer} disabled={!isRunning} className="bg-gray-600 text-white px-5 py-2 rounded-full cursor-pointer text-lg font-semibold transition-all duration-300 mx-2 hover:bg-gray-700 -translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70">
            Pause
          </button>
        )}
        <button onClick={resetTimer} className="bg-gray-600 text-white px-5 py-2 rounded-full cursor-pointer text-lg font-semibold transition-all duration-300 mx-2 hover:bg-gray-700 -translate-y-0.5">
          Reset
        </button>
      </div>
    </div>
  );
}

export default Timer;
