import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "normalize.css";
import "./globalStyle.css";
import CustomRouter from "./components/CustomRouter/CustomRouter";

ReactDOM.render(
  <BrowserRouter>
    <CustomRouter />
  </BrowserRouter>,
  document.getElementById("root")
);

if (module.hot) {
  module.hot.accept();
}
