import { useCallback } from "react";

import { SYSTEM_CALL, StructuredFolder } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useCollectDataUnion = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error: any) => void;
  onPending?: (dataUnionId: string) => void;
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
  } = useMutation();

  const collectDataUnion = useCallback(
    async (dataUnionId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending(dataUnionId);
        }

        const collectResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.collectDataUnion,
          params: dataUnionId,
        });

        actionUpdateDataUnion(collectResult);

        setResult(collectResult);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(collectResult);
        }
        return collectResult;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
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
      onPending,
      onError,
      onSuccess,
    ],
  );

  return {
    collectedDataUnion: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    collectDataUnion,
  };
};
