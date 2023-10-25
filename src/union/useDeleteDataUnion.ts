import { useCallback } from "react";

import { SYSTEM_CALL, StructuredFolder } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { DeleteDataUnionArgs, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useDeleteDataUnion = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: DeleteDataUnionArgs) => void;
  onSuccess?: (result: StructuredFolder) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionDeleteDataUnion } = useAction();

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
   * delete folder by streamId
   * @param folderId
   * @param reRender reRender page
   */
  const deleteDataUnion = useCallback(
    async (args: DeleteDataUnionArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(args);
        }

        const { currentDataUnion } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.deleteDataUnion,
          params: { ...args },
        });

        actionDeleteDataUnion(currentDataUnion.folderId);

        setResult(currentDataUnion);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(currentDataUnion);
        }
        return currentDataUnion;
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
      actionDeleteDataUnion,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    deletedDataUnion: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    deleteDataUnion,
  };
};
