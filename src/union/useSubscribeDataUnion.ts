import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import {
  MutationStatus,
  SubscribeDataUnionArgs,
  SubscribeDataUnionResult,
} from "../types";
import { useMutation } from "../utils";

export const useSubscribeDataUnion = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: SubscribeDataUnionArgs) => void;
  onSuccess?: (result: SubscribeDataUnionResult) => void;
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
  } = useMutation<SubscribeDataUnionResult>();

  const subscribeDataUnion = useCallback(
    async (args: SubscribeDataUnionArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params?.onPending(args);
        }

        const subscribeResult: SubscribeDataUnionResult =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.subscribeDataUnion,
            params: args,
          });

        setResult(subscribeResult);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params?.onSuccess(subscribeResult);
        }
        return subscribeResult;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (params?.onError) {
          params?.onError(error);
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
    subscribeResult: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    subscribeDataUnion,
  };
};
