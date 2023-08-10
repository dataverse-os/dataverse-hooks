import { useStore } from "../store";
import { useAction } from "../store";
import {
  MirrorFile,
  SYSTEM_CALL,
  StorageProvider,
  StructuredFolder,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";
import { useMutation } from "../utils";
import { MutationStatus } from "../types";

export const useUploadFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    folderId?: string;
    fileBase64: string;
    fileName: string;
    encrypted: boolean;
    storageProvider: StorageProvider;
    reRender?: boolean;
  }) => void;
  onSuccess?: (result: MirrorFile) => void;
}) => {
  const { dataverseConnector } = useStore();
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
   * add mirror to folder by folderId
   * @param folderId folder id
   * @param newMirrorsInfo
   * @param reRender reRender page ?
   * @param syncImmediately sync ?
   */
  const uploadFile = useCallback(
    async ({
      folderId,
      fileBase64,
      fileName,
      encrypted,
      storageProvider,
      reRender = true,
    }: {
      folderId?: string;
      fileBase64: string;
      fileName: string;
      encrypted: boolean;
      storageProvider: StorageProvider;
      reRender?: boolean;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            folderId,
            fileBase64,
            fileName,
            encrypted,
            storageProvider,
            reRender,
          });
        }

        const { allFolders, currentFolder, newFile } =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.uploadFile,
            params: {
              folderId,
              fileBase64,
              fileName,
              encrypted,
              storageProvider,
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
            deepAssignRenameKey(currentFolder, [
              { mirror: "mirrorFile" },
            ]) as StructuredFolder,
          );
        }

        setResult(newFile);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(newFile);
        }
        return newFile;
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
      actionSetFolders,
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
    uploadedFile: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    uploadFile,
  };
};