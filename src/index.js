import React from "react";
import ReactDOM from "react-dom";
import { CircularProgress } from "@material-ui/core";
import { ReactComponent as DeckCheckmark } from "./deck-checkmark.svg";
import { ReactComponent as DeckWrong } from "./deck-wrong.svg";
import { ReactComponent as DeckAll } from "./deck-all.svg";
import { StylesProvider } from "@material-ui/core/styles";
import { useMachine } from "@xstate/react";

import "./styles.scss";
import useSnapshot from "./useSnapshot";
import useTimer from "./ProgressBar/useTimer";
import TimerContext from "./ProgressBar/TimerContext";
import ProgressBarContainer from "./ProgressBar/ProgressBarContainer";
import machine from "./machine";

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

const Page = React.memo(
  ({
    imageUrl,
    choices,
    onFinish,
    answerChoice,
    onChoose,
    startTimer,
    cancelTimer,
    hasTimedOut
  }) => {
    const successDeckRef = React.useRef();
    const failDeckRef = React.useRef();
    const cardRef = React.useRef();
    const cardBackgroundRef = React.useRef();
    const imageRef = React.useRef();
    const choiceRefs = [React.useRef(), React.useRef(), React.useRef()];

    const moveSquare = () => {
      const destinationDeckRef = isChoiceCorrect ? successDeckRef : failDeckRef;
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
    };

    const [{ value: cardState }, send] = useMachine(machine, {
      devTools: true,
      actions: {
        startTimer: startTimer,
        animateCardSlideAndFadeIn: () => {
          const animation = cardRef.current.animate(
            [
              {
                transform: "translateX(-60px)",
                opacity: 0
              },
              {
                transform: "none",
                opacity: 1
              }
            ],
            {
              duration: 1000,
              easing: "ease-in-out",
              fill: "both"
            }
          );

          animation.onfinish = () => send("FINISHED_ENTRANCE_ANIMATION");
        },
        animateAnswerListItem: () => {
          const answerChoiceIndex = choices.findIndex(
            choice => choice === answerChoice
          );
          const answerChoiceRef = choiceRefs[answerChoiceIndex];
          answerChoiceRef.current.animate(
            [
              {
                opacity: 0.2
              },
              {
                opacity: 1
              }
            ],
            {
              duration: 500,
              easing: "ease-in-out",
              fill: "both"
            }
          );
        },
        moveSquare: moveSquare,
        onFinish: onFinish
      }
    });
    const [
      {
        isChoiceCorrect,
        chosenChoice,
        cardBackgroundProperties,
        imageProperties
      },
      setState
    ] = React.useState({
      isChoiceCorrect: null,
      chosenChoice: null,
      cardBackgroundProperties: {},
      imageProperties: {}
    });

    const UseLayout = useSnapshot({
      getSnapshot: (prevProps, prevState) => {
        if (
          cardState === "moving" &&
          prevProps.cardState === "revealingAnswer"
        ) {
          // First
          const firstCardBackground = getProperties(cardBackgroundRef.current);
          const firstImage = getProperties(imageRef.current);
          return { firstCardBackground, firstImage };
        } else {
          return { firstCardBackground: null, firstImage: null };
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

    React.useEffect(() => {
      if (hasTimedOut) {
        send("CHOICE_WINDOW_TIMEOUT");
      }
    }, [hasTimedOut]);

    console.log("cardState:", cardState);

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
                data-state={
                  cardState === "moving" && !isChoiceCorrect
                    ? "consuming"
                    : undefined
                }
              />
            </div>
            <div ref={successDeckRef}>
              <DeckCheckmark
                className="success"
                data-state={
                  cardState === "moving" && isChoiceCorrect
                    ? "consuming"
                    : undefined
                }
              />
            </div>
          </div>
        </div>
        <div className="main-section">
          <div
            className="progress-bar-wrapper"
            data-hidden={cardState === "entering" ? "" : undefined}
          >
            <ProgressBarContainer />
          </div>
          <div className="card" ref={cardRef} data-state={cardState}>
            {cardState === "revealingAnswer" ? (
              <button className="next-button" onClick={() => send("NEXT")}>
                →
              </button>
            ) : (
              undefined
            )}

            <UseLayout cardState={cardState}>
              <div
                className="card-background"
                ref={cardBackgroundRef}
                data-state={cardState}
                style={cardState === "moving" ? cardBackgroundProperties : {}}
              />
            </UseLayout>

            <img
              src={imageUrl}
              alt="dog"
              className="img"
              ref={imageRef}
              style={cardState === "moving" ? imageProperties : {}}
              data-state={cardState === "moving" ? "moving" : undefined}
            />
            <h2
              className="question"
              data-state={cardState === "moving" ? "gone" : undefined}
            >
              Which dog breed is it?
            </h2>
            <ol
              className="choices"
              data-state={cardState === "moving" ? "moving" : "idle"}
            >
              {choices.map((choice, index) => (
                <li
                  onClick={() => {
                    if (cardState === "idle") {
                      const isChoiceCorrect = onChoose(choice);
                      cancelTimer();
                      setState(previousState => ({
                        ...previousState,
                        chosenChoice: choice,
                        isChoiceCorrect: isChoiceCorrect
                      }));
                      send("CLICKED_CHOICE");
                    }
                  }}
                  key={choice}
                  ref={choiceRefs[index]}
                  className="choice-li"
                  data-bg-color={
                    ["revealingAnswer", "moving"].includes(cardState) &&
                    choice === answerChoice
                      ? "green"
                      : ["chosen", "revealingAnswer", "moving"].includes(
                          cardState
                        ) && choice === chosenChoice
                      ? "primary"
                      : ["entering", "idle"].includes(cardState)
                      ? "hoverable"
                      : undefined
                  }
                >
                  <div
                    className="choice-alphabet"
                    data-color={
                      /* Watch out, order matters here */
                      ["revealingAnswer", "moving"].includes(cardState) &&
                      choice === answerChoice
                        ? "black"
                        : ["chosen", "revealingAnswer", "moving"].includes(
                            cardState
                          ) && choice === chosenChoice
                        ? "white"
                        : undefined
                    }
                  >
                    {`${indexToAlphabet[index]}:`}
                  </div>
                  <span
                    className="choice-text"
                    data-color={
                      ["revealingAnswer", "moving"].includes(cardState) &&
                      choice === answerChoice
                        ? "white"
                        : undefined
                    }
                  >
                    {choice}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </>
    );
  }
);

const TIMER_DURATION_MS = 5000;

const PageContainer = props => {
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  const { timer, startTimer, cancelTimer } = useTimer({
    onTimeout: () => setHasTimedOut(true),
    duration: TIMER_DURATION_MS
  });

  return (
    <TimerContext.Provider
      value={{ timer: timer, duration: TIMER_DURATION_MS }}
    >
      <Page
        {...props}
        startTimer={startTimer}
        cancelTimer={cancelTimer}
        hasTimedOut={hasTimedOut}
      />
    </TimerContext.Provider>
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
    <StylesProvider injectFirst>
      {isLoading ? (
        <CircularProgress
          className="spinner"
          variant="indeterminate"
          style={{ opacity: 0.1 }}
        />
      ) : (
        <>
          <PageContainer
            key={currentDogID}
            imageUrl={dogs[currentDogID].image.src}
            choices={dogs[currentDogID].choices}
            answerChoice={dogs[currentDogID].breed}
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
        </>
      )}
    </StylesProvider>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
