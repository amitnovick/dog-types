import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Flipper, Flipped } from "react-flip-toolkit";
import "./styles.scss";

const choices = ["malinois", "pinscher", "golden retriever"];

function mod(n, m) {
  return ((n % m) + m) % m;
}

const AnimatedSquare = ({ imageUrl, onFinish }) => {
  const successRef = React.useRef();
  const [animationState, setAnimationState] = useState("initial");
  const [{ top, left, width, height }, setProperties] = useState({});
  const moveSquare = () => {
    if (animationState === "initial") {
      setAnimationState("moving");
      const {
        top,
        left,
        width,
        height
      } = successRef.current.getBoundingClientRect();
      setProperties({
        top: top + 4,
        left: left + width / 4,
        width: width / 2,
        height: height - 8
      });
    }
  };

  return (
    <>
      <div className="top-bar">
        <div className="all">ALL</div>
        <div
          ref={successRef}
          className="success"
          data-state={animationState === "moving" ? "consuming" : undefined}
        >
          SUCCESS
        </div>
        <div className="fail">FAIL</div>
      </div>
      <div className="content">
        <div className="image-container">
          <Flipper
            flipKey={animationState}
            onComplete={() => {
              setAnimationState("top");
              onFinish();
            }}
          >
            <Flipped flipId="square">
              <img
                src={imageUrl}
                alt="dog"
                className="square"
                data-state={animationState}
                style={
                  animationState === "moving"
                    ? {
                        top,
                        left,
                        width,
                        height
                      }
                    : {}
                }
              />
            </Flipped>
          </Flipper>
        </div>
        <ol className="choices" data-state={animationState}>
          {choices.map(choice => (
            <li onClick={moveSquare} key={choice}>
              {choice}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
};

const App = () => {
  const [currentDogID, setCurrentDogID] = React.useState(0);
  const dogs = {
    0: {
      imageUrl: "https://images.dog.ceo/breeds/malinois/n02105162_2079.jpg"
    },
    1: {
      imageUrl:
        "https://images.dog.ceo/breeds/pointer-german/n02100236_5628.jpg"
    }
  };
  return (
    <>
      <AnimatedSquare
        key={currentDogID}
        imageUrl={dogs[currentDogID].imageUrl}
        onFinish={() =>
          setCurrentDogID(mod(currentDogID + 1, Object.keys(dogs).length))
        }
      />
    </>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
