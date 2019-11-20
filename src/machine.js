import { Machine } from "xstate";

const machine = Machine({
  initial: "entering",
  states: {
    entering: {
      on: { FINISHED_ENTRANCE_ANIMATION: "idle" }
    },
    idle: {
      on: { CLICKED_CHOICE: "chosen", CHOICE_WINDOW_TIMEOUT: "revealingAnswer" }
    },
    chosen: {
      on: { CHOICE_DISPLAY_TIMEOUT: "revealingAnswer" }
    },
    revealingAnswer: {
      on: { ANSWER_REVEAL_TIMEOUT: "moving" }
    },
    moving: {}
  }
});

export default machine;
