import { Chain, WALLET } from "@dataverse/dataverse-connector";
import { useCallback, useContext } from "react";
import { DATAVERSE_CONTEXT_PROVIDER_ERROR } from "../errors";
import {
  ActionType,
  CreateStreamResult,
  LoadStreamsByResult,
  LoadStreamsResult,
  MonetizeStreamResult,
  UnlockStreamResult,
  UpdateStreamResult,
} from "../types";
import { DataverseContext } from "./useStore";

export const useAction = () => {
  const context = useContext(DataverseContext);
  if (context === undefined) {
    throw DATAVERSE_CONTEXT_PROVIDER_ERROR;
  }

  const { dispatch } = context;

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
    (loadedStreams: LoadStreamsResult | LoadStreamsByResult) => {
      dispatch({
        type: ActionType.LoadStreams,
        payload: loadedStreams,
      });
    },
    [dispatch],
  );

  const actionLoadProfileIds = useCallback(
    (profileIds: string[]) => {
      dispatch({
        type: ActionType.LoadProfileIds,
        payload: profileIds,
      });
    },
    [dispatch],
  );

  const actionCreateProfile = useCallback(
    (profileId: string) => {
      dispatch({
        type: ActionType.CreateProfileId,
        payload: profileId,
      });
    },
    [dispatch],
  );

  return {
    actionConnectWallet,
    actionCreateCapability,
    actionCreateStream,
    actionUpdateStream,
    actionLoadStreams,
    actionLoadProfileIds,
    actionCreateProfile,
  };
};
