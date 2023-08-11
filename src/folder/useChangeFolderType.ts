import { useCallback } from "react";

import {
  FolderType,
  SYSTEM_CALL,
  StructuredFolder,
} from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";
import { deepAssignRenameKey } from "../utils/object";

export const useChangeFolderType = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    folderId: string;
    targetFolderType: FolderType;
    syncImmediately?: boolean;
  }) => void;
  onSuccess?: (result: StructuredFolder) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionUpdateFolders } = useAction();

  const {
    result,
    setResult,
    error,
    setError,
    status,
    setStatus,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
  } = useMutation();

  /**
   * change folder type by folderId (only public and privacy is supported)
   * @param folderId folder id
   * @param targetType folder type
   * @param reRender reRender page ?
   * @param sync sync ?
   */
  const changeFolderType = useCallback(
    async ({
      folderId,
      targetFolderType,
      syncImmediately = false,
    }: {
      folderId: string;
      targetFolderType: FolderType;
      syncImmediately?: boolean;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            folderId,
            targetFolderType,
            syncImmediately,
          });
        }

        const { currentFolder } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.changeFolderType,
          params: {
            folderId,
            targetFolderType: targetFolderType as any,
            syncImmediately,
          },
        });

        actionUpdateFolders(
          deepAssignRenameKey(currentFolder, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolder,
        );

        setResult(currentFolder);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(currentFolder);
        }
        return currentFolder;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [
      dataverseConnector,
      actionUpdateFolders,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    changedFolder: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    changeFolderType,
  };
};
