import React, { ReactNode, useMemo, useReducer } from "react";
import { createConfig, WagmiConfig } from "wagmi";
import { initialState, reducer } from "./state";
import { DataverseContext } from "./useStore";
import { publicClient } from "./wagmi";

export const DataverseContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const config = useMemo(
    () =>
      createConfig({
        autoConnect: true,
        connectors: [state.dataverseConnector],
        publicClient,
      }),
    [state.dataverseConnector],
  );

  return React.createElement(WagmiConfig, {
    children: React.createElement(DataverseContext.Provider, {
      children,
      value: {
        state,
        dispatch,
      },
    }),
    config: {
      config,
    },
  });
};
