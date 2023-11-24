import { useCallback } from "react";

import { MirrorFile, SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, RequiredByKeys } from "../types";
import { useMutation } from "../utils";

export const useLoadActionFiles = (params?: {
  appId?: string;
  onError?: (error: any) => void;
  onPending?: () => void;
  onSuccess?: (
    result?: Record<
      string,
      RequiredByKeys<MirrorFile, "action" | "relationId">
    >,
  ) => void;
}) => {
  const {
    dataverseConnector,
    foldersMap,
    actionsMap: actionsMapCache,
  } = useStore();
  const { actionLoadActions } = useAction();

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
  } =
    useMutation<
      Record<string, RequiredByKeys<MirrorFile, "action" | "relationId">>
    >();

  const loadActionFiles = useCallback(
    async (modelId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }

        const actionFiles = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadFilesBy,
          params: {
            modelId,
          },
        });

        const filesMap = Object.fromEntries<
          RequiredByKeys<MirrorFile, "action" | "relationId">
        >(
          Object.entries(actionFiles).map(([fileId, { fileContent, pkh }]) => [
            fileId,
            { ...fileContent.file, controller: pkh, fileId },
          ]),
        );

        actionLoadActions(filesMap);

        setResult(filesMap);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(filesMap);
        }
        return filesMap;
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
      actionsMapCache,
      actionLoadActions,
      setStatus,
      setError,
      setResult,
      params?.appId,
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
    loadActionFiles,
  };
};
