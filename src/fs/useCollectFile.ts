import { useCallback } from "react";

import { RequestType, SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { CollectFileResult, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useCollectFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: RequestType["collectFile"]) => void;
  onSuccess?: (result: CollectFileResult) => void;
}) => {
  const { dataverseConnector } = useStore();

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
  } = useMutation<CollectFileResult>();

  const collectFile = useCallback(
    async (args: RequestType["collectFile"]) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(args);
        }

        const collectResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.collectFile,
          params: args,
        });

        setResult(collectResult);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(collectResult);
        }
        return collectResult;
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
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    collectedFileContent: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    collectFile,
  };
};
