import React from "react";
import PropTypes from "prop-types";

import styles from "./styles.module.scss";
import items from "../../items";

class ItemPage extends React.PureComponent {
  render() {
    const { itemId } = this.props;
    const item = items.find(item => String(item.id) === String(itemId));

    return (
      <div className={styles.page}>
        {item == null ? (
          <>
            <div
              className={styles.image}
              style={{ backgroundColor: "black", color: "white" }}
            />
            <h1>id: NotFound</h1>
          </>
        ) : (
          <>
            <div
              className={styles.image}
              style={{
                backgroundColor: item.backgroundColor,
                color: item.color
              }}
            />
            <h1>id: {itemId}</h1>
          </>
        )}
      </div>
    );
  }
}

ItemPage.propTypes = {
  itemId: PropTypes.string // can be `null`
};

export default ItemPage;
