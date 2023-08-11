import { useCallback } from "react";

import {
  Currency,
  MirrorFile,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";

import { PROFILES_NOT_EXSIT } from "../errors";
import { useProfiles } from "../profile";
import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useMonetizeFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    indexFileId: string;
    profileId?: string | undefined;
    currency: Currency;
    amount: number;
    collectLimit: number;
  }) => void;
  onSuccess?: (result: MirrorFile) => void;
}) => {
  const { dataverseConnector, address, profileIds } = useStore();
  const { actionUpdateFoldersByFile } = useAction();

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

  const monetizeFile = useCallback(
    async ({
      indexFileId,
      profileId,
      currency,
      amount,
      collectLimit,
    }: {
      indexFileId: string;
      profileId?: string | undefined;
      currency: Currency;
      amount: number;
      collectLimit: number;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            indexFileId,
            profileId,
            currency,
            amount,
            collectLimit,
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

        const { streamContent } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.monetizeFile,
          params: {
            indexFileId,
            datatokenVars: {
              profileId,
              currency,
              amount,
              collectLimit,
            },
          },
        });

        actionUpdateFoldersByFile(streamContent.file);

        setResult(streamContent.file);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(streamContent.file);
        }
        return streamContent.file;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [
      address,
      profileIds,
      dataverseConnector,
      actionUpdateFoldersByFile,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    monetizedFile: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    monetizeFile,
  };
};
