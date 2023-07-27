import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useCallback } from "react";
import { useStore } from "../store";
import {
  ActionType,
  CreateEncryptedStreamArgs,
  CreateStreamResult,
  MutationStatus,
} from "../types";
import { useMutation } from "../utils";

export const useCreateEncryptedStream = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: CreateStreamResult) => void;
}) => {
  const {
    state: { dataverseConnector },
    updateStreamsMap,
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

  const createEncryptedStream = useCallback(
    async ({ modelId, stream, encrypted }: CreateEncryptedStreamArgs) => {
      if (!dataverseConnector) {
        throw new Error("No available dataverseConnector");
      }
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending();
        }
        const inputStreamContent = {
          ...stream,
          ...(stream && {
            encrypted: JSON.stringify(encrypted),
          }),
        };
        const createdStream = await dataverseConnector.runOS({
          method: SYSTEM_CALL.createStream,
          params: {
            modelId,
            streamContent: inputStreamContent,
          },
        });

        updateStreamsMap({
          type: ActionType.CreateStream,
          payload: createdStream,
        });

        setResult(createdStream);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(createdStream);
        }

        return createdStream;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [dataverseConnector, updateStreamsMap],
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
    createEncryptedStream,
  };
};
