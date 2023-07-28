import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useCallback } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useStore } from "../store";
import {
  CreateEncryptedStreamArgs,
  CreateStreamResult,
  MutationStatus,
} from "../types";
import { useMutation } from "../utils";

export const useCreateEncryptedStream = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: CreateStreamResult) => void;
}) => {
  const { state, actionCreateStream } = useStore();

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
      if (!state.dataverseConnector) {
        throw DATAVERSE_CONNECTOR_UNDEFINED;
      }
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        const inputStreamContent = {
          ...stream,
          ...(stream && {
            encrypted: JSON.stringify(encrypted),
          }),
        };
        const createdStream = await state.dataverseConnector.runOS({
          method: SYSTEM_CALL.createStream,
          params: {
            modelId,
            streamContent: inputStreamContent,
          },
        });

        actionCreateStream(createdStream);

        setResult(createdStream);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(createdStream);
        }

        return createdStream;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [state.dataverseConnector, actionCreateStream],
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
