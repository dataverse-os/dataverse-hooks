import React, { ReactNode, useMemo, useReducer } from "react";

import { DataverseConnector } from "@dataverse/dataverse-connector";
import { createConfig, WagmiConfig } from "wagmi";

import { initialState, reducer } from "./state";
import { DataverseContext } from "./useStore";
import { dataverseWalletConnector, publicClient } from "./wagmi";

export const DataverseContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const dataverseConnector = useMemo(() => new DataverseConnector(), []);

  const config = useMemo(
    () =>
      createConfig({
        autoConnect: false,
        connectors: [dataverseWalletConnector],
        publicClient,
      }),
    [],
  );

  return (
    <DataverseContext.Provider value={{ dataverseConnector, state, dispatch }}>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </DataverseContext.Provider>
  );
};
