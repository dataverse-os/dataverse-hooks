import { useCallback, useContext } from "react";

import {
  Chain,
  MirrorFile,
  StructuredFolder,
  StructuredFolderRecord,
  WALLET,
} from "@dataverse/dataverse-connector";

import { DataverseContext } from "./useStore";
import { DATAVERSE_CONTEXT_PROVIDER_ERROR } from "../errors";
import {
  ActionType,
  CreateIndexFileResult,
  DatatokenInfo,
  LoadFilesByResult,
  LoadFilesResult,
  MonetizeFileResult,
  UnlockFileResult,
  UpdateIndexFileResult,
} from "../types";

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

  const actionCreateFile = useCallback(
    (createdFile: CreateIndexFileResult) => {
      dispatch({
        type: ActionType.CreateFile,
        payload: createdFile,
      });
    },
    [dispatch],
  );

  const actionUpdateFile = useCallback(
    (
      updatedFile:
        | (MonetizeFileResult & { fileId: string })
        | (UnlockFileResult & { fileId: string })
        | (UpdateIndexFileResult & { fileId: string }),
    ) => {
      dispatch({
        type: ActionType.UpdateFile,
        payload: updatedFile,
      });
    },
    [dispatch],
  );

  const actionLoadFiles = useCallback(
    (loadedFiles: LoadFilesResult | LoadFilesByResult) => {
      dispatch({
        type: ActionType.LoadFiles,
        payload: loadedFiles,
      });
    },
    [dispatch],
  );

  const actionSetFolders = useCallback(
    (folders: StructuredFolderRecord) => {
      dispatch({
        type: ActionType.SetFolders,
        payload: folders,
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

  const actionUpdateFolders = useCallback(
    (newFolders: StructuredFolder | StructuredFolderRecord) => {
      dispatch({
        type: ActionType.UpdateFolders,
        payload: newFolders,
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

  const actionUpdateDatatokenInfo = useCallback(
    (payload: { streamId: string; datatokenInfo: DatatokenInfo }) => {
      dispatch({
        type: ActionType.UpdateDatatokenInfo,
        payload,
      });
    },
    [dispatch],
  );

  const actionSetDataUnions = useCallback(
    (dataUnions: StructuredFolderRecord) => {
      dispatch({
        type: ActionType.SetDataUnions,
        payload: dataUnions,
      });
    },
    [dispatch],
  );

  const actionUpdateDataUnion = useCallback(
    (dataUnion: StructuredFolder) => {
      dispatch({
        type: ActionType.UpdateDataUnion,
        payload: dataUnion,
      });
    },
    [dispatch],
  );

  const actionDeleteDataUnion = useCallback(
    (dataUnionId: string) => {
      dispatch({
        type: ActionType.DeleteDataUnion,
        payload: dataUnionId,
      });
    },
    [dispatch],
  );

  const actionUpdateDataUnionsByFile = useCallback(
    (file: MirrorFile) => {
      dispatch({
        type: ActionType.UpdateDataUnionsByFile,
        payload: file,
      });
    },
    [dispatch],
  );

  // const actionUpdateDataUnionsByMonetizeFile = useCallback(
  //   (file: MirrorFile) => {
  //     dispatch({
  //       type: ActionType.UpdateDataUnionsByMonetizeFile,
  //       payload: file,
  //     });
  //   },
  //   [dispatch],
  // );

  const actionUpdateDataUnionsByDeleteFiles = useCallback(
    (fileIds: string[]) => {
      dispatch({
        type: ActionType.UpdateDataUnionsByDeleteFiles,
        payload: fileIds,
      });
    },
    [dispatch],
  );

  return {
    actionConnectWallet,
    actionCreateCapability,
    actionCreateFile,
    actionUpdateFile,
    actionLoadFiles,
    actionSetFolders,
    actionUpdateFolders,
    actionDeleteFolder,
    actionUpdateFoldersByFile,
    actionLoadProfileIds,
    actionCreateProfile,
    actionUpdateDatatokenInfo,
    actionSetDataUnions,
    actionUpdateDataUnion,
    actionDeleteDataUnion,
    actionUpdateDataUnionsByFile,
    actionUpdateDataUnionsByDeleteFiles,
    // actionUpdateDataUnionsByMonetizeFile,
  };
};
