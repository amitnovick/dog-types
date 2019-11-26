import React from "react";
import { CircularProgress } from "@material-ui/core";
import { StylesProvider } from "@material-ui/core/styles";
import { useMachine } from "@xstate/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";

import useTimer from "../ProgressBar/useTimer";
import TimerContext from "../ProgressBar/TimerContext";
import ProgressBarContainer from "../ProgressBar/ProgressBarContainer";
import machine from "./machine";
import { ReactComponent as DeckAll } from "./deck-all.svg";
import { ReactComponent as DeckSuccess } from "./deck-checkmark.svg";
import "./styles.scss";

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

const Page = React.memo(
  ({
    imageUrl,
    choices,
    onFinish,
    answerChoice,
    onChoose,
    onReveal,
    startTimer,
    cancelTimer,
    hasTimedOut
  }) => {
    const cardRef = React.useRef();
    const imageRef = React.useRef();
    const choiceRefs = [React.useRef(), React.useRef(), React.useRef()];
    const [{ isChoiceCorrect, chosenChoice }, setState] = React.useState({
      isChoiceCorrect: null,
      chosenChoice: null
    });
    const [{ value: cardState, matches }, send] = useMachine(
      machine.withContext(machine.initialState.context),
      {
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
              isChoiceCorrect: isChoiceCorrect,
              chosenChoice: choice
            }));
          },
          onReveal: () => onReveal(isChoiceCorrect),
          onFinish: onFinish
        }
      }
    );

    React.useEffect(() => {
      if (hasTimedOut) {
        send("CHOICE_WINDOW_TIMEOUT");
      }
    }, [hasTimedOut]);

    return (
      <div className="main-section">
        <div
          className="progress-bar-wrapper"
          data-hidden={
            matches("choosing.entering") || matches("exiting") ? "" : undefined
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
  var currentIndex = array.length,
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

const App = () => {
  const [
    {
      cardsCount,
      currentCardId,
      successCardsCount,
      dog,
      breeds,
      choices,
      isLoading
    },
    setState
  ] = React.useState({
    cardsCount: 0,
    currentCardId: null,
    successCardsCount: 0,
    dog: {
      image: null,
      breed: null
    },
    choices: null,
    breeds: null,
    isLoading: true
  });

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

  const createNewCard = async breeds => {
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

  React.useEffect(() => {
    setState(previousState => {
      return {
        ...previousState,
        isLoading: true
      };
    });

    fetchBreeds().then(breeds => {
      createNewCard(breeds).then(newCardData => {
        setState(previousState => ({
          ...previousState,
          ...newCardData,
          breeds: breeds,
          cardsCount: previousState.cardsCount + 1
        }));

        setState(previousState => {
          return {
            ...previousState,
            isLoading: false
          };
        });
      });
    });
  }, []);

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
          <PageContainer
            key={currentCardId}
            imageUrl={dog.image.src}
            choices={choices}
            answerChoice={dog.breed}
            onChoose={chosenBreed => {
              const isChoiceCorrect = chosenBreed === dog.breed;

              return isChoiceCorrect;
            }}
            onReveal={isChoiceCorrect => {
              setState(previousState => ({
                ...previousState,
                successCardsCount: isChoiceCorrect
                  ? previousState.successCardsCount + 1
                  : previousState.successCardsCount
              }));
            }}
            onFinish={() => {
              setState(previousState => ({
                ...previousState,
                isLoading: true
              }));
              createNewCard(breeds).then(newCardData => {
                setState(previousState => ({
                  ...previousState,
                  ...newCardData,
                  cardsCount: previousState.cardsCount + 1
                }));
                setState(previousState => ({
                  ...previousState,
                  isLoading: false
                }));
              });
            }}
          />
        )}
      </div>
    </StylesProvider>
  );
};

export default App;
