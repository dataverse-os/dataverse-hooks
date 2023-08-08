import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  Currency,
  MirrorFile,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";
import { DATAVERSE_CONNECTOR_UNDEFINED, PROFILES_NOT_EXSIT } from "../errors";
import { useProfiles } from "../profile";

export const useMonetizeFile = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: MirrorFile) => void;
}) => {
  const { state } = useStore();
  const { actionSetFolders, actionUpdateFoldersByFile } = useAction();

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
        if (!state.dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }

        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending();
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

        const { streamContent } = await state.dataverseConnector.runOS({
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
        if (onSuccess) {
          onSuccess(streamContent.file);
        }
        return streamContent.file;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [state.dataverseConnector, actionSetFolders, actionUpdateFoldersByFile],
  );

  return {
    monetizedFile: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    monetizeFile,
  };
};
