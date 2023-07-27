import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { useStore } from "./store";
import {
  ActionType,
  CreateEncryptedStreamArgs,
  CreateStreamResult,
  MutationStatus,
} from "./types";
import { useMutation } from "./utils";

export const useCreateEncryptedStream = ({
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
  const { dispatch } = useStore();

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

  const createEncryptedStream = async ({
    modelId,
    stream,
    encrypted,
  }: CreateEncryptedStreamArgs) => {
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
    createEncryptedStream,
  };
};
