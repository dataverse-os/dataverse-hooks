import {
  Chain,
  MirrorFile,
  StructuredFolder,
  StructuredFolders,
  WALLET,
} from "@dataverse/dataverse-connector";
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

  const actionSetFolders = useCallback(
    (folders: StructuredFolders) => {
      dispatch({
        type: ActionType.SetFolders,
        payload: folders,
      });
    },
    [dispatch],
  );

  const actionUpdateFolders = useCallback(
    (newFolders: StructuredFolder | StructuredFolders) => {
      dispatch({
        type: ActionType.UpdateFolders,
        payload: newFolders,
      });
    },
    [dispatch],
  );

  const actionDeleteFolder = useCallback(
    (folderId: string) => {
      dispatch({
        type: ActionType.DeleteFolder,
        payload: folderId,
      });
    },
    [dispatch],
  );

  const actionUpdateFoldersByFile = useCallback(
    (file: MirrorFile) => {
      dispatch({
        type: ActionType.UpdateFoldersByFile,
        payload: file,
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
    actionUpdateFolders,
    actionDeleteFolder,
    actionUpdateFoldersByFile,
  };
};
