import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Flipper, Flipped } from "react-flip-toolkit";
import { CircularProgress } from "@material-ui/core";
import { ReactComponent as DeckCheckmark } from "./deck-checkmark.svg";
import { ReactComponent as DeckWrong } from "./deck-wrong.svg";
import { ReactComponent as DeckAll } from "./deck-all.svg";

import "./styles.scss";

const choices = ["malinois", "pinscher", "golden retriever"];

function mod(n, m) {
  return ((n % m) + m) % m;
}

function preloadImage(url) {
  return new Promise(resolve => {
    let img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
  });
}

const AnimatedSquare = ({ imageUrl, onFinish }) => {
  const successRef = React.useRef();
  const [animationState, setAnimationState] = useState("initial");
  const [{ top, left, width, height }, setProperties] = useState({});
  const moveSquare = () => {
    if (animationState === "initial") {
      setAnimationState("moving");
      console.log("successRef:", successRef);
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
  console.log("successRef:", successRef);

  return (
    <>
      <div className="top-bar-container">
        <div className="top-bar">
          <div>
            <DeckAll className="all" />
          </div>
          <div>
            <DeckWrong className="fail" />
          </div>
          <div ref={successRef}>
            <DeckCheckmark
              className="success"
              data-state={animationState === "moving" ? "consuming" : undefined}
            />
          </div>
        </div>
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
  const [{ currentDogID, dogs, isLoading }, setState] = React.useState({
    currentDogID: 0,
    dogs: {
      0: {
        imageUrl: "https://images.dog.ceo/breeds/malinois/n02105162_2079.jpg"
      },
      1: {
        imageUrl:
          "https://images.dog.ceo/breeds/pointer-german/n02100236_5628.jpg"
      }
    },
    isLoading: true
  });

  React.useEffect(() => {
    new Promise(async resolve => {
      const dogsWithImages = await Promise.all(
        Object.entries(dogs).map(async ([dogID, { imageUrl }]) => {
          const image = await preloadImage(imageUrl);
          return [dogID, image];
        })
      );

      const updatedDogs = dogsWithImages.reduce(
        (accumulatedDogs, [dogID, image]) => {
          return {
            ...accumulatedDogs,
            [dogID]: { ...dogs[dogID], image: image }
          };
        },
        {}
      );
      resolve(updatedDogs);
    }).then(updatedDogs => {
      setState(previousState => {
        return { ...previousState, dogs: updatedDogs, isLoading: false };
      });
    });
  }, []);

  return (
    <>
      {isLoading ? (
        <CircularProgress
          className="spinner"
          variant="indeterminate"
          style={{ opacity: 0.1 }}
        />
      ) : (
        <AnimatedSquare
          key={currentDogID}
          imageUrl={dogs[currentDogID].image.src}
          onFinish={() =>
            setState(previousState => ({
              ...previousState,
              currentDogID: mod(currentDogID + 1, Object.keys(dogs).length)
            }))
          }
        />
      )}
    </>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
