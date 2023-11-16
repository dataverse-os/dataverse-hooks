import { useCallback } from "react";

import {
  DAppInfo,
  MirrorFile,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, RequiredByKeys } from "../types";
import { useMutation } from "../utils";

export const useLoadFileActions = (params?: {
  appId?: string;
  onError?: (error: any) => void;
  onPending?: () => void;
  onSuccess?: (
    result?: RequiredByKeys<MirrorFile, "action" | "relationId">[],
  ) => void;
}) => {
  const {
    appId: appIdCache,
    dataverseConnector,
    foldersMap,
    actionsMap: actionsMapCache,
  } = useStore();
  const { actionUpdateActionsMap } = useAction();

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

        const appInfo = (await dataverseConnector.getDAppInfo(
          params?.appId || appIdCache!,
        )) as DAppInfo;
        const actionFiles = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadFilesBy,
          params: {
            modelId: appInfo.models.find(
              model => model.modelName === "actionFile",
            )!.streams[0].modelId,
          },
        });

        const filesMap = Object.fromEntries<MirrorFile>(
          Object.values(actionFiles).map(file => [
            file.fileContent.file.fileId,
            {
              ...file.fileContent.file,
              content: file.fileContent.content,
            },
          ]),
        );
        const actionsMap: Record<
          string,
          RequiredByKeys<MirrorFile, "action" | "relationId">[]
        > = {};
        Object.keys(filesMap).forEach(mirrorId => {
          const file = filesMap[mirrorId];
          if (file.action && file.relationId) {
            actionsMap[file.relationId] = actionsMap[file.relationId] || [];
            actionsMap[file.relationId].push({
              ...file,
              action: file.action,
              relationId: file.relationId,
            });
          }
        });
        actionUpdateActionsMap(filesMap);

        setResult(actionsMap?.[fileId] || actionsMapCache?.[fileId] || []);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(
            actionsMap?.[fileId] || actionsMapCache?.[fileId] || [],
          );
        }
        return actionsMap?.[fileId] || actionsMapCache?.[fileId] || [];
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
      appIdCache,
      actionsMapCache,
      actionUpdateActionsMap,
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
    loadFileActions,
  };
};
