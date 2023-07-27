import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { useStore } from "./store";
import { useMutation } from "./utils";
import {
  ActionType,
  CreatePublicStreamArgs,
  CreateStreamResult,
  MutationStatus,
} from "./types";

export const useCreatePublicStream = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: CreateStreamResult) => void;
}) => {
  const {dispatch} = useStore();

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

  const createPublicStream = async ({
    model,
    stream,
  }: CreatePublicStreamArgs) => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
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

      const createdStream: CreateStreamResult = await dataverseConnector.runOS({
        method: SYSTEM_CALL.createStream,
        params: {
          modelId: modelStream.modelId,
          streamContent: inputStreamContent,
        },
      });

      dispatch({
        type: ActionType.Create,
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
    createPublicStream,
  };
};
