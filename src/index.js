import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import "./globalStyles.scss";

import checkIsWebAnimationsSupported from "./utils/modernizrDetectFeatureWebAnimations.js";
import App from "./App/App";

const loadApp = () => {
  ReactDOM.render(<App />, document.querySelector("#root"));
};

(async () => {
  const isWebAnimationsSupported = checkIsWebAnimationsSupported();
  if (!isWebAnimationsSupported) {
    await import("web-animations-js");
  }
  loadApp();
})();
