import React from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import "./styles.scss";

const TIMER_MS = 5000;

const Timer = () => {
  const [timer, setTimer] = React.useState(TIMER_MS);
  const intervalRef = React.useRef();

  const createInterval = () => {
    const interval = setInterval(() => {
      setTimer(previousTimer => {
        if (previousTimer <= 0) {
          clearInterval(interval);
          console.log("Timer reached 0");
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

  const percentage = timer / (TIMER_MS / 100);
  const displayedSeconds = Math.ceil(timer / 1000);

  return (
    <div className="timer-row">
      <div className="numeric-timer">{displayedSeconds}</div>
      <LinearProgress
        className="progress-bar"
        variant="determinate"
        color="secondary"
        data-state={percentage < 10 ? "ending" : "in-progress"}
        value={percentage}
      />
    </div>
  );
};

export default Timer;
