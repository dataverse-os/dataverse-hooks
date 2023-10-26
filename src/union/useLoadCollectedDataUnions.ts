import { useCallback } from "react";

import {
  SYSTEM_CALL,
  StructuredFolderRecord,
} from "@dataverse/dataverse-connector";

import { useAction, useStore } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useLoadCollectedDataUnions = (params?: {
  onError?: (error: any) => void;
  onPending?: () => void;
  onSuccess?: (result?: StructuredFolderRecord) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionSetCollectedDataUnions } = useAction();

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
  } = useMutation<StructuredFolderRecord>();

  const loadCollectedDataUnions = useCallback(async () => {
    try {
      setStatus(MutationStatus.Pending);
      if (params?.onPending) {
        params.onPending();
      }

      const dataUnions = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadCollectedDataUnions,
      });

      actionSetCollectedDataUnions(dataUnions);

      setResult(dataUnions);
      setStatus(MutationStatus.Succeed);
      if (params?.onSuccess) {
        params.onSuccess(dataUnions);
      }
      return dataUnions;
    } catch (error) {
      setError(error);
      setStatus(MutationStatus.Failed);
      if (params?.onError) {
        params.onError(error);
      }
      throw error;
    }
  }, [
    dataverseConnector,
    actionSetCollectedDataUnions,
    setStatus,
    setError,
    setResult,
    params?.onPending,
    params?.onError,
    params?.onSuccess,
  ]);

  return {
    collectedDataUnions: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    loadCollectedDataUnions,
  };
};
