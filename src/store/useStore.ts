import {
  Chain,
  DataverseConnector,
  WALLET,
} from "@dataverse/dataverse-connector";
import { createContext, useCallback, useContext } from "react";
import {
  ActionType,
  CreateStreamResult,
  DataverseContextType,
  LoadStreamsResult,
  MonetizeStreamResult,
  UnlockStreamResult,
  UpdateStreamResult,
} from "../types";
import { initialState } from "./state";

export const DataverseContext = createContext<DataverseContextType>({
  state: initialState,
  dispatch: () => {},
});

export const useStore = () => {
  const context = useContext(DataverseContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a DataverseHooksProvider");
  }

  const { state, dispatch } = context;

  const updateDatavereConnector = useCallback(
    (dataverseConnector: DataverseConnector) => {
      dispatch({
        type: ActionType.Init,
        payload: dataverseConnector,
      });
    },
    [dispatch],
  );

  const updateWalletInfo = useCallback(
    (connectResult: { address: string; chain: Chain; wallet: WALLET }) => {
      dispatch({
        type: ActionType.ConnectWallet,
        payload: connectResult,
      });
    },
    [dispatch],
  );

  const updatePkh = useCallback(
    (currentPkh: string) => {
      dispatch({
        type: ActionType.CreateCapability,
        payload: currentPkh,
      });
    },
    [dispatch],
  );

  const updateStreamsMap = useCallback(
    ({
      type,
      payload,
    }: {
      type:
        | ActionType.LoadStream
        | ActionType.CreateStream
        | ActionType.UpdateStream;
      payload:
        | LoadStreamsResult
        | CreateStreamResult
        | MonetizeStreamResult
        | UnlockStreamResult
        | UpdateStreamResult;
    }) => {
      dispatch({
        type,
        payload,
      });
    },
    [dispatch],
  );

  return {
    state,
    updateDatavereConnector,
    updateWalletInfo,
    updatePkh,
    updateStreamsMap,
  };
};
