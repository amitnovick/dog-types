import React from "react";
import PropTypes from "prop-types";

import styles from "./styles.module.scss";
import items from "../items";

class ItemPage extends React.PureComponent {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const { itemId } = this.props;
    const item = items.find(item => item.id === itemId);

    return (
      <div className={styles.itemPageBox}>
        <div
          style={{ backgroundColor: item.backgroundColor, color: item.color }}
        />
        <h1>id: {itemId}</h1>
      </div>
    );
  }
}

ItemPage.propTypes = {
  itemId: PropTypes.string.isRequired
};

export default ItemPage;
