import React from "react";
import ReactDOM from "react-dom";
import { CircularProgress } from "@material-ui/core";
import { StylesProvider } from "@material-ui/core/styles";
import { useMachine } from "@xstate/react";
import "normalize.css";

import "./globalStyles.scss";
import "./styles.scss";
import useTimer from "./ProgressBar/useTimer";
import TimerContext from "./ProgressBar/TimerContext";
import ProgressBarContainer from "./ProgressBar/ProgressBarContainer";
import machine from "./machine";
import { ReactComponent as DeckAll } from "./deck-all.svg";
import { ReactComponent as DeckSuccess } from "./deck-checkmark.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

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
    const cardRef = React.useRef();
    const imageRef = React.useRef();
    const choiceRefs = [React.useRef(), React.useRef(), React.useRef()];

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
        animateCardSlideAndFadeOut: () => {
          const animation = cardRef.current.animate(
            [
              {
                transform: "none",
                opacity: 1
              },
              {
                transform: "translateX(60px)",
                opacity: 0
              }
            ],
            {
              duration: 1000,
              easing: "ease-in-out",
              fill: "both"
            }
          );

          animation.onfinish = onFinish;
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
        updateChoice: (_, { choice }) => {
          const isChoiceCorrect = onChoose(choice);
          cancelTimer();
          setState(previousState => ({
            ...previousState,
            chosenChoice: choice,
            isChoiceCorrect: isChoiceCorrect
          }));
        },
        onFinish: onFinish
      }
    });
    const [{ chosenChoice }, setState] = React.useState({
      chosenChoice: null
    });

    React.useEffect(() => {
      if (hasTimedOut) {
        send("CHOICE_WINDOW_TIMEOUT");
      }
    }, [hasTimedOut]);

    console.log("cardState:", cardState);

    return (
      <div className="screen">
        <div className="top-bar">
          <div className="top-bar-center-area">
            <DeckSuccess className="deck-success" />
            <span className="record-text">7 of 15</span>
            <button className="deck-button">
              <DeckAll className="deck-all" />
            </button>
          </div>
        </div>
        <div className="main-section">
          <div
            className="progress-bar-wrapper"
            data-hidden={
              ["entering", "moving"].includes(cardState) ? "" : undefined
            }
          >
            <ProgressBarContainer />
          </div>
          <div className="card" ref={cardRef} data-state={cardState} style={{}}>
            {cardState === "revealingAnswer" ? (
              <button className="next-button" onClick={() => send("NEXT")}>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            ) : (
              undefined
            )}
            <img
              src={imageUrl}
              alt="dog"
              className="img"
              ref={imageRef}
              data-state={cardState === "moving" ? "moving" : undefined}
            />
            <h2 className="question">Which dog type is it?</h2>
            <ol
              className="choices"
              data-state={cardState === "moving" ? "moving" : "idle"}
            >
              {choices.map((choice, index) => (
                <li
                  onClick={() => {
                    send("CLICKED_CHOICE", { choice });
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
      </div>
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
