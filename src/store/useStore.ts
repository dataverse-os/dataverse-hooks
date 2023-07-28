import { createContext, useContext } from "react";
import { DATAVERSE_CONTEXT_PROVIDER_ERROR } from "../errors";
import { DataverseContextType } from "../types";
import { initialState } from "./state";

export const DataverseContext = createContext<DataverseContextType>({
  state: initialState,
  dispatch: () => {},
});

export const useStore = () => {
  const context = useContext(DataverseContext);
  if (context === undefined) {
    throw DATAVERSE_CONTEXT_PROVIDER_ERROR;
  }

  const { state } = context;

  return {
    state,
  };
};
