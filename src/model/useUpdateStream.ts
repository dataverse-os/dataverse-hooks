import { SYSTEM_CALL, FileType } from "@dataverse/dataverse-connector";
import { useCallback } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useStore } from "../store";
import {
  ActionType,
  MutationStatus,
  UpdateStreamArgs,
  UpdateStreamResult,
} from "../types";
import { useMutation } from "../utils";

export const useUpdateStream = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: UpdateStreamResult) => void;
}) => {
  const {
    state: { dataverseConnector, streamsMap },
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

  const updateStream = useCallback(
    async ({ model, streamId, stream, encrypted }: UpdateStreamArgs) => {
      try {
        if (!dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        const modelStream = model.streams[model.streams.length - 1];

        const fileType = streamsMap[streamId]?.streamContent.file.fileType;
        if (
          !modelStream.isPublicDomain &&
          stream &&
          encrypted &&
          fileType === FileType.Public
        ) {
          for (const key in encrypted) {
            (encrypted as any)[key] = false;
          }
        }
        const streamContent = {
          ...stream,
          encrypted: JSON.stringify(encrypted),
        };

        const updateResult: UpdateStreamResult = await dataverseConnector.runOS(
          {
            method: SYSTEM_CALL.updateStream,
            params: {
              streamId,
              streamContent,
              syncImmediately: true,
            },
          },
        );

        updateStreamsMap({
          type: ActionType.UpdateStream,
          payload: {
            streamId,
            ...updateResult,
          },
        });

        setStatus(MutationStatus.Succeed);
        setResult(updateResult);
        if (params?.onSuccess) {
          params.onSuccess(updateResult);
        }

        return updateResult;
      } catch (error) {
        setStatus(MutationStatus.Failed);
        setError(error);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [dataverseConnector, streamsMap, updateStreamsMap],
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
    updateStream,
  };
};
