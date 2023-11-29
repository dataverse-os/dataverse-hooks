import { useCallback } from "react";

import {
  MirrorFile,
  ModelName,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";
import { Model } from "@dataverse/model-parser";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, RequiredByKeys } from "../types";
import { useMutation } from "../utils";

export const useLoadActionFiles = (params: {
  model: Model;
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

  const loadActionFiles = useCallback(async () => {
    try {
      setStatus(MutationStatus.Pending);
      if (params?.onPending) {
        params.onPending();
      }

      if (params.model.modelName !== ModelName.actionFile) {
        throw new Error("model name must be actionFile");
      }

      const modelId =
        params.model.streams[params.model.streams.length - 1].modelId;

      const actionFiles = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadFilesBy,
        params: {
          modelId,
        },
      });

      const filesMap = Object.fromEntries<
        RequiredByKeys<MirrorFile, "action" | "relationId">
      >(
        Object.entries(actionFiles).map(([fileId, file]) => [
          fileId,
          {
            fileId,
            controller: file.pkh,
            ...file.fileContent.file,
            content: file.fileContent.content,
          },
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
  }, [
    dataverseConnector,
    foldersMap,
    actionsMapCache,
    actionLoadActions,
    setStatus,
    setError,
    setResult,
    params?.onPending,
    params?.onError,
    params?.onSuccess,
  ]);

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
