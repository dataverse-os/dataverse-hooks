import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useMutation } from "../utils";
import {
  LoadStreamsByArgs,
  LoadStreamsByResult,
  MutationStatus,
} from "../types";
import { useCallback } from "react";
import { useAction } from "../store/useAction";

export const useFeedsByAddress = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: LoadStreamsByResult) => void;
}) => {
  const { state } = useStore();
  const { actionLoadStreams } = useAction();

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
    async ({ pkh, modelId }: LoadStreamsByArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }

        const streams: LoadStreamsByResult =
          await state.dataverseConnector.runOS({
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
    [actionLoadStreams],
  );

  return {
    feeds: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    loadFeedsByAddress,
  };
};
