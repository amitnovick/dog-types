import React from "react";
import items from "../items";
import styles from "./styles.module.scss";

const ITEMS_COUNT_PER_LOAD = 20;

class InfiniteScroll extends React.PureComponent {
  constructor(props) {
    super(props);

    this.bottomSentinelRef = React.createRef();

    this.state = {
      loaderState: "idle", // `idle` | `loading`
      dataSourceExhaustionState: "notExhausted" // `notExhausted` | `exhausted`
    };
  }

  fetchData = () => {
    this.setState({ loaderState: "loading" });
    setTimeout(() => {
      this.setState(previousState => ({
        renderedItemsLastIndex:
          previousState.renderedItemsLastIndex + ITEMS_COUNT_PER_LOAD,
        loaderState: "idle",
        cachedItems: [
          ...previousState.cachedItems,
          ...items.slice(
            previousState.renderedItemsLastIndex + 1,
            previousState.renderedItemsLastIndex + 1 + ITEMS_COUNT_PER_LOAD
          )
        ],
        dataSourceExhaustionState:
          previousState.renderedItemsLastIndex + 1 + ITEMS_COUNT_PER_LOAD > 420
            ? "exhausted"
            : "notExhausted"
      }));
    }, 500);
  };

  componentDidMount() {
    this.fetchData();
    this.observer = new IntersectionObserver(([entry]) => {
      if (
        entry.isIntersecting &&
        this.state.loaderState === "idle" &&
        this.state.dataSourceExhaustionState === "notExhausted"
      ) {
        this.fetchData();
      }
    }, {});
    const bottomSentinelElement = this.bottomSentinelRef.current;
    this.observer.observe(bottomSentinelElement);
  }

  componentWillUnmount() {
    const bottomSentinelElement = this.bottomSentinelRef.current;
    this.observer.unobserve(bottomSentinelElement);
    this.observer.disconnect();
  }

  render() {
    const { dataSourceExhaustionState } = this.state;
    const { bottomSentinelRef } = this;

    return (
      <>
        {dataSourceExhaustionState === "exhausted" ? (
          <div className={styles.exhausted}>No more items to display!</div>
        ) : (
          <div ref={bottomSentinelRef} className={styles.loader}>
            Loading...
          </div>
        )}
      </>
    );
  }
}

export default InfiniteScroll;
