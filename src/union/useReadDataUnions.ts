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

export const useReadDataUnions = (params?: {
  onError?: (error: any) => void;
  onPending?: () => void;
  onSuccess?: (result?: StructuredFolderRecord) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionSetDataUnions } = useAction();

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
  const readDataUnions = useCallback(async () => {
    try {
      setStatus(MutationStatus.Pending);
      if (params?.onPending) {
        params.onPending();
      }

      const dataUnions = await dataverseConnector.runOS({
        method: SYSTEM_CALL.readDataUnions,
      });

      actionSetDataUnions(
        deepAssignRenameKey(dataUnions, [
          { mirror: "mirrorFile" },
        ]) as StructuredFolderRecord,
      );

      setResult(dataUnions);
      setStatus(MutationStatus.Succeed);
      if (params?.onSuccess) {
        params.onSuccess(dataUnions);
      }
      return dataUnions;
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
    actionSetDataUnions,
    setStatus,
    setError,
    setResult,
    params?.onPending,
    params?.onError,
    params?.onSuccess,
  ]);

  return {
    dataUnions: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    readDataUnions,
  };
};
