import React from "react";
import { Link } from "react-router-dom";

import InfiniteScroll from "../InfiniteScroll/InfiniteScroll";
import styles from "./styles.module.scss";
import items from "../items";

const ITEMS_COUNT_PER_LOAD = 20;

class Gallery extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      renderedItemsLastIndex: 0,
      cachedItems: []
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
    const { cachedItems } = this.state;
    return (
      <>
        <ul>
          {cachedItems.map(cachedItem => (
            <li key={cachedItem.id} className={styles.li}>
              <div
                className={styles.circle}
                style={{
                  backgroundColor: cachedItem.backgroundColor
                }}
              >
                <Link
                  to={`/${cachedItem.id}`}
                  style={{ color: cachedItem.color }}
                >
                  {cachedItem.id}
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <InfiniteScroll fetchData={this.fetchData} />
      </>
    );
  }
}

export default Gallery;
