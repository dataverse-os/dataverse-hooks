import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { useStore } from "./store";
import { useMutation } from "./utils";
import {
  ActionType,
  LoadStreamsArgs,
  LoadStreamsResult,
  MutationStatus,
} from "./types";

export const useLoadStreams = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: LoadStreamsResult) => void;
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

  const loadStreams = async ({ pkh, modelId }: LoadStreamsArgs) => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }
      let streams: LoadStreamsResult;
      if (pkh) {
        streams = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadStreamsBy,
          params: {
            modelId,
            pkh,
          },
        });
      } else {
        streams = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadStreamsBy,
          params: {
            modelId,
          },
        });
      }

      dispatch({
        type: ActionType.Read,
        payload: streams,
      });

      setStatus(MutationStatus.Succeed);
      setResult(streams);
      if (onSuccess) {
        onSuccess(streams);
      }
      return streams;
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
    loadStreams,
  };
};
