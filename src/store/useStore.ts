import { createContext, useContext } from "react";
import { DATAVERSE_CONTEXT_PROVIDER_ERROR } from "../errors";
import { DataverseContextType } from "../types";

export const DataverseContext = createContext<DataverseContextType>(
  {} as DataverseContextType,
);

export const useStore = () => {
  const context = useContext(DataverseContext);
  if (context === undefined) {
    throw DATAVERSE_CONTEXT_PROVIDER_ERROR;
  }

  const { dataverseConnector, state } = context;

  return {
    dataverseConnector,
    ...state,
  };
};
