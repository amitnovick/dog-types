import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./globalStyle.css";
import InfiniteScroll from "./InfiniteScroll/InfiniteScroll";
import ItemPage from "./ItemPage/ItemPage";

class App extends React.PureComponent {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <InfiniteScroll />
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
