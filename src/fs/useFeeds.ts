import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { LoadFilesResult, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useFeeds = (params?: {
  onError?: (error: any) => void;
  onPending?: (modelId: string) => void;
  onSuccess?: (result: LoadFilesResult) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionLoadFiles } = useAction();

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
  } = useMutation<LoadFilesResult>();

  const loadFeeds = useCallback(
    async (modelId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(modelId);
        }

        const files: LoadFilesResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadFilesBy,
          params: {
            modelId,
          },
        });

        actionLoadFiles(files);

        setStatus(MutationStatus.Succeed);
        setResult(files);
        if (params?.onSuccess) {
          params.onSuccess(files);
        }
        return files;
      } catch (error) {
        setStatus(MutationStatus.Failed);
        setError(error);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [
      dataverseConnector,
      actionLoadFiles,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    feeds: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    loadFeeds,
  };
};
