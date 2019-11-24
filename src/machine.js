import { Machine } from "xstate";

const machine = Machine({
  initial: "entering",
  context: {
    isChoiceCorrect: null,
    chosenChoice: null
  },
  states: {
    entering: {
      entry: "animateCardSlideAndFadeIn",
      on: {
        FINISHED_ENTRANCE_ANIMATION: "idle",
        CLICKED_CHOICE: { target: "chosen", actions: "updateChoice" }
      }
    },
    idle: {
      entry: "startTimer",
      on: {
        CLICKED_CHOICE: { target: "chosen", actions: "updateChoice" },
        CHOICE_WINDOW_TIMEOUT: "revealingAnswer"
      }
    },
    chosen: {
      after: {
        500: "revealingAnswer"
      }
    },
    revealingAnswer: {
      entry: ["onReveal", "animateAnswerListItem"],
      on: { NEXT: "moving" }
    },
    moving: {
      entry: "animateCardSlideAndFadeOut"
    }
  }
});

export default machine;
