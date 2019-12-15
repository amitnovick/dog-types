import React from "react";
import useGetterState from "../../utils/useGetterState";

const useTimer = ({ onTimeout, duration }) => {
  const [getTimer, setTimer] = useGetterState(duration);

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
    getTimer: getTimer,
    startTimer: startTimerRef.current,
    cancelTimer: cancelTimerRef.current
  };
};

export default useTimer;
