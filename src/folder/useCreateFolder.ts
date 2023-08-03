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
  onSuccess?: (result?: {
    allFolders: StructuredFolders;
    newFolder: StructuredFolder;
  }) => void;
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
   * create Folder
   * @param folderType Folder type
   * @param folderName Folder name
   * @param folderDescription Folder description
   * @param reRender reRender page ?
   */
  const createFolder = async ({
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

      const result = await state.dataverseConnector.runOS({
        method: SYSTEM_CALL.createFolder,
        params: {
          folderType: folderType as any,
          folderName,
          folderDescription,
        },
      });

      if (reRender) {
        actionSetFolders(
          deepAssignRenameKey(result.allFolders, [
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
    createFolder: useCallback(createFolder, [
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
