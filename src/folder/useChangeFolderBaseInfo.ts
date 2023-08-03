import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  SYSTEM_CALL,
  StructuredFolder,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { MutationStatus } from "../types";

export const useChangeFolderBaseInfo = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: {
    currentFolder: StructuredFolder;
    allFolders: StructuredFolders;
  }) => void;
}) => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

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
  const changeFolderBaseInfo = async ({
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
      if (!state.dataverseConnector) {
        throw DATAVERSE_CONNECTOR_UNDEFINED;
      }

      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }

      const result = await state.dataverseConnector.runOS({
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
          deepAssignRenameKey(result.allFolders, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolders,
        );
      }

      setResult(result);
      setStatus(MutationStatus.Succeed);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (error) {
      setError(error);
      setStatus(MutationStatus.Failed);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };

  return {
    changeFolderBaseInfo: useCallback(changeFolderBaseInfo, [
      state.dataverseConnector,
      actionSetFolders,
    ]),
    result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
  };
};
