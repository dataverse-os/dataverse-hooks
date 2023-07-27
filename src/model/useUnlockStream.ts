import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useMutation } from "../utils";
import { MutationStatus, UnlockStreamResult } from "../types";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useCallback } from "react";

export const useUnlockStream = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: UnlockStreamResult) => void;
}) => {
  const {
    state: { dataverseConnector },
    actionUpdateStream,
  } = useStore();

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
        if (!dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }

        const unlockResult = await dataverseConnector.runOS({
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
    [dataverseConnector, actionUpdateStream],
  );

  return {
    result,
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
