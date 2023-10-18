import { useCallback } from "react";

import {
  SYSTEM_CALL,
  StructuredFolderRecord,
} from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";
import { deepAssignRenameKey } from "../utils/object";

export const useLoadFolders = (params?: {
  onError?: (error: any) => void;
  onPending?: () => void;
  onSuccess?: (result?: StructuredFolderRecord) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionSetFolders, actionSetActionsMap } = useAction();

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
  } = useMutation<StructuredFolderRecord>();

  /**
   * read all folders when have no param otherwise will read all pubilc
   * folders
   * @returns
   */
  const loadFolders = useCallback(async () => {
    try {
      setStatus(MutationStatus.Pending);
      if (params?.onPending) {
        params.onPending();
      }

      const allFolders = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadFolderTrees,
      });

      actionSetFolders(
        deepAssignRenameKey(allFolders, [
          { mirror: "mirrorFile" },
        ]) as StructuredFolderRecord,
      );
      actionSetActionsMap(allFolders);

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
  }, [
    dataverseConnector,
    actionSetFolders,
    setStatus,
    setError,
    setResult,
    params?.onPending,
    params?.onError,
    params?.onSuccess,
  ]);

  return {
    folders: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    loadFolders,
  };
};
