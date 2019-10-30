import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./globalStyle.css";
import ItemPage from "./ItemPage/ItemPage";
import Gallery from "./Gallery/Gallery";

class App extends React.PureComponent {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <Gallery />
          </Route>
          <Route exact path="/:itemId">
            {({ match }) => <ItemPage itemId={match.params.itemId} />}
          </Route>
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));

if (module.hot) {
  module.hot.accept();
}
