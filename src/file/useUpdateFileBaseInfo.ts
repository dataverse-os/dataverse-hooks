import { useStore } from "../store";
import { useAction } from "../store";
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

export const useUpdateFileBaseInfo = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    indexFileId: string;
    fileInfo: FileInfo;
    reRender?: boolean;
    syncImmediately?: boolean;
  }) => void;
  onSuccess?: (result: MirrorFile) => void;
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
   * update mirror by both folderId and mirrorId
   * @param model
   * @param mirrorId mirror id
   * @param newName new mirror content
   * @param newNote new mirror note
   * @param newTags new mirror tags
   * @param reRender reRender page ?
   * @param sync sync ?
   */
  const updateFileBaseInfo = useCallback(
    async ({
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
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            indexFileId,
            fileInfo,
            reRender,
            syncImmediately,
          });
        }

        const { allFolders, currentFolder, currentFile } =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.updateFileBaseInfo,
            params: {
              indexFileId,
              fileInfo,
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

        setResult(currentFile);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(currentFile);
        }
        return currentFile;
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
    updatedFile: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    updateFileBaseInfo,
  };
};
