import { useStore } from "../store";
import { useAction } from "../store";
import {
  SYSTEM_CALL,
  StructuredFolder,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";

export const useChangeFolderBaseInfo = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: StructuredFolder) => void;
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
   * change folder name by streamId
   * @param folderId
   * @param newFolderName Folder name
   * @param newFolderDescription Folder description
   * @param reRender reRender page
   * @param syncImmediately sync
   */
  const changeFolderBaseInfo = useCallback(
    async ({
      folderId,
      newFolderName,
      newFolderDescription,
      reRender = true,
      syncImmediately,
    }: {
      folderId: string;
      newFolderName: string;
      newFolderDescription?: string;
      reRender?: boolean;
      syncImmediately?: boolean;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending();
        }

        const { allFolders, currentFolder } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.updateFolderBaseInfo,
          params: {
            folderId,
            newFolderName,
            newFolderDescription,
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
        if (onSuccess) {
          onSuccess(currentFolder);
        }
        return currentFolder;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
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
    reset,
    changeFolderBaseInfo,
  };
};
