import { createContext, useContext } from "react";
import { DataverseContextType } from "../types";
import { initialState } from "./state";

export const DataverseContext =
  createContext<DataverseContextType>(initialState);

export const useStore = () => {
  const context = useContext(DataverseContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a DataverseHooksProvider");
  }
  return context;
};
