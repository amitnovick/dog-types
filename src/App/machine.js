import { Machine } from "xstate";

const machine = Machine({
  initial: "choosing",
  id: "card",
  states: {
    choosing: {
      initial: "entering",
      states: {
        entering: {
          entry: "animateCardSlideAndFadeIn",
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
      entry: ["onReveal", "animateAnswerListItem"],
      on: { NEXT: "exiting" }
    },
    exiting: {
      entry: "animateCardSlideAndFadeOut",
      on: {
        FINISHED_EXIT_ANIMATION: "preparingCard"
      }
    },
    preparingCard: {
      invoke: {
        src: "prepareCard",
        onDone: "choosing"
      }
    }
  }
});

export default machine;
