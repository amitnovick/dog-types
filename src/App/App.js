import React from "react";
import { CircularProgress } from "@material-ui/core";
import { StylesProvider } from "@material-ui/core/styles";
import { useMachine } from "@xstate/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";

import useTimer from "./ProgressBar/useTimer";
import machine from "./machine";
import { ReactComponent as DeckAll } from "./deck-all.svg";
import { ReactComponent as DeckSuccess } from "./deck-checkmark.svg";
import "./styles.scss";
import ProgressBar from "./ProgressBar/ProgressBar";
import usePrevious from "../utils/usePrevious";
import TimerContext from "./ProgressBar/TimerContext";

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

const formatDogTypeText = dogType => {
  const names = dogType.split("-");
  const capitalizedNames = names.map(
    name => name.slice(0, 1).toUpperCase() + name.slice(1)
  );
  const reversedOrderCapitalizedNames = capitalizedNames.reverse();
  const dogTypeText = reversedOrderCapitalizedNames.join(" ");
  return dogTypeText;
};

const TIMER_DURATION_MS = 5000;

/* dogImageUrl: string, e.g. 'https://images.dog.ceo/breeds/stbernard/n02109525_8312.jpg' */
const getBreedFromDogImageUrl = dogImageUrl => {
  return dogImageUrl.match(/breeds\/(.*?)\//)[1];
};

const pickNrandomlyFromArray = (n, arr) => {
  return arr.sort(() => 0.5 - Math.random()).slice(0, n);
};

const generateUniqueId = () => {
  // uuidv4
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const App = React.memo(({ startTimer, cancelTimer, hasTimedOut }) => {
  const contextRef = React.useRef({
    cardsCount: 0,
    currentCardId: null,
    successCardsCount: 0,
    dog: {
      image: null,
      breed: null
    },
    choices: null,
    breeds: null,
    isLoading: true,
    isChoiceCorrect: null,
    chosenChoice: null
  });

  const setStateSync = updateFunction => {
    contextRef.current = updateFunction(contextRef.current);
  };

  const {
    current: {
      cardsCount,
      currentCardId,
      successCardsCount,
      dog,
      choices,
      isChoiceCorrect,
      chosenChoice
    }
  } = contextRef;

  const cardRef = React.useRef();
  const imageRef = React.useRef();
  const choiceRefs = [React.useRef(), React.useRef(), React.useRef()];

  const { breed: answerChoice } = dog;

  const onChoose = chosenBreed => {
    const isChoiceCorrect = chosenBreed === dog.breed;

    return isChoiceCorrect;
  };

  const onReveal = isChoiceCorrect => {
    setStateSync(previousState => ({
      ...previousState,
      successCardsCount: isChoiceCorrect
        ? previousState.successCardsCount + 1
        : previousState.successCardsCount
    }));
  };

  const [{ value: cardState, matches }, send] = useMachine(
    machine.withContext(machine.initialState.context),
    {
      devTools: true,
      actions: {
        updateBreeds: (_, event) => {
          const { data: breeds } = event;
          setStateSync(previousState => ({
            ...previousState,
            breeds: breeds
          }));
        },
        startTimer: () => {
          startTimer();
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

          animation.onfinish = () => send("FINISHED_EXIT_ANIMATION");
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
          cancelTimer();
          const isChoiceCorrect = onChoose(choice);
          setStateSync(previousState => ({
            ...previousState,
            isChoiceCorrect: isChoiceCorrect,
            chosenChoice: choice
          }));
        },
        onReveal: () => onReveal(isChoiceCorrect)
      },
      services: {
        fetchBreeds: () => {
          return fetchBreeds();
        },
        prepareCard: () => {
          return createNewCard().then(newCardData => {
            setStateSync(previousState => ({
              ...previousState,
              ...newCardData,
              cardsCount: previousState.cardsCount + 1
            }));
          });
        }
      }
    }
  );

  const previousMatches = usePrevious(matches);

  const fetchBreeds = async () => {
    const ALL_BREEDS_ENDPOINT_URL = " https://dog.ceo/api/breeds/list/all";
    const {
      data: { message: breedsObject }
    } = await Axios.get(ALL_BREEDS_ENDPOINT_URL);
    const breeds = Object.entries(breedsObject).reduce(
      (accumulated, [archBreed, subBreeds]) => {
        return [
          ...accumulated,
          archBreed,
          ...subBreeds.map(subBreed => archBreed + "-" + subBreed)
        ];
      },
      []
    );
    return breeds;
  };

  const createNewCard = async () => {
    const {
      current: { breeds }
    } = contextRef;

    const RANDOM_DOG_ENDPOINT_URL = "https://dog.ceo/api/breeds/image/random";
    const {
      data: { message: dogImageUrl }
    } = await Axios.get(RANDOM_DOG_ENDPOINT_URL);
    const breed = getBreedFromDogImageUrl(dogImageUrl);
    const image = await preloadImage(dogImageUrl);
    const dog = { image, breed };
    const arrayWithoutSpecificBreed = breeds.filter(b => b !== breed);
    const twoRandomChoices = pickNrandomlyFromArray(
      2,
      arrayWithoutSpecificBreed
    );
    const choices = [...twoRandomChoices, breed];

    shuffle(choices);
    const cardId = generateUniqueId();

    return {
      currentCardId: cardId,
      dog: dog,
      choices: choices
    };
  };

  React.useLayoutEffect(() => {
    if (matches("choosing.entering") && !previousMatches("choosing.entering")) {
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
    }
  }, [matches("choosing.entering")]);

  const isLoading = matches("fetchingBreeds") || matches("preparingCard");

  React.useEffect(() => {
    if (hasTimedOut) {
      send("CHOICE_WINDOW_TIMEOUT");
    }
  }, [hasTimedOut]);

  return (
    <StylesProvider injectFirst>
      <div className="screen">
        <div className="top-bar">
          <div className="top-bar-center-area">
            <DeckSuccess className="deck-success" />
            <span className="record-text">
              {successCardsCount} from {cardsCount}
            </span>
            <button className="deck-button">
              <DeckAll className="deck-all" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <CircularProgress
            className="spinner"
            variant="indeterminate"
            style={{ opacity: 0.1 }}
          />
        ) : (
          <div className="main-section" key={currentCardId}>
            <div
              className="progress-bar-wrapper"
              data-hidden={
                matches("choosing.entering") || matches("exiting")
                  ? ""
                  : undefined
              }
            >
              {matches("choosing.entering") ? null : (
                <ProgressBar duration={TIMER_DURATION_MS} />
              )}
            </div>
            <div
              className="card"
              ref={cardRef}
              data-state={cardState}
              style={{}}
            >
              {cardState === "revealingAnswer" ? (
                <button className="next-button" onClick={() => send("NEXT")}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              ) : (
                undefined
              )}
              <img
                src={dog.image.src}
                alt="dog"
                className="img"
                ref={imageRef}
                data-state={cardState === "exiting" ? "moving" : undefined}
              />
              <h2 className="question">Which dog type is it?</h2>
              <ol
                className="choices"
                data-state={cardState === "exiting" ? "moving" : "idle"}
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
                      ["revealingAnswer", "exiting"].includes(cardState) &&
                      choice === answerChoice
                        ? "green"
                        : ["chosen", "revealingAnswer", "exiting"].includes(
                            cardState
                          ) && choice === chosenChoice
                        ? "primary"
                        : matches("choosing")
                        ? "hoverable"
                        : undefined
                    }
                    data-pointer={matches("choosing") ? "" : undefined}
                  >
                    <div
                      className="choice-alphabet"
                      data-color={
                        /* Watch out, order matters here */
                        ["revealingAnswer", "exiting"].includes(cardState) &&
                        choice === answerChoice
                          ? "black"
                          : ["chosen", "revealingAnswer", "exiting"].includes(
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
                        ["revealingAnswer", "exiting"].includes(cardState) &&
                        choice === answerChoice
                          ? "white"
                          : undefined
                      }
                    >
                      {formatDogTypeText(choice)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
      <footer className="footer">
        <p>
          Made by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/amitnovick"
          >
            Amit Novick
          </a>
        </p>
        <p>
          Attribution: stack of paper, Created by Ale Estrada from the Noun
          Project (CCBY)
        </p>
        <p>
          Attribution: checkmark, Created by arif fajar yulianto, ID from the
          Noun Project (CCBY)
        </p>
      </footer>
    </StylesProvider>
  );
});

const TimerWrapper = () => {
  const { timer, startTimer, cancelTimer } = useTimer({
    duration: TIMER_DURATION_MS
  });

  return (
    <TimerContext.Provider value={timer}>
      <App
        startTimer={startTimer}
        cancelTimer={cancelTimer}
        hasTimedOut={timer === 0}
      />
    </TimerContext.Provider>
  );
};

export default TimerWrapper;
