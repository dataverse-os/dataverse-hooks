import { useReducer } from "react";
import {
  DataverseConnector,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";
import { initialState, reducer } from "./store";
import { useMutation } from "./utils";
import { ActionType, MutationStatus } from "./types";

export const useCreateCapability = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: string) => void;
}) => {
  const [, dispatch] = useReducer(reducer, initialState);

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

  const createCapability = async (appId: string) => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }
      const currentPkh = await dataverseConnector.runOS({
        method: SYSTEM_CALL.createCapability,
        params: {
          appId,
        },
      });

      dispatch({
        type: ActionType.CreateCapability,
        payload: currentPkh,
      });

      setStatus(MutationStatus.Succeed);
      setResult(currentPkh);
      if (onSuccess) {
        onSuccess(currentPkh);
      }
      return currentPkh;
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
    createCapability,
  };
};
