import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { LoadFilesByArgs, LoadFilesByResult, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useFeedsByAddress = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: LoadFilesByArgs) => void;
  onSuccess?: (result: LoadFilesByResult) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionLoadFiles: actionLoadStreams } = useAction();

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

  const loadFeedsByAddress = useCallback(
    async ({ pkh, modelId }: LoadFilesByArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({ pkh, modelId });
        }

        const streams: LoadFilesByResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadStreamsBy,
          params: {
            modelId,
            pkh,
          },
        });

        actionLoadStreams(streams);

        setStatus(MutationStatus.Succeed);
        setResult(streams);
        if (params?.onSuccess) {
          params.onSuccess(streams);
        }
        return streams;
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
      actionLoadStreams,
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
    loadFeedsByAddress,
  };
};
