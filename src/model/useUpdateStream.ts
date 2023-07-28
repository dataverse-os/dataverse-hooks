import { SYSTEM_CALL, FileType } from "@dataverse/dataverse-connector";
import { useCallback } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import { MutationStatus, UpdateStreamArgs, UpdateStreamResult } from "../types";
import { useMutation } from "../utils";

export const useUpdateStream = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: UpdateStreamResult) => void;
}) => {
  const { state } = useStore();
  const { actionUpdateStream } = useAction();

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
        if (!state.dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        const modelStream = model.streams[model.streams.length - 1];

        const fileType =
          state.streamsMap[streamId]?.streamContent.file.fileType;
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

        const updateResult: UpdateStreamResult =
          await state.dataverseConnector.runOS({
            method: SYSTEM_CALL.updateStream,
            params: {
              streamId,
              streamContent,
              syncImmediately: true,
            },
          });

        actionUpdateStream({
          streamId,
          ...updateResult,
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
    [state.dataverseConnector, state.streamsMap, actionUpdateStream],
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
