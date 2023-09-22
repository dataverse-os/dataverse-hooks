import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { CollectFileResult, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useCollectFile = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error: any) => void;
  onPending?: (fileId: string) => void;
  onSuccess?: (result: CollectFileResult) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionUpdateFile } = useAction();

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

  const collectFile = useCallback(
    async (fileId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending(fileId);
        }

        const collectResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.collectFile,
          params: fileId,
        });

        actionUpdateFile({
          fileId: fileId,
          ...collectResult,
        });

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
      actionUpdateFile,
      setStatus,
      setError,
      setResult,
      onPending,
      onError,
      onSuccess,
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
