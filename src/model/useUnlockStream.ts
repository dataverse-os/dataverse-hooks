import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useMutation } from "../utils";
import { MutationStatus, UnlockStreamResult } from "../types";
import { useCallback } from "react";
import { useAction } from "../store/useAction";

export const useUnlockStream = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: UnlockStreamResult) => void;
}) => {
  const { state } = useStore();
  const { actionUpdateStream } = useAction();

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
          params.onPending();
        }

        const unlockResult = await state.dataverseConnector.runOS({
          method: SYSTEM_CALL.unlock,
          params: {
            streamId,
          },
        });

        actionUpdateStream({
          streamId,
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
    [actionUpdateStream],
  );

  return {
    unlockedStreamContent: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    unlockStream,
  };
};
