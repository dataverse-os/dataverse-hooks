import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useCallback } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED, PROFILES_NOT_EXSIT } from "../errors";
import { useGetProfiles } from "../profile/useGetProfiles";
import { useStore } from "../store";
import {
  MonetizeStreamArgs,
  MonetizeStreamResult,
  MutationStatus,
} from "../types";
import { useMutation } from "../utils";

export const useMonetizeStream = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: MonetizeStreamResult) => void;
}) => {
  const { state, actionUpdateStream } = useStore();

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

  const { getProfiles } = useGetProfiles();

  const monetizeStream = useCallback(
    async ({
      streamId,
      profileId,
      streamContent,
      currency,
      amount,
      collectLimit,
      decryptionConditions,
    }: MonetizeStreamArgs) => {
      try {
        if (!state.dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        if (!profileId) {
          const profileIds = await getProfiles(
            state.dataverseConnector.address!,
          );
          if (profileIds.length === 0) {
            throw PROFILES_NOT_EXSIT;
          }
          profileId = profileIds[0];
        }

        if (!streamContent) {
          streamContent = state.streamsMap[streamId].streamContent;
        }
        const monetizeResult: MonetizeStreamResult =
          await state.dataverseConnector.runOS({
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
        if (params?.onSuccess) {
          params.onSuccess(monetizeResult);
        }

        actionUpdateStream({
          streamId,
          ...monetizeResult,
        });

        return monetizeResult;
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
    monetizeStream,
  };
};
