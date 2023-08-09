import { useStore } from "../store";
import { useAction } from "../store";
import {
  MirrorFiles,
  SYSTEM_CALL,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useRemoveFiles = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: MirrorFiles) => void;
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
   * remove mirror by both folderId and mirrorId
   * @param mirrorIds mirrors id
   * @param reRender reRender page ?
   * @param syncImmediately sync ?
   */
  const removeFiles = useCallback(
    async ({
      indexFileIds,
      reRender = true,
      syncImmediately = false,
    }: {
      indexFileIds: string[];
      reRender?: boolean;
      syncImmediately?: boolean;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending();
        }

        const { allFolders, sourceFolders, removedFiles } =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.removeFiles,
            params: {
              indexFileIds,
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
            deepAssignRenameKey(Object.values(sourceFolders || {}), [
              { mirror: "mirrorFile" },
            ]) as StructuredFolders,
          );
        }

        setResult(removedFiles);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(removedFiles);
        }
        return removedFiles;
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
    removedFiles: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    removeFiles,
  };
};
