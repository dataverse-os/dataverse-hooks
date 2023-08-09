import { SYSTEM_CALL, StructuredFolders } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useAction } from "../store";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useReadAllFolders = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: StructuredFolders) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionSetFolders, actionUpdateFolders } = useAction();

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

  /**
   * read all folders when have no param otherwise will read all pubilc
   * folders
   * @returns
   */
  const readAllFolders = useCallback(async () => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }

      const allFolders = await dataverseConnector.runOS({
        method: SYSTEM_CALL.readFolders,
      });

      actionSetFolders(
        deepAssignRenameKey(allFolders, [
          { mirror: "mirrorFile" },
        ]) as StructuredFolders,
      );

      setResult(allFolders);
      setStatus(MutationStatus.Succeed);
      if (onSuccess) {
        onSuccess(allFolders);
      }
      return allFolders;
    } catch (error) {
      setError(error);
      setStatus(MutationStatus.Failed);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }, [actionSetFolders, actionUpdateFolders]);

  return {
    allFolders: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    readAllFolders,
  };
};
