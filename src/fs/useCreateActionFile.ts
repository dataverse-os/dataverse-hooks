import { useCallback } from "react";

import {
  MirrorFile,
  SYSTEM_CALL,
  StructuredFolder,
} from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { CreateActionFileArgs, MutationStatus } from "../types";
import { useMutation } from "../utils";
import { deepAssignRenameKey } from "../utils/object";

export const useCreateActionFile = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error: any) => void;
  onPending?: (args: CreateActionFileArgs) => void;
  onSuccess?: (result: MirrorFile) => void;
}) => {
  const { dataverseConnector } = useStore();
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
  } = useMutation<MirrorFile>();

  const createActionFile = useCallback(
    async (args: CreateActionFileArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending(args);
        }

        const { newFile, currentFolder } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.createActionFile,
          params: { ...args },
        });

        actionUpdateFolders(
          deepAssignRenameKey(currentFolder, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolder,
        );

        setResult(newFile);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(newFile);
        }
        return newFile;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [
      dataverseConnector,
      actionUpdateFolders,
      setStatus,
      setError,
      setResult,
      onPending,
      onError,
      onSuccess,
    ],
  );

  return {
    createdActionFile: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    createActionFile,
  };
};
