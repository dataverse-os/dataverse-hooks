import { useCallback } from "react";

import { SYSTEM_CALL, FileType } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, UpdateFileArgs, UpdateFileResult } from "../types";
import { useMutation } from "../utils";

export const useUpdateStream = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: UpdateFileArgs) => void;
  onSuccess?: (result: UpdateFileResult) => void;
}) => {
  const { dataverseConnector, filesMap: streamsMap } = useStore();
  const { actionUpdateFile: actionUpdateStream } = useAction();

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
    async ({ model, streamId, stream, encrypted }: UpdateFileArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({ model, streamId, stream, encrypted });
        }
        const modelStream = model.streams[model.streams.length - 1];

        const fileType = streamsMap![streamId]?.streamContent.file.fileType;
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

        const updateResult: UpdateFileResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.updateStream,
          params: {
            streamId,
            streamContent,
            syncImmediately: true,
          },
        });

        actionUpdateStream({
          fileId: streamId,
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
    [
      dataverseConnector,
      streamsMap,
      actionUpdateStream,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    updatedStreamContent: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    updateStream,
  };
};
