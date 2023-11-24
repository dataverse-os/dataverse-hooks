import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useAction, useStore } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useLoadBareFileContent = (params?: {
  onError?: (error: any) => void;
  onPending?: (fileId: string) => void;
  onSuccess?: (result: string) => void;
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
  } = useMutation<string>();

  const loadBareFileContent = useCallback(
    async (fileId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params?.onPending(fileId);
        }

        const fileContent = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadBareFileContent,
          params: fileId,
        });

        actionUpdateFile({
          fileId,
          content: fileContent,
        });

        setResult(fileContent);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params?.onSuccess(fileContent);
        }
        return fileContent;
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
      actionUpdateFile,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
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
