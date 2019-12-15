import React from "react";

function useGetterState(initialValue) {
  const [state, setState] = React.useState(initialValue);
  const ref = React.useRef(state);
  ref.current = state;
  const getter = React.useCallback(() => ref.current, []);
  const setter = React.useCallback(newState => {
    if (typeof newState === "function") {
      return setState(current => {
        ref.current = newState(current);
        return ref.current;
      });
    } else {
      ref.current = newState;
      return setState(newState);
    }
  });

  return [getter, setter];
}

export default useGetterState;
