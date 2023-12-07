import { useCallback } from "react";

import { MirrorFile, SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, RequiredByKeys, UnlockFileResult } from "../types";
import { useMutation } from "../utils";

export const useUnlockFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (streamId: string) => void;
  onSuccess?: (result: UnlockFileResult) => void;
}) => {
  const { dataverseConnector, actionFilesMap } = useStore();
  const {
    actionUpdateFile,
    actionUpdateAction,
    actionUpdateFoldersByFile,
    actionUpdateDataUnionsByFile,
  } = useAction();

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
  } = useMutation<UnlockFileResult>();

  const unlockFile = useCallback(
    async (fileId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(fileId);
        }

        const unlockResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.unlockFile,
          params: fileId,
        });

        if (
          actionFilesMap &&
          actionFilesMap[unlockResult.fileContent.file.fileId]
        ) {
          actionUpdateAction({
            ...unlockResult.fileContent,
            ...unlockResult.fileContent.file,
            content: unlockResult.fileContent.content,
          } as RequiredByKeys<MirrorFile, "action" | "relationId">);
        }

        actionUpdateFile({
          ...unlockResult,
          ...unlockResult.fileContent.file,
          content: unlockResult.fileContent.content,
        });
        actionUpdateFoldersByFile({
          ...unlockResult.fileContent.file,
          content: unlockResult.fileContent.content,
        });
        actionUpdateDataUnionsByFile({
          ...unlockResult.fileContent.file,
          content: unlockResult.fileContent.content,
        });

        setStatus(MutationStatus.Succeed);
        setResult(unlockResult);
        if (params?.onSuccess) {
          params.onSuccess(unlockResult);
        }

        return unlockResult;
      } catch (error) {
        setStatus(MutationStatus.Failed);
        setError(error);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [
      dataverseConnector,
      actionFilesMap,
      actionUpdateFile,
      actionUpdateFoldersByFile,
      actionUpdateDataUnionsByFile,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    unlockedFileContent: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    unlockFile,
  };
};
