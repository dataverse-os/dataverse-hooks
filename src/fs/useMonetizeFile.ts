import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { PROFILES_NOT_EXSIT } from "../errors";
import { useProfiles } from "../profile";
import { useStore } from "../store";
import { useAction } from "../store";
import { MonetizeFileArgs, MonetizeFileResult, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useMonetizeFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: MonetizeFileArgs) => void;
  onSuccess?: (result: MonetizeFileResult) => void;
}) => {
  const { dataverseConnector, address, profileIds, filesMap } = useStore();
  const {
    actionUpdateFile,
    actionUpdateFoldersByFile,
    actionUpdateDataUnionsByFile,
  } = useAction();

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
  } = useMutation<MonetizeFileResult>();

  const { getProfiles } = useProfiles();

  const monetizeFile = useCallback(
    async (args: MonetizeFileArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(args);
        }

        if (args.datatokenVars) {
          if (!args.datatokenVars.profileId) {
            if (profileIds === undefined) {
              const gettedProfileIds = await getProfiles(address);
              if (gettedProfileIds.length === 0) {
                throw PROFILES_NOT_EXSIT;
              }
              args.datatokenVars.profileId = gettedProfileIds[0];
            } else if (profileIds.length === 0) {
              throw PROFILES_NOT_EXSIT;
            } else {
              args.datatokenVars.profileId = profileIds[0];
            }
          }
        }

        const monetizeResult: MonetizeFileResult =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.monetizeFile,
            params: args,
          });

        actionUpdateFile({
          fileId: args.fileId,
          ...monetizeResult,
        });
        actionUpdateFoldersByFile({
          ...monetizeResult.fileContent.file,
          content: monetizeResult.fileContent,
        });
        if (args.dataUnionId) {
          actionUpdateDataUnionsByFile({
            ...monetizeResult.fileContent.file,
            content: monetizeResult.fileContent,
          });
        }

        setStatus(MutationStatus.Succeed);
        setResult(monetizeResult);
        if (params?.onSuccess) {
          params.onSuccess(monetizeResult);
        }
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
      filesMap,
      profileIds,
      dataverseConnector,
      actionUpdateFile,
      actionUpdateFoldersByFile,
      actionUpdateDataUnionsByFile,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    monetizedFileContent: result,
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
