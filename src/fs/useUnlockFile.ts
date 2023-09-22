import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, UnlockFileResult } from "../types";
import { useMutation } from "../utils";

export const useUnlockFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (streamId: string) => void;
  onSuccess?: (result: UnlockFileResult) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionUpdateFile, actionUpdateFoldersByFile } = useAction();

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

        actionUpdateFile({
          fileId: fileId,
          ...unlockResult,
        });
        actionUpdateFoldersByFile({
          ...unlockResult.fileContent.file,
          content: unlockResult.fileContent,
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
      actionUpdateFile,
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
