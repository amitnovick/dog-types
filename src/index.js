import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import "normalize.css";

import "./globalStyle.css";
import CustomRouter from "./components/CustomRouter/CustomRouter";
import history from "./history";

ReactDOM.render(
  <Router history={history}>
    <CustomRouter />
  </Router>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept();
}
