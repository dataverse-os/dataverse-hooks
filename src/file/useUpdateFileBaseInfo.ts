import { useCallback } from "react";

import {
  FileInfo,
  MirrorFile,
  SYSTEM_CALL,
  StructuredFolder,
} from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";
import { deepAssignRenameKey } from "../utils/object";

export const useUpdateFileBaseInfo = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    indexFileId: string;
    fileInfo: FileInfo;
    syncImmediately?: boolean;
  }) => void;
  onSuccess?: (result: MirrorFile) => void;
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
            syncImmediately,
          });
        }

        const { currentFolder, currentFile } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.updateFileBaseInfo,
          params: {
            indexFileId,
            fileInfo,
            syncImmediately,
          },
        });

        actionUpdateFolders(
          deepAssignRenameKey(currentFolder, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolder,
        );

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
