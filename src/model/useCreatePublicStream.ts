import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useMutation } from "../utils";
import {
  ActionType,
  CreatePublicStreamArgs,
  CreateStreamResult,
  MutationStatus,
} from "../types";
import { useCallback } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";

export const useCreatePublicStream = (params?: {
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

  const createPublicStream = useCallback(
    async ({ model, stream }: CreatePublicStreamArgs) => {
      try {
        if (!dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        const modelStream = model.streams[model.streams.length - 1];
        const encrypted = {} as any;
        if (stream && Object.keys(stream).length > 0) {
          Object.keys(stream).forEach(key => {
            encrypted[key] = false;
          });
        }

        const inputStreamContent = {
          ...stream,
          ...(!modelStream.isPublicDomain &&
            stream && {
              encrypted: JSON.stringify(encrypted),
            }),
        };

        const createdStream: CreateStreamResult =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.createStream,
            params: {
              modelId: modelStream.modelId,
              streamContent: inputStreamContent,
            },
          });

        updateStreamsMap({
          type: ActionType.CreateStream,
          payload: createdStream,
        });

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
    createPublicStream,
  };
};
