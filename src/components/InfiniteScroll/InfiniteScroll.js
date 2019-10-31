import React from "react";
import PropTypes from "prop-types";

import styles from "./styles.module.scss";

class InfiniteScroll extends React.PureComponent {
  constructor(props) {
    super(props);

    this.bottomSentinelRef = React.createRef();

    this.state = {
      isLoading: false,
      isDataSourceExhausted: false
    };
  }

  loadData = async () => {
    this.setState({ isLoading: true });
    const { isDataSourceExhausted } = await this.props.fetchData();
    this.setState(previousState => {
      return {
        isLoading: false,
        isDataSourceExhausted: isDataSourceExhausted
      };
    });
  };

  componentDidMount() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (
        entry.isIntersecting &&
        this.state.isLoading === false &&
        this.state.isDataSourceExhausted === false
      ) {
        this.loadData();
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
    const { isDataSourceExhausted } = this.state;
    const { bottomSentinelRef } = this;

    return (
      <div
        ref={bottomSentinelRef}
        className={
          isDataSourceExhausted === true ? styles.exhausted : styles.loader
        }
      >
        {isDataSourceExhausted ? "No more items to display!" : "Loading..."}
      </div>
    );
  }
}

InfiniteScroll.propTypes = {
  fetchData: PropTypes.func.isRequired
};

export default InfiniteScroll;
