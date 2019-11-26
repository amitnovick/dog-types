import React from "react";

import TimerContext from "./TimerContext";
import ProgressBar from "./ProgressBar";

const ProgressBarContainer = () => {
  const { timer, duration } = React.useContext(TimerContext);

  return <ProgressBar timer={timer} duration={duration} />;
};

export default ProgressBarContainer;
