import { useCallback } from "react";

import { SYSTEM_CALL, StructuredFolder } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import {
  UpdateActionFileArgs,
  UpdateActionFileResult,
  MutationStatus,
} from "../types";
import { useMutation } from "../utils";
import { deepAssignRenameKey } from "../utils/object";

export const useUpdateActionFile = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error: any) => void;
  onPending?: (args: UpdateActionFileArgs) => void;
  onSuccess?: (result: UpdateActionFileResult) => void;
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
  } = useMutation<UpdateActionFileResult>();

  const updateActionFile = useCallback(
    async (args: UpdateActionFileArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending(args);
        }

        const { currentFile, currentFolder } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.updateActionFile,
          params: { ...args },
        });

        actionUpdateFolders(
          deepAssignRenameKey(currentFolder, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolder,
        );

        setResult(currentFile);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(currentFile);
        }
        return currentFile;
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
    updatedActionFile: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    updateActionFile,
  };
};
