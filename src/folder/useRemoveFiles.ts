import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  MirrorFiles,
  SYSTEM_CALL,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { MutationStatus } from "../types";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useMutation } from "../utils";

export const useRemoveFiles = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: {
    allFolders: StructuredFolders;
    removedFiles: MirrorFiles;
    sourceFolders: StructuredFolders;
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
   * remove mirror by both folderId and mirrorId
   * @param mirrorIds mirrors id
   * @param reRender reRender page ?
   * @param syncImmediately sync ?
   */
  const removeFiles = async ({
    indexFileIds,
    reRender = true,
    syncImmediately = false,
  }: {
    indexFileIds: string[];
    reRender?: boolean;
    syncImmediately?: boolean;
  }): Promise<{
    allFolders: StructuredFolders;
    removedFiles: MirrorFiles;
    sourceFolders: StructuredFolders;
  }> => {
    try {
      if (!state.dataverseConnector) {
        throw DATAVERSE_CONNECTOR_UNDEFINED;
      }

      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }

      const result = await state.dataverseConnector.runOS({
        method: SYSTEM_CALL.removeFiles,
        params: {
          indexFileIds,
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
    removeFiles: useCallback(removeFiles, [
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
