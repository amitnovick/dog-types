import { Machine } from "xstate";

const machine = Machine({
  initial: "fetchingBreeds",
  id: "card",
  states: {
    fetchingBreeds: {
      invoke: {
        src: "fetchBreeds",
        onDone: {
          target: "preparingCard",
          actions: "updateBreeds"
        }
      }
    },
    preparingCard: {
      invoke: {
        src: "prepareCard",
        onDone: "choosing"
      }
    },
    choosing: {
      initial: "entering",
      states: {
        entering: {
          on: {
            FINISHED_ENTRANCE_ANIMATION: "stationary"
          }
        },
        stationary: {
          entry: "startTimer",
          on: {
            CHOICE_WINDOW_TIMEOUT: "#card.revealingAnswer"
          }
        }
      },
      on: {
        CLICKED_CHOICE: { target: "chosen", actions: "updateChoice" }
      }
    },
    chosen: {
      after: {
        500: "revealingAnswer"
      }
    },
    revealingAnswer: {
      entry: "onReveal",
      on: { NEXT: "exiting" }
    },
    exiting: {
      on: {
        FINISHED_EXIT_ANIMATION: "preparingCard"
      }
    }
  }
});

export default machine;
