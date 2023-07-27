import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useMutation } from "../utils";
import { LoadStreamsResult, MutationStatus } from "../types";
import { useCallback } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";

export const useLoadStreams = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: LoadStreamsResult) => void;
}) => {
  const {
    state: { dataverseConnector },
    actionLoadStreams,
  } = useStore();

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

  const loadStreams = useCallback(
    async (modelId: string) => {
      try {
        if (!dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }

        const streams: LoadStreamsResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadStreamsBy,
          params: {
            modelId,
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
    [dataverseConnector, actionLoadStreams],
  );

  return {
    result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    loadStreams,
  };
};
