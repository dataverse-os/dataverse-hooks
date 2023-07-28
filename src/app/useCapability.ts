import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";
import { useCallback } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useAction } from "../store/useAction";

export const useCapability = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: string) => void;
}) => {
  const { state } = useStore();

  const { actionCreateCapability } = useAction();

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

  const createCapability = useCallback(
    async (appId: string) => {
      try {
        if (!state.dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params?.onPending();
        }
        const currentPkh = await state.dataverseConnector.runOS({
          method: SYSTEM_CALL.createCapability,
          params: {
            appId,
          },
        });

        actionCreateCapability(currentPkh);
        setStatus(MutationStatus.Succeed);
        setResult(currentPkh);
        if (params?.onSuccess) {
          params?.onSuccess(currentPkh);
        }
        return currentPkh;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (params?.onError) {
          params?.onError(error);
        }
        throw error;
      }
    },
    [state.dataverseConnector, actionCreateCapability],
  );

  return {
    pkh: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    createCapability,
  };
};
