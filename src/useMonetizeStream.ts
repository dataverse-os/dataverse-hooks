import { useReducer } from "react";
import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { initialState, reducer } from "./store";
import {
  ActionType,
  MonetizeStreamArgs,
  MonetizeStreamResult,
  MutationStatus,
} from "./types";
import { useMutation } from "./utils";

export const useMonetizeStream = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: MonetizeStreamResult) => void;
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

  const monetizeStream = async ({
    streamId,
    profileId,
    streamContent,
    currency,
    amount,
    collectLimit,
    decryptionConditions,
  }: MonetizeStreamArgs) => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }
      if (!profileId) {
        const profileIds = await dataverseConnector.getProfiles(
          dataverseConnector.address!,
        );
        if (profileIds.length === 0) {
          throw new Error("Please create profile first.");
        }
      }

      if (!streamContent) {
        streamContent = state.streamsMap[streamId].streamContent;
      }
      const monetizeResult: MonetizeStreamResult =
        await dataverseConnector.runOS({
          method: SYSTEM_CALL.monetizeFile,
          params: {
            streamId,
            indexFileId: streamContent?.file.indexFileId,
            datatokenVars: {
              profileId,
              currency,
              amount,
              collectLimit,
            },
            decryptionConditions,
          },
        });

      setStatus(MutationStatus.Succeed);
      setResult(monetizeResult);
      if (onSuccess) {
        onSuccess(monetizeResult);
      }

      dispatch({
        type: ActionType.Update,
        payload: {
          streamId,
          ...monetizeResult,
        },
      });

      return monetizeResult;
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
    monetizeStream,
  };
};
