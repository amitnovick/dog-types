import React from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import "./styles.scss";

const Timer = ({ timer, duration }) => {
  const percentage = timer / (duration / 100);
  const displayedSeconds = Math.ceil(timer / 1000);

  return (
    <div className="timer-row">
      <div className="numeric-timer">{displayedSeconds}</div>
      <LinearProgress
        className="progress-bar"
        variant="determinate"
        color="secondary"
        style={{ "--percentage": percentage }}
        value={percentage}
      />
    </div>
  );
};

export default Timer;
