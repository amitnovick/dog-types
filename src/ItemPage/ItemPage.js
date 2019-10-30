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
    console.log("itemId:", itemId);
    const item = items.find(item => String(item.id) === String(itemId));
    console.log("item:", item);

    return (
      <div className={styles.page}>
        <div
          className={styles.image}
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
