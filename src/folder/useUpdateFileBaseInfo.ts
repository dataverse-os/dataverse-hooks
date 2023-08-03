import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  FileInfo,
  MirrorFile,
  SYSTEM_CALL,
  StructuredFolder,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";

export const useUpdateFileBaseInfo = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: {
    currentFile: MirrorFile;
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
   * update mirror by both folderId and mirrorId
   * @param model
   * @param mirrorId mirror id
   * @param newName new mirror content
   * @param newNote new mirror note
   * @param newTags new mirror tags
   * @param reRender reRender page ?
   * @param sync sync ?
   */
  const updateFileBaseInfo = async ({
    indexFileId,
    fileInfo,
    reRender = true,
    syncImmediately = false,
  }: {
    indexFileId: string;
    fileInfo: FileInfo;
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
        method: SYSTEM_CALL.updateFileBaseInfo,
        params: {
          indexFileId,
          fileInfo,
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
    updateFileBaseInfo: useCallback(updateFileBaseInfo, [
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
