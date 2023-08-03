import { SYSTEM_CALL, StructuredFolders } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { MutationStatus } from "../types";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useMutation } from "../utils";

export const useReadAllFolders = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: StructuredFolders) => void;
}) => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

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
   * @param reRender reRender page ?
   * @returns
   */
  const readAllFolders = async ({
    reRender = true,
  }: {
    reRender?: boolean;
  }) => {
    try {
      if (!state.dataverseConnector) {
        throw DATAVERSE_CONNECTOR_UNDEFINED;
      }

      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }

      const result = await state.dataverseConnector.runOS({
        method: SYSTEM_CALL.readFolders,
      });

      if (reRender) {
        actionSetFolders(
          deepAssignRenameKey(result, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolders,
        );
      }

      setResult(result);
      setStatus(MutationStatus.Succeed);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (error) {
      setError(error);
      setStatus(MutationStatus.Failed);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };

  return {
    readAllFolders: useCallback(readAllFolders, [
      state.dataverseConnector,
      actionSetFolders,
    ]),
    result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
  };
};
