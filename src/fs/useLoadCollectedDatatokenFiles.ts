import { useCallback } from "react";

import { MirrorFileRecord, SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useLoadCollectedDatatokenFiles = (params?: {
  onError?: (error: any) => void;
  onPending?: () => void;
  onSuccess?: (result?: MirrorFileRecord) => void;
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
  } = useMutation<MirrorFileRecord>();

  const loadCollectedDatatokenFiles = useCallback(async () => {
    try {
      setStatus(MutationStatus.Pending);
      if (params?.onPending) {
        params.onPending();
      }

      const files = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadCollectedDatatokenFiles,
      });

      setResult(files);
      setStatus(MutationStatus.Succeed);
      if (params?.onSuccess) {
        params.onSuccess(files);
      }
      return files;
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
    setStatus,
    setError,
    setResult,
    params?.onPending,
    params?.onError,
    params?.onSuccess,
  ]);

  return {
    collectedDatatokenFiles: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    loadCollectedDatatokenFiles,
  };
};
