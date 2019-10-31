import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import PropTypes from "prop-types";

import ItemPage from "../../pages/ItemPage/ItemPage";
import Gallery from "../../pages/Gallery/Gallery";

class RouteReactingToLeave extends React.PureComponent {
  componentWillUnmount() {
    console.log("unmounting");
    if (this.props.userFlowState === "galleryToItemPage") {
      console.log("updating state");
      this.props.extendUserFlowState();
    }
  }

  render() {
    const { children } = this.props;
    return <>{children} </>;
  }
}

class CustomRouter extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      userFlowState: "normal", // `normal` | `galleryToItemPage` | `galleryToItemPageToGallery`
      cachedGalleryPageItems: [],
      itemIdFromItemPageRedirection: null
    };
  }

  saveGalleryPageItemsToCache = cachedGalleryPageItems => {
    this.setState({ cachedGalleryPageItems: cachedGalleryPageItems });
  };

  render() {
    const { history } = this.props;
    const {
      userFlowState,
      cachedGalleryPageItems,
      itemIdFromItemPageRedirection
    } = this.state;

    console.log("history:", history);
    console.log("userFlowState:", userFlowState);

    return (
      <Switch>
        <Route exact path="/">
          <Gallery
            navigateToItem={(itemId, cachedItems) => {
              this.setState({
                userFlowState: "galleryToItemPage",
                itemIdFromItemPageRedirection: itemId,
                cachedGalleryPageItems: cachedItems
              });
              history.push(`/${itemId}`);
            }}
            isNavigatingBackFromItemPage={
              userFlowState === "galleryToItemPageToGallery"
            }
            cachedItems={cachedGalleryPageItems}
            itemIdFromItemPageRedirection={itemIdFromItemPageRedirection}
          />
        </Route>
        <Route exact path="/:itemId">
          {({ match }) => (
            <RouteReactingToLeave
              userFlowState={userFlowState}
              extendUserFlowState={() => {
                console.log("updating state callback");
                this.setState({ userFlowState: "galleryToItemPageToGallery" });
              }}
            >
              <ItemPage
                itemId={match.params.itemId}
                shouldDisplayBackToGalleryButton={
                  userFlowState === "galleryToItemPage"
                }
              />
            </RouteReactingToLeave>
          )}
        </Route>
      </Switch>
    );
  }
}

CustomRouter.propTypes = {
  history: PropTypes.object
};

export default withRouter(CustomRouter);
