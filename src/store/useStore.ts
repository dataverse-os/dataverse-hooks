import {
  Chain,
  DataverseConnector,
  WALLET,
} from "@dataverse/dataverse-connector";
import { createContext, useCallback, useContext } from "react";
import { DATAVERSE_CONTEXT_PROVIDER_ERROR } from "../errors";
import {
  ActionType,
  CreateStreamResult,
  DataverseContextType,
  LoadStreamsByResult,
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
    throw DATAVERSE_CONTEXT_PROVIDER_ERROR;
  }

  const { state, dispatch } = context;

  const actionInitConnector = useCallback(
    (dataverseConnector: DataverseConnector) => {
      dispatch({
        type: ActionType.InitConnector,
        payload: dataverseConnector,
      });
    },
    [dispatch],
  );

  const actionConnectWallet = useCallback(
    (connectResult: { address: string; chain: Chain; wallet: WALLET }) => {
      dispatch({
        type: ActionType.ConnectWallet,
        payload: connectResult,
      });
    },
    [dispatch],
  );

  const actionCreateCapability = useCallback(
    (currentPkh: string) => {
      dispatch({
        type: ActionType.CreateCapability,
        payload: currentPkh,
      });
    },
    [dispatch],
  );

  const actionCreateStream = useCallback(
    (createdStream: CreateStreamResult) => {
      dispatch({
        type: ActionType.CreateStream,
        payload: createdStream,
      });
    },
    [dispatch],
  );

  const actionUpdateStream = useCallback(
    (
      updatedStream:
        | MonetizeStreamResult
        | UnlockStreamResult
        | (UpdateStreamResult & { streamId: string }),
    ) => {
      dispatch({
        type: ActionType.UpdateStream,
        payload: updatedStream,
      });
    },
    [dispatch],
  );

  const actionLoadStreams = useCallback(
    (loadedStream: LoadStreamsResult | LoadStreamsByResult) => {
      dispatch({
        type: ActionType.LoadStreams,
        payload: loadedStream,
      });
    },
    [dispatch],
  );

  return {
    state,
    actionInitConnector,
    actionConnectWallet,
    actionCreateCapability,
    actionCreateStream,
    actionUpdateStream,
    actionLoadStreams,
  };
};
