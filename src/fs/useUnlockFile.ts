import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, UnlockFileResult } from "../types";
import { useMutation } from "../utils";

export const useUnlockStream = (params?: {
  onError?: (error: any) => void;
  onPending?: (streamId: string) => void;
  onSuccess?: (result: UnlockFileResult) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionUpdateFile: actionUpdateStream } = useAction();

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

  const unlockStream = useCallback(
    async (streamId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(streamId);
        }

        const unlockResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.unlock,
          params: {
            streamId,
          },
        });

        actionUpdateStream({
          fileId: streamId,
          ...unlockResult,
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
      actionUpdateStream,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    unlockedStreamContent: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    unlockStream,
  };
};
