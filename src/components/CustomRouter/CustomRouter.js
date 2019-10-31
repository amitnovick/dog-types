import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import PropTypes from "prop-types";

import ItemPage from "../../pages/ItemPage/ItemPage";
import Gallery from "../../pages/Gallery/Gallery";
import history from "../../history";

class CustomRouter extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      userFlowState: "normal", // `normal` | `galleryToItemPage` | `galleryToItemPageToGallery`
      cachedGalleryPageItems: [],
      cachedRenderedItemsLastIndex: null,
      itemIdFromItemPageRedirection: null
    };
  }

  saveGalleryPageItemsToCache = cachedGalleryPageItems => {
    this.setState({ cachedGalleryPageItems: cachedGalleryPageItems });
  };

  componentDidMount() {
    this.unblock = history.block((_, action) => {
      if (action === "POP") {
        if (this.state.userFlowState === "galleryToItemPage") {
          this.setState({ userFlowState: "galleryToItemPageToGallery" });
        }
      }
    });
  }
  componentWillUnmount() {
    this.unblock();
  }

  render() {
    const { history } = this.props;
    const {
      userFlowState,
      cachedGalleryPageItems,
      cachedRenderedItemsLastIndex,
      itemIdFromItemPageRedirection
    } = this.state;

    return (
      <Switch>
        <Route exact path="/">
          <Gallery
            navigateToItem={({ itemId, items, renderedItemsLastIndex }) => {
              this.setState({
                userFlowState: "galleryToItemPage",
                itemIdFromItemPageRedirection: itemId,
                cachedGalleryPageItems: items,
                cachedRenderedItemsLastIndex: renderedItemsLastIndex
              });
              history.push(`/${itemId}`);
            }}
            isNavigatingBackFromItemPage={
              userFlowState === "galleryToItemPageToGallery"
            }
            cachedItems={cachedGalleryPageItems}
            cachedRenderedItemsLastIndex={cachedRenderedItemsLastIndex}
            itemIdFromItemPageRedirection={itemIdFromItemPageRedirection}
          />
        </Route>
        <Route exact path="/:itemId">
          {({ match }) => (
            <ItemPage
              itemId={match.params.itemId}
              shouldDisplayBackToGalleryButton={
                userFlowState === "galleryToItemPage"
              }
            />
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
