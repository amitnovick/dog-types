import React from "react";

const useTimer = ({ onTimeout, duration }) => {
  const [timer, setTimer] = React.useState(duration);

  const intervalRef = React.useRef();
  const cancelTimerRef = React.useRef(() => {
    clearInterval(intervalRef.current);
  });

  const startTimerRef = React.useRef(() => {
    intervalRef.current = createInterval();
  });

  const createInterval = () => {
    const interval = setInterval(() => {
      setTimer(previousTimer => {
        if (previousTimer <= 0) {
          clearInterval(interval);
          onTimeout();
          return previousTimer;
        } else {
          return previousTimer - 50;
        }
      });
    }, 50);
    return interval;
  };

  return {
    timer: timer,
    startTimer: startTimerRef.current,
    cancelTimer: cancelTimerRef.current
  };
};

export default useTimer;
