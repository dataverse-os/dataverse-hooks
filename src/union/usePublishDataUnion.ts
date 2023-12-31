import { useCallback } from "react";

import { SYSTEM_CALL, StructuredFolder } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { PublishDataUnionArgs, MutationStatus } from "../types";
import { useMutation } from "../utils";
import { deepAssignRenameKey } from "../utils/object";

export const usePublishDataUnion = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: PublishDataUnionArgs) => void;
  onSuccess?: (result?: StructuredFolder) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionUpdateDataUnion } = useAction();

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
  } = useMutation<StructuredFolder>();

  /**
   * create Folder
   * @param folderType Folder type
   * @param folderName Folder name
   * @param folderDescription Folder description
   * @param reRender reRender page ?
   */
  const publishDataUnion = useCallback(
    async (args: PublishDataUnionArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(args);
        }

        const { newDataUnion } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.publishDataUnion,
          params: { ...args },
        });

        actionUpdateDataUnion(
          deepAssignRenameKey(newDataUnion, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolder,
        );

        setResult(newDataUnion);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(newDataUnion);
        }
        return newDataUnion;
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
      actionUpdateDataUnion,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    publishedDataUnion: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    publishDataUnion,
  };
};
