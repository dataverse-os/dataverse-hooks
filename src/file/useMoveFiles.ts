import { useStore } from "../store";
import { useAction } from "../store";
import {
  MirrorFiles,
  SYSTEM_CALL,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";

export const useMoveFiles = ({
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
   * move mirror from sourceFolder to targetFolder by id
   * @param sourceMirrorIds source mirrors id
   * @param targetFolderId target folder id
   * @param reRender reRender page ?
   * @param syncImmediately sync ?
   */
  const moveFiles = useCallback(
    async ({
      sourceIndexFileIds,
      targetFolderId,
      reRender = true,
      syncImmediately = false,
    }: {
      sourceIndexFileIds: string[];
      targetFolderId: string;
      reRender?: boolean;
      syncImmediately?: boolean;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending();
        }

        const { allFolders, sourceFolders, targetFolder, movedFiles } =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.moveFiles,
            params: {
              targetFolderId,
              sourceIndexFileIds,
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
            deepAssignRenameKey(
              Object.values(sourceFolders || {}).concat(targetFolder),
              [{ mirror: "mirrorFile" }],
            ) as StructuredFolders,
          );
        }

        setResult(movedFiles);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(movedFiles);
        }
        return movedFiles;
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
    movedFiles: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    moveFiles,
  };
};
