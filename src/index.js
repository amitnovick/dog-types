import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Flipper, Flipped } from "react-flip-toolkit";
import { CircularProgress } from "@material-ui/core";
import { ReactComponent as DeckCheckmark } from "./deck-checkmark.svg";
import { ReactComponent as DeckWrong } from "./deck-wrong.svg";
import { ReactComponent as DeckAll } from "./deck-all.svg";

import "./styles.scss";
import useSnapshot from "./useSnapshot";

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

const Page = ({ imageUrl, choices, onFinish, onChoose }) => {
  const successDeckRef = React.useRef();
  const failDeckRef = React.useRef();
  const cardBackgroundRef = React.useRef();
  const [cardState, setCardState] = useState("initial"); // 'initial' -> [ 'success' | 'fail' ]
  const [{ top, left, width, height }, setProperties] = useState({});
  const UseLayout = useSnapshot({
    getSnapshot: (prevProps, prevState) => {
      if (
        (cardState === "fail" || cardState === "success") &&
        prevProps.cardState === "initial"
      ) {
        // First
        const {
          top,
          left,
          width,
          height
        } = cardBackgroundRef.current.getBoundingClientRect();
        const first = { top, left, width, height };
        return first;
      }
    },
    layoutEffect: first => {
      if (!first) {
        return;
      } else {
        const didSucceed = cardState === "success";
        const destinationDeckRef = didSucceed ? successDeckRef : failDeckRef;

        // Last
        const {
          top,
          left,
          width,
          height
        } = destinationDeckRef.current.getBoundingClientRect();
        const last = {
          top: top + 4,
          left: left + width / 4,
          width: width / 2,
          height: height - 8
        };

        console.log("first:", first);
        console.log("last:", last);
        console.log(
          "success:",
          destinationDeckRef.current.getBoundingClientRect()
        );

        // Inverse
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        const deltaW = first.width / last.width;
        const deltaH = first.height / last.height;

        // Play
        const animation = cardBackgroundRef.current.animate(
          [
            {
              transformOrigin: "top left",
              transform: `
            translate(${deltaX}px, ${deltaY}px)
            scale(${deltaW}, ${deltaH})
          `
            },
            {
              transformOrigin: "top left",
              transform: "none"
            }
          ],
          {
            duration: 600,
            easing: "ease-in-out",
            fill: "both"
          }
        );
        animation.onfinish = () => {
          onFinish();
        };
      }
    }
  });
  const moveSquare = choice => {
    if (cardState === "initial") {
      const didSucceed = onChoose(choice);
      const updatedCardState = didSucceed ? "success" : "fail";
      const destinationDeckRef = didSucceed ? successDeckRef : failDeckRef;
      setCardState(updatedCardState);
      const {
        top,
        left,
        width,
        height
      } = destinationDeckRef.current.getBoundingClientRect();
      setProperties({
        top: top + 4,
        left: left + width / 4,
        width: width / 2,
        height: height - 8
      });
    }
  };

  console.log("top:", top);

  return (
    <>
      <div className="top-bar-container">
        <div className="top-bar">
          <div>
            <DeckAll className="all" />
          </div>
          <div ref={failDeckRef}>
            <DeckWrong
              className="fail"
              data-state={cardState === "fail" ? "consuming" : undefined}
            />
          </div>
          <div ref={successDeckRef}>
            <DeckCheckmark
              className="success"
              data-state={cardState === "success" ? "consuming" : undefined}
            />
          </div>
        </div>
      </div>
      <div className="flip-content-wrapper">
        <div className="card" data-state={cardState}>
          <UseLayout cardState={cardState}>
            <div
              className="card-background"
              ref={cardBackgroundRef}
              data-state={cardState}
              style={
                ["success", "fail"].includes(cardState)
                  ? {
                      top,
                      left,
                      width,
                      height
                    }
                  : {}
              }
            />
          </UseLayout>

          <img
            src={imageUrl}
            alt="dog"
            className="img"
            data-state={
              cardState === "success" || cardState === "fail"
                ? "moving"
                : undefined
            }
          />
          <ol
            className="choices"
            data-state={
              ["success", "fail"].includes(cardState) ? "moving" : "initial"
            }
          >
            {choices.map(choice => (
              <li onClick={() => moveSquare(choice)} key={choice}>
                {choice}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
};

const App = () => {
  const [{ currentDogID, dogs, isLoading }, setState] = React.useState({
    currentDogID: 0,
    dogs: {
      0: {
        imageUrl: "https://images.dog.ceo/breeds/malinois/n02105162_2079.jpg",
        breed: "malinois",
        cardState: "initial",
        choices: ["malinois", "pinscher", "golden-retriever"]
      },
      1: {
        imageUrl:
          "https://images.dog.ceo/breeds/pointer-german/n02100236_5628.jpg",
        breed: "pointer-german",
        cardState: "initial",
        choices: ["hound-british", "pointer-german", "golden-retriever"]
      },
      2: {
        imageUrl:
          "https://images.dog.ceo/breeds/hound-afghan/n02088094_10263.jpg",
        breed: "hound-afghan",
        cardState: "initial",
        choices: ["pointer-german", "hound-british", "hound-afghan"]
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
        <Page
          key={currentDogID}
          imageUrl={dogs[currentDogID].image.src}
          choices={dogs[currentDogID].choices}
          onChoose={chosenBreed => {
            const outcome = chosenBreed === dogs[currentDogID].breed;
            setState(previousState => ({
              ...previousState,
              cardState: outcome
            }));

            return outcome;
          }}
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
