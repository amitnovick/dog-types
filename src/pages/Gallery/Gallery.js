import React from "react";
import PropTypes from "prop-types";

import InfiniteScroll from "../../components/InfiniteScroll/InfiniteScroll";
import styles from "./styles.module.scss";
import items from "../../items";

const ITEMS_COUNT_PER_LOAD = 20;

class Gallery extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      isNavigatingBackFromItemPage,
      cachedItems,
      cachedRenderedItemsLastIndex
    } = props;

    /* TODO: handle prop `itemIdFromItemPageRedirection` and scroll to it when `isNavigatingBackFromItemPage === true` */
    console.log("isNavigatingBackFromItemPage:", isNavigatingBackFromItemPage);
    this.state = {
      renderedItemsLastIndex: isNavigatingBackFromItemPage
        ? cachedRenderedItemsLastIndex
        : 0,
      cachedItems: isNavigatingBackFromItemPage ? cachedItems : []
    };
  }

  fetchData = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        /* Mocking a request */
        this.setState(previousState => {
          return {
            ...previousState,
            cachedItems: [
              ...previousState.cachedItems,
              ...items.slice(
                previousState.renderedItemsLastIndex + 1,
                Math.min(
                  65 + 1,
                  previousState.renderedItemsLastIndex +
                    1 +
                    ITEMS_COUNT_PER_LOAD
                )
              )
            ],
            renderedItemsLastIndex:
              previousState.renderedItemsLastIndex + ITEMS_COUNT_PER_LOAD
          };
        });

        resolve({
          isDataSourceExhausted: this.state.cachedItems.length >= 65
        });
      }, 500);
    });
  };

  render() {
    const { navigateToItem } = this.props;
    const { cachedItems, renderedItemsLastIndex } = this.state;
    return (
      <>
        <ul>
          {cachedItems.map(cachedItem => (
            <li key={cachedItem.id} className={styles.li}>
              <div
                className={styles.circle}
                style={{
                  backgroundColor: cachedItem.backgroundColor,
                  color: cachedItem.color
                }}
                onClick={() =>
                  navigateToItem({
                    itemId: String(cachedItem.id),
                    items: cachedItems,
                    renderedItemsLastIndex: renderedItemsLastIndex
                  })
                }
              >
                {cachedItem.id}
              </div>
            </li>
          ))}
        </ul>
        <InfiniteScroll fetchData={this.fetchData} />
      </>
    );
  }
}

Gallery.propTypes = {
  navigateToItem: PropTypes.func.isRequired,
  isNavigatingBackFromItemPage: PropTypes.bool.isRequired,
  cachedItems: PropTypes.array,
  cachedRenderedItemsLastIndex: PropTypes.number,
  itemIdFromItemPageRedirection: PropTypes.string
};

export default Gallery;
