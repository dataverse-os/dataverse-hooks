import { useCallback } from "react";

import {
  RequestType,
  SYSTEM_CALL,
  StructuredFolder,
} from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useChangeDataUnionBaseInfo = (params?: {
  onError?: (error: unknown) => void;
  onPending?: (args: RequestType[SYSTEM_CALL.updateDataUnionBaseInfo]) => void;
  onSuccess?: (result: StructuredFolder) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionUpdateDataUnion } = useAction();

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
  } = useMutation<StructuredFolder>();

  const changeDataUnionBaseInfo = useCallback(
    async (args: RequestType[SYSTEM_CALL.updateDataUnionBaseInfo]) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(args);
        }

        const { currentDataUnion } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.updateDataUnionBaseInfo,
          params: args,
        });

        actionUpdateDataUnion(currentDataUnion);

        setResult(currentDataUnion);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(currentDataUnion);
        }
        return currentDataUnion;
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
      actionUpdateDataUnion,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    changedDataUnion: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    changeDataUnionBaseInfo,
  };
};
