import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  SYSTEM_CALL,
  StructuredFolder,
  FolderType,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";

export const useCreateFolder = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: StructuredFolder) => void;
}) => {
  const { state } = useStore();
  const { actionSetFolders, actionUpdateFolders } = useAction();

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
   * create Folder
   * @param folderType Folder type
   * @param folderName Folder name
   * @param folderDescription Folder description
   * @param reRender reRender page ?
   */
  const createFolder = useCallback(
    async ({
      folderType,
      folderName,
      folderDescription,
      reRender = true,
    }: {
      folderType: FolderType;
      folderName: string;
      folderDescription?: string;
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

        const { allFolders, newFolder } = await state.dataverseConnector.runOS({
          method: SYSTEM_CALL.createFolder,
          params: {
            folderType: folderType as any,
            folderName,
            folderDescription,
          },
        });

        if (reRender) {
          actionSetFolders(
            deepAssignRenameKey(allFolders, [
              { mirror: "mirrorFile" },
            ]) as StructuredFolders,
          );
        } else {
          actionUpdateFolders(
            deepAssignRenameKey(newFolder, [
              { mirror: "mirrorFile" },
            ]) as StructuredFolder,
          );
        }

        setResult(newFolder);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(newFolder);
        }
        return newFolder;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [state.dataverseConnector, actionSetFolders, actionUpdateFolders],
  );

  return {
    createdFolder: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    createFolder,
  };
};
