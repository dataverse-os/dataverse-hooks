import { useCallback } from "react";

import { MirrorFile } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, RequiredByKeys } from "../types";
import { useMutation } from "../utils";

export const useLoadFileActions = (params?: {
  onError?: (error: any) => void;
  onPending?: () => void;
  onSuccess?: (
    result?: RequiredByKeys<MirrorFile, "action" | "relationId">[],
  ) => void;
}) => {
  const { dataverseConnector, foldersMap, actionsMap } = useStore();
  const { actionSetActionsMap } = useAction();

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
  } = useMutation<RequiredByKeys<MirrorFile, "action" | "relationId">[]>();

  const loadFileActions = useCallback(
    async (fileId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }

        if (!actionsMap || !actionsMap[fileId]) {
          actionSetActionsMap(foldersMap || {});
        }

        setResult(actionsMap?.[fileId]);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(actionsMap?.[fileId]);
        }
        return actionsMap?.[fileId];
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
      dataverseConnector,
      foldersMap,
      actionsMap,
      actionSetActionsMap,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    actions: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    loadFileActions,
  };
};
