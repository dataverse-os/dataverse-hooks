import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";
import { useCallback } from "react";
import { useAction } from "../store";

export const useCapability = (params?: {
  onError?: (error: any) => void;
  onPending?: (appId: string) => void;
  onSuccess?: (result: string) => void;
}) => {
  const { dataverseConnector } = useStore();

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
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params?.onPending(appId);
        }
        const currentPkh = await dataverseConnector.runOS({
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
    [actionCreateCapability],
  );

  return {
    pkh: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    createCapability,
  };
};
