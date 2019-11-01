import React from "react";
import Gallery from "../../pages/Gallery/Gallery";
import Modal from "react-modal";
import ItemPage from "../../pages/ItemPage/ItemPage";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

Modal.setAppElement("#root");

class App extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      isModalOpen: false,
      itemId: null
    };
  }

  openModal = () => {
    this.setState({ isModalOpen: true });
  };

  afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    console.log("after opened modal triggered");
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  render() {
    const { itemId, isModalOpen } = this.state;
    return (
      <>
        <Gallery
          openItemModal={itemId => {
            this.setState({ itemId: itemId });
            this.openModal(itemId);
          }}
        />
        <Modal
          isOpen={isModalOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <button onClick={this.closeModal}>x</button>
          <ItemPage itemId={itemId} />
        </Modal>
      </>
    );
  }
}

export default App;
