import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { PROFILES_NOT_EXSIT } from "../errors";
import { useProfiles } from "../profile";
import { useStore } from "../store";
import { useAction } from "../store";
import {
  MonetizeStreamArgs,
  MonetizeStreamResult,
  MutationStatus,
} from "../types";
import { useMutation } from "../utils";

export const useMonetizeStream = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: MonetizeStreamArgs) => void;
  onSuccess?: (result: MonetizeStreamResult) => void;
}) => {
  const { dataverseConnector, address, profileIds, streamsMap } = useStore();
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

  const { getProfiles } = useProfiles();

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
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            streamId,
            profileId,
            streamContent,
            currency,
            amount,
            collectLimit,
            decryptionConditions,
          });
        }

        if (!profileId) {
          if (profileIds === undefined) {
            const gettedProfileIds = await getProfiles(address);
            if (gettedProfileIds.length === 0) {
              throw PROFILES_NOT_EXSIT;
            }
            profileId = gettedProfileIds[0];
          } else if (profileIds.length === 0) {
            throw PROFILES_NOT_EXSIT;
          } else {
            profileId = profileIds[0];
          }
        }

        if (!streamContent) {
          streamContent = streamsMap![streamId].streamContent;
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
    [
      address,
      streamsMap,
      profileIds,
      dataverseConnector,
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
    monetizedStreamContent: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    monetizeStream,
  };
};
