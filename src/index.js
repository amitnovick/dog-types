import React from "react";
import ReactDOM from "react-dom";
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

const getProperties = element => {
  const { top, left, width, height } = element.getBoundingClientRect();
  const properties = { top, left, width, height };
  return properties;
};

const getDeltas = ({ first, last }) => {
  const deltaX = first.left - last.left;
  const deltaY = first.top - last.top;
  const deltaW = first.width / last.width;
  const deltaH = first.height / last.height;

  return { deltaX, deltaY, deltaW, deltaH };
};

const indexToAlphabet = {
  0: "A",
  1: "B",
  2: "C"
};

const Page = ({ imageUrl, choices, onFinish, onChoose }) => {
  const successDeckRef = React.useRef();
  const failDeckRef = React.useRef();
  const cardBackgroundRef = React.useRef();
  const imageRef = React.useRef();
  const [
    { cardState, cardBackgroundProperties, imageProperties },
    setState
  ] = React.useState({
    cardState: "initial", // 'initial' -> [ 'success' | 'fail' ]
    cardBackgroundProperties: {},
    imageProperties: {}
  });

  const UseLayout = useSnapshot({
    getSnapshot: (prevProps, prevState) => {
      if (
        (cardState === "fail" || cardState === "success") &&
        prevProps.cardState === "initial"
      ) {
        // First
        const firstCardBackground = getProperties(cardBackgroundRef.current);
        const firstImage = getProperties(imageRef.current);
        return { firstCardBackground, firstImage };
      }
    },
    layoutEffect: ({ firstCardBackground, firstImage }) => {
      if (!firstCardBackground || !firstImage) {
        return;
      } else {
        // Last
        const lastCardBackground = cardBackgroundProperties;

        const lastImage = imageProperties;

        // Inverse
        const deltasCardBackground = getDeltas({
          first: firstCardBackground,
          last: lastCardBackground
        });

        const deltasImage = getDeltas({ first: firstImage, last: lastImage });

        // Play
        const cardBackgroundAnimation = cardBackgroundRef.current.animate(
          [
            {
              transformOrigin: "top left",
              transform: `
            translate(${deltasCardBackground.deltaX}px, ${
                deltasCardBackground.deltaY
              }px)
            
          `,
              opacity: 1,
              width: `${firstCardBackground.width}px`,
              height: `${firstCardBackground.height}px`
            },
            {
              transformOrigin: "top left",
              transform: "none",
              opacity: 0,
              width: `${lastCardBackground.width}px`,
              height: `${lastCardBackground.height}px`
            }
          ],
          {
            duration: 600,
            easing: "ease-in-out",
            fill: "both"
          }
        );

        imageRef.current.animate(
          [
            {
              transformOrigin: "top left",
              transform: `
            translate(${deltasImage.deltaX}px, ${deltasImage.deltaY}px)
              scale(${deltasImage.deltaW}, ${deltasImage.deltaH})
          `,
              opacity: 1
            },
            {
              transformOrigin: "top left",
              transform: "none",
              opacity: 0
            }
          ],
          {
            duration: 600,
            easing: "ease-in-out",
            fill: "both"
          }
        );

        cardBackgroundAnimation.onfinish = () => {
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
      setState(previousState => ({
        ...previousState,
        cardState: updatedCardState
      }));
      const {
        top: cardBackgroundTop,
        left: cardBackgroundLeft,
        width: cardBackgroundWidth,
        height: cardBackgroundHeight
      } = destinationDeckRef.current.getBoundingClientRect();
      const updatedCardBackgroundProperties = {
        top: cardBackgroundTop + 4,
        left: cardBackgroundLeft + cardBackgroundWidth / 4,
        width: cardBackgroundWidth / 2,
        height: cardBackgroundHeight - 8
      };
      setState(previousState => ({
        ...previousState,
        cardBackgroundProperties: updatedCardBackgroundProperties
      }));

      const updatedImageProperties = {
        top: updatedCardBackgroundProperties.top + 4,
        left: updatedCardBackgroundProperties.left + 4,
        width: updatedCardBackgroundProperties.width - 10,
        height: updatedCardBackgroundProperties.height / 2
      };
      setState(previousState => ({
        ...previousState,
        imageProperties: updatedImageProperties
      }));
    }
  };

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
                  ? cardBackgroundProperties
                  : {}
              }
            />
          </UseLayout>

          <img
            src={imageUrl}
            alt="dog"
            className="img"
            ref={imageRef}
            style={
              ["success", "fail"].includes(cardState) ? imageProperties : {}
            }
            data-state={
              cardState === "success" || cardState === "fail"
                ? "moving"
                : undefined
            }
          />
          <h2>Which dog breed is it?</h2>
          <ol
            className="choices"
            data-state={
              ["success", "fail"].includes(cardState) ? "moving" : "initial"
            }
          >
            {choices.map((choice, index) => (
              <li
                onClick={() => moveSquare(choice)}
                key={choice}
                className="choice-li"
              >
                <div className="choice-index-circle">
                  {`${indexToAlphabet[index]}:`}
                </div>
                <span className="choice-text">{choice}</span>
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
