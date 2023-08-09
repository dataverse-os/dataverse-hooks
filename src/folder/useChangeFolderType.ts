import { useStore } from "../store";
import { useAction } from "../store";
import {
  FolderType,
  SYSTEM_CALL,
  StructuredFolder,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";

export const useChangeFolderType = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    folderId: string;
    targetFolderType: FolderType;
    reRender?: boolean;
    syncImmediately?: boolean;
  }) => void;
  onSuccess?: (result: StructuredFolder) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionSetFolders, actionUpdateFolders } = useAction();

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
      reRender = true,
      syncImmediately = false,
    }: {
      folderId: string;
      targetFolderType: FolderType;
      reRender?: boolean;
      syncImmediately?: boolean;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            folderId,
            targetFolderType,
            reRender,
            syncImmediately,
          });
        }

        const { allFolders, currentFolder } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.changeFolderType,
          params: {
            folderId,
            targetFolderType: targetFolderType as any,
            syncImmediately,
          },
        });

        if (reRender) {
          actionSetFolders(
            deepAssignRenameKey(allFolders, [
              { mirror: "mirrorFile" },
            ]) as StructuredFolders,
          );
        } else {
          actionUpdateFolders(
            deepAssignRenameKey(currentFolder, [
              { mirror: "mirrorFile" },
            ]) as StructuredFolder,
          );
        }

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
    [actionSetFolders, actionUpdateFolders],
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
