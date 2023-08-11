import { useCallback } from "react";

import {
  SYSTEM_CALL,
  StructuredFolder,
  Currency,
} from "@dataverse/dataverse-connector";

import { PROFILES_NOT_EXSIT } from "../errors";
import { useProfiles } from "../profile";
import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";
import { deepAssignRenameKey } from "../utils/object";

export const useMonetizeFolder = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    folderId: string;
    folderDescription: string;
    profileId?: string | undefined;
    currency: Currency;
    amount: number;
    collectLimit: number;
  }) => void;
  onSuccess?: (result: StructuredFolder) => void;
}) => {
  const { dataverseConnector, address, profileIds } = useStore();
  const { actionUpdateFolders } = useAction();

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

  const monetizeFolder = useCallback(
    async ({
      folderId,
      folderDescription,
      profileId,
      currency,
      amount,
      collectLimit,
    }: {
      folderId: string;
      folderDescription: string;
      profileId?: string | undefined;
      currency: Currency;
      amount: number;
      collectLimit: number;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            folderId,
            folderDescription,
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

        const { currentFolder } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.monetizeFolder,
          params: {
            folderId,
            folderDescription,
            datatokenVars: {
              profileId,
              currency,
              amount,
              collectLimit,
            },
          },
        });

        actionUpdateFolders(
          deepAssignRenameKey(currentFolder, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolder,
        );

        setResult(currentFolder);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(currentFolder);
        }
        return currentFolder;
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
      actionUpdateFolders,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    monetizedFolder: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    monetizeFolder,
  };
};
