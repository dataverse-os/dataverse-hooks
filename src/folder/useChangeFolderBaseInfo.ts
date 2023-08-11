import { useStore } from "../store";
import { useAction } from "../store";
import { SYSTEM_CALL, StructuredFolder } from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";

export const useChangeFolderBaseInfo = (params?: {
  onError?: (error: unknown) => void;
  onPending?: (args: {
    folderId: string;
    newFolderName: string;
    newFolderDescription?: string;
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
      syncImmediately,
    }: {
      folderId: string;
      newFolderName: string;
      newFolderDescription?: string;
      syncImmediately?: boolean;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            folderId,
            newFolderName,
            newFolderDescription,
            syncImmediately,
          });
        }

        const { currentFolder } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.updateFolderBaseInfo,
          params: {
            folderId,
            newFolderName,
            newFolderDescription,
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
    changeFolderBaseInfo,
  };
};
