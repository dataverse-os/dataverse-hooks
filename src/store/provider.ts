import React, { ReactNode, useReducer } from "react";
import { initialState, reducer } from "./state";
import { DataverseContext } from "./useStore";

export const DataverseContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return React.createElement(DataverseContext.Provider, {
    children,
    value: {
      state,
      dispatch
    },
  });
};
