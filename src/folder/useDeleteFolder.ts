import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  SYSTEM_CALL,
  StructuredFolder,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { MutationStatus } from "../types";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useMutation } from "../utils";

export const useDeleteFolder = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: StructuredFolder) => void;
}) => {
  const { state } = useStore();
  const { actionSetFolders, actionDeleteFolder } = useAction();

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
   * delete folder by streamId
   * @param folderId
   * @param reRender reRender page
   */
  const deleteFolder = useCallback(
    async ({
      folderId,
      reRender = true,
      syncImmediately,
    }: {
      folderId: string;
      reRender?: boolean;
      syncImmediately?: boolean;
    }) => {
      try {
        if (!state.dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }

        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending();
        }

        const { allFolders, currentFolder } =
          await state.dataverseConnector.runOS({
            method: SYSTEM_CALL.deleteFolder,
            params: {
              folderId,
              syncImmediately,
            },
          });

        if (reRender) {
          actionSetFolders(
            deepAssignRenameKey(allFolders, [
              { mirror: "mirrorFile" },
            ]) as StructuredFolders,
          );
        } else {
          actionDeleteFolder(currentFolder.folderId);
        }

        setResult(currentFolder);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(currentFolder);
        }
        return currentFolder;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [state.dataverseConnector, actionSetFolders, actionDeleteFolder],
  );

  return {
    deletedFolder: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    deleteFolder,
  };
};