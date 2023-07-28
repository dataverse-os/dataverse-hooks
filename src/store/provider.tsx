import React, { ReactNode, useMemo, useReducer } from "react";
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
    <DataverseContext.Provider value={{ state, dispatch }}>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </DataverseContext.Provider>
  );
};
