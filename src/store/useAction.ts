import { Chain, WALLET } from "@dataverse/dataverse-connector";
import { useCallback, useContext } from "react";
import { DATAVERSE_CONTEXT_PROVIDER_ERROR } from "../errors";
import {
  ActionType,
  CreateStreamResult,
  LoadStreamsByResult,
  LoadStreamsResult,
  MonetizeStreamResult,
  StreamObject,
  UnlockStreamResult,
  UpdateStreamResult,
} from "../types";
import { DataverseContext } from "./useStore";
import { Folders } from "@dataverse/js-dataverse";

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

  const actionSetFolders = useCallback(
    (folders: Folders) => {
      dispatch({
        type: ActionType.SetFolders,
        payload: folders,
      });
    },
    [dispatch],
  );

  const actionSetLocalFolderIdToRemoteFolderId = useCallback(
    (localFolderIdToRemoteFolderId: Record<string, string>) => {
      dispatch({
        type: ActionType.SetLocalFolderIdToRemoteFolderId,
        payload: localFolderIdToRemoteFolderId,
      });
    },
    [dispatch],
  );

  const actionSetLocalFolderIdToRemoteFolderIdMap = useCallback(
    (
      localFolderIdToRemoteFolderIdMap: Record<string, Record<string, string>>,
    ) => {
      dispatch({
        type: ActionType.SetLocalFolderIdToRemoteFolderIdMap,
        payload: localFolderIdToRemoteFolderIdMap,
      });
    },
    [dispatch],
  );

  const actionSetProfileStream = useCallback(
    (profileStream: StreamObject) => {
      dispatch({
        type: ActionType.SetProfileStream,
        payload: profileStream,
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
    actionSetFolders,
    actionSetLocalFolderIdToRemoteFolderId,
    actionSetLocalFolderIdToRemoteFolderIdMap,
    actionSetProfileStream,
  };
};
