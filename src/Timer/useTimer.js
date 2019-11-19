import React from "react";

const useTimer = ({ onTimeout, duration }) => {
  const [timer, setTimer] = React.useState(duration);

  const intervalRef = React.useRef();

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

  React.useEffect(() => {
    intervalRef.current = createInterval();
  }, []);

  const cancelTimer = () => {
    clearInterval(intervalRef.current);
  };

  return [timer, cancelTimer];
};

export default useTimer;
