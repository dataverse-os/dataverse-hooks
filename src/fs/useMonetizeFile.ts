import { useCallback } from "react";

import {
  DatatokenType,
  DatatokenVars,
  MirrorFile,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";
import { DataTokenParams } from "@dataverse/dataverse-contracts-sdk/dist/cjs/data-token/types";

import { PROFILES_NOT_EXSIT } from "../errors";
import { useProfiles } from "../profile";
import { useStore } from "../store";
import { useAction } from "../store";
import {
  MonetizeFileArgs,
  MonetizeFileResult,
  MutationStatus,
  RequiredByKeys,
} from "../types";
import { useMutation } from "../utils";

export const useMonetizeFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: MonetizeFileArgs) => void;
  onSuccess?: (result: MonetizeFileResult) => void;
}) => {
  const { dataverseConnector, address, profileIds, actionFilesMap } =
    useStore();
  const {
    actionUpdateFile,
    actionUpdateAction,
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

        if (
          args.datatokenVars &&
          args.datatokenVars.type === DatatokenType.Lens
        ) {
          const datatokenVars = args.datatokenVars as DatatokenVars &
            DataTokenParams["Lens"];
          if (!datatokenVars.profileId) {
            if (profileIds === undefined) {
              const gettedProfileIds = await getProfiles({
                chainId: datatokenVars.chainId,
                accountAddress: address!,
              });
              if (gettedProfileIds.length === 0) {
                throw PROFILES_NOT_EXSIT;
              }
              datatokenVars.profileId = gettedProfileIds[0];
            } else if (profileIds.length === 0) {
              throw PROFILES_NOT_EXSIT;
            } else {
              datatokenVars.profileId = profileIds[0];
            }
          }
          args.datatokenVars = datatokenVars;
        }

        const monetizeResult: MonetizeFileResult =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.monetizeFile,
            params: args,
          });

        if (
          actionFilesMap &&
          actionFilesMap[monetizeResult.fileContent.file.fileId]
        ) {
          actionUpdateAction({
            ...monetizeResult.fileContent,
            ...monetizeResult.fileContent.file,
            content: monetizeResult.fileContent.content,
          } as RequiredByKeys<MirrorFile, "action" | "relationId">);
        }

        actionUpdateFile({
          ...monetizeResult,
          ...monetizeResult.fileContent.file,
          content: monetizeResult.fileContent.content,
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
      profileIds,
      dataverseConnector,
      actionFilesMap,
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
