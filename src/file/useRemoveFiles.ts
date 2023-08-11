import { useCallback } from "react";

import {
  MirrorFiles,
  SYSTEM_CALL,
  StructuredFolders,
} from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";
import { deepAssignRenameKey } from "../utils/object";

export const useRemoveFiles = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    indexFileIds: string[];
    syncImmediately?: boolean;
  }) => void;
  onSuccess?: (result: MirrorFiles) => void;
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
   * remove mirror by both folderId and mirrorId
   * @param mirrorIds mirrors id
   * @param reRender reRender page ?
   * @param syncImmediately sync ?
   */
  const removeFiles = useCallback(
    async ({
      indexFileIds,
      syncImmediately = false,
    }: {
      indexFileIds: string[];
      reRender?: boolean;
      syncImmediately?: boolean;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            indexFileIds,
            syncImmediately,
          });
        }

        const { sourceFolders, removedFiles } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.removeFiles,
          params: {
            indexFileIds,
            syncImmediately,
          },
        });

        actionUpdateFolders(
          deepAssignRenameKey(Object.values(sourceFolders || {}), [
            { mirror: "mirrorFile" },
          ]) as StructuredFolders,
        );

        setResult(removedFiles);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(removedFiles);
        }
        return removedFiles;
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
    removedFiles: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    removeFiles,
  };
};
