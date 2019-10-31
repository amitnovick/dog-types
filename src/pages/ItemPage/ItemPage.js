import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";
import items from "../../items";

class ItemPage extends React.PureComponent {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const {
      itemId,
      shouldDisplayBackToGalleryButton,
      navigateBackToGalleryButton
    } = this.props;
    const item = items.find(item => String(item.id) === String(itemId));

    return (
      <div className={styles.page}>
        {shouldDisplayBackToGalleryButton ? (
          <div className={styles.backNavigationButtonRow}>
            <button
              onClick={() => navigateBackToGalleryButton()}
              className={styles.backNavigationButton}
            >
              <FontAwesomeIcon icon={faArrowLeft} size="3x" />
            </button>
          </div>
        ) : null}
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
  itemId: PropTypes.string.isRequired,
  shouldDisplayBackToGalleryButton: PropTypes.bool.isRequired,
  navigateBackToGalleryButton: PropTypes.func.isRequired
};

export default ItemPage;
