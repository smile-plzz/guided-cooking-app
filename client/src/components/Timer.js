import React, { useState, useEffect, useRef } from 'react';

function Timer({ initialMinutes = 0, initialSeconds = 0, onComplete }) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(timerRef.current);
          setIsRunning(false);
          if (onComplete) {
            onComplete();
          }
          // Play an audible alert
          const audio = new Audio('https://www.soundjay.com/buttons/beep-07.wav'); // Example sound
          audio.play();
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [minutes, seconds, isRunning, onComplete]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  };

  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="timer-container">
      <div className="timer-display">
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>
      <div className="timer-controls">
        {!isRunning && (minutes > 0 || seconds > 0) ? (
          <button onClick={startTimer}>Start</button>
        ) : (
          <button onClick={pauseTimer} disabled={!isRunning}>Pause</button>
        )}
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}

export default Timer;
