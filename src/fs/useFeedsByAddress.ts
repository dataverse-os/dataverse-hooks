import { useCallback } from "react";

import {
  MirrorFile,
  ModelName,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";
import { Model } from "@dataverse/model-parser";

import { useStore } from "../store";
import { useAction } from "../store";
import {
  LoadFilesByArgs,
  LoadFilesByResult,
  MutationStatus,
  RequiredByKeys,
} from "../types";
import { useMutation } from "../utils";

export const useFeedsByAddress = (params: {
  model: Model;
  onError?: (error: any) => void;
  onPending?: (args: LoadFilesByArgs) => void;
  onSuccess?: (result: LoadFilesByResult) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionLoadFiles, actionLoadActions } = useAction();

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
  } = useMutation<LoadFilesByResult>();

  const loadFeedsByAddress = useCallback(
    async (pkh: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({ pkh, model: params.model });
        }

        const modelId =
          params.model.streams[params.model.streams.length - 1].modelId;

        const files: LoadFilesByResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadFilesBy,
          params: {
            modelId,
            pkh,
          },
        });

        if (params.model.modelName !== ModelName.indexFile) {
          if (params.model.modelName === ModelName.actionFile) {
            const filesMap = Object.fromEntries<
              RequiredByKeys<MirrorFile, "action" | "relationId">
            >(
              Object.values(files).map(file => ({
                ...file.fileContent.file,
                content: file.fileContent.content,
              })),
            );
            actionLoadActions(filesMap);
          } else {
            actionLoadFiles(files, modelId);
          }
        }

        setStatus(MutationStatus.Succeed);
        setResult(files);
        if (params?.onSuccess) {
          params.onSuccess(files);
        }
        return files;
      } catch (error) {
        setStatus(MutationStatus.Failed);
        setError(error);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [
      dataverseConnector,
      actionLoadFiles,
      actionLoadActions,
      setStatus,
      setError,
      setResult,
      params.model,
      params.onPending,
      params.onError,
      params.onSuccess,
    ],
  );

  return {
    feeds: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    loadFeedsByAddress,
  };
};
