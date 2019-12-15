import React from "react";

const useTimer = ({ duration }) => {
  const [timer, setTimer] = React.useState(duration);

  const intervalRef = React.useRef();
  const cancelTimerRef = React.useRef(() => {
    clearInterval(intervalRef.current);
  });

  const startTimerRef = React.useRef(() => {
    setTimer(duration);
    intervalRef.current = createInterval();
  });

  const createInterval = () => {
    const interval = setInterval(() => {
      setTimer(previousTimer => {
        if (previousTimer <= 0) {
          clearInterval(interval);
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
