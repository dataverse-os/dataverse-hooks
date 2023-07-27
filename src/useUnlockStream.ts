import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { useStore } from "./store";
import { useMutation } from "./utils";
import { ActionType, MutationStatus, UnlockStreamResult } from "./types";

export const useUnlockStream = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: UnlockStreamResult) => void;
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

  const unlockStream = async (streamId: string) => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }

      const unlockResult = await dataverseConnector.runOS({
        method: SYSTEM_CALL.unlock,
        params: {
          streamId,
        },
      });

      dispatch({
        type: ActionType.Update,
        payload: {
          streamId,
          ...unlockResult,
        },
      });

      setStatus(MutationStatus.Succeed);
      setResult(unlockResult);
      if (onSuccess) {
        onSuccess(unlockResult);
      }

      return unlockResult;
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
    unlockStream,
  };
};
