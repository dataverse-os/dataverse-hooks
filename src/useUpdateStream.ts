import { useReducer } from "react";
import {
  SYSTEM_CALL,
  DataverseConnector,
  FileType,
} from "@dataverse/dataverse-connector";
import { reducer, initialState } from "./store";
import {
  ActionType,
  MutationStatus,
  UpdateStreamArgs,
  UpdateStreamResult,
} from "./types";
import { useMutation } from "./utils";

export const useUpdateStream = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: UpdateStreamResult) => void;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const updateStream = async ({
    model,
    streamId,
    stream,
    encrypted,
  }: UpdateStreamArgs) => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }
      const modelStream = model.streams[model.streams.length - 1];

      const fileType =
        state.streamRecordMap[streamId]?.streamContent.file.fileType;
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

      const updateResult: UpdateStreamResult = await dataverseConnector.runOS({
        method: SYSTEM_CALL.updateStream,
        params: {
          streamId,
          streamContent,
          syncImmediately: true,
        },
      });

      dispatch({
        type: ActionType.Update,
        payload: {
          streamId,
          ...updateResult,
        },
      });

      setStatus(MutationStatus.Succeed);
      setResult(updateResult);
      if (onSuccess) {
        onSuccess(updateResult);
      }

      return updateResult;
    } catch (error) {
      setStatus(MutationStatus.Failed);
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };

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
