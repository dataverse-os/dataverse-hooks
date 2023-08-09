import { SYSTEM_CALL, StructuredFolders } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useAction } from "../store";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useReadAllFolders = (params?: {
  onError?: (error: any) => void;
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
      if (params?.onPending) {
        params.onPending();
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
      if (params?.onSuccess) {
        params.onSuccess(allFolders);
      }
      return allFolders;
    } catch (error) {
      setError(error);
      setStatus(MutationStatus.Failed);
      if (params?.onError) {
        params.onError(error);
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
    setStatus,
    reset,
    readAllFolders,
  };
};
