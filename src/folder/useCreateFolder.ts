import { useStore } from "../store";
import { useAction } from "../store";
import {
  SYSTEM_CALL,
  StructuredFolder,
  FolderType,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";

export const useCreateFolder = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    folderType: FolderType;
    folderName: string;
    folderDescription?: string;
  }) => void;
  onSuccess?: (result?: StructuredFolder) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionUpdateFolders } = useAction();

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
    }: {
      folderType: FolderType;
      folderName: string;
      folderDescription?: string;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            folderType,
            folderName,
            folderDescription,
            // reRender,
          });
        }

        const { newFolder } = await dataverseConnector.runOS({
          method: SYSTEM_CALL.createFolder,
          params: {
            folderType: folderType as any,
            folderName,
            folderDescription,
          },
        });

        actionUpdateFolders(
          deepAssignRenameKey(newFolder, [
            { mirror: "mirrorFile" },
          ]) as StructuredFolder,
        );

        setResult(newFolder);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(newFolder);
        }
        return newFolder;
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
      actionUpdateFolders,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    createdFolder: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    createFolder,
  };
};
