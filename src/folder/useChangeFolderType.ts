import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  FolderType,
  SYSTEM_CALL,
  StructuredFolder,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { MutationStatus } from "../types";

export const useChangeFolderType = ({
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
   * change folder type by folderId (only public and privacy is supported)
   * @param folderId folder id
   * @param targetType folder type
   * @param reRender reRender page ?
   * @param sync sync ?
   */
  const changeFolderType = async ({
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
      if (!state.dataverseConnector) {
        throw DATAVERSE_CONNECTOR_UNDEFINED;
      }

      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }

      const result = await state.dataverseConnector.runOS({
        method: SYSTEM_CALL.changeFolderType,
        params: {
          folderId,
          targetFolderType: targetFolderType as any,
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
    changeFolderType: useCallback(changeFolderType, [
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
