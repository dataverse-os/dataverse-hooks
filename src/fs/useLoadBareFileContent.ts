import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useLoadBareFileContent = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error: any) => void;
  onPending?: (fileId: string) => void;
  onSuccess?: (result: string) => void;
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
  } = useMutation<string>();

  const loadBareFileContent = useCallback(
    async (fileId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending(fileId);
        }

        const fileContent = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadBareFileContent,
          params: fileId,
        });

        setResult(fileContent);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(fileContent);
        }
        return fileContent;
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
      setStatus,
      setError,
      setResult,
      onPending,
      onError,
      onSuccess,
    ],
  );

  return {
    fileContent: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    loadBareFileContent,
  };
};
