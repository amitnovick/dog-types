import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";

import "./globalStyle.css";
import App from "./components/App/App";

ReactDOM.render(<App />, document.getElementById("root"));

if (module.hot) {
  module.hot.accept();
}
