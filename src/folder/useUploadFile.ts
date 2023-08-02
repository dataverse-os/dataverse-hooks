import { Folder, Folders } from "@dataverse/js-dataverse";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import { SYSTEM_CALL, StorageProvider } from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";

export const useUploadFile = () => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

  /**
   * add mirror to folder by folderId
   * @param folderId folder id
   * @param newMirrorsInfo
   * @param reRender reRender page ?
   * @param syncImmediately sync ?
   */
  const uploadFile = ({
    folderId,
    fileBase64,
    fileName,
    encrypted,
    storageProvider,
    reRender = true,
  }: {
    folderId: string;
    fileBase64: string;
    fileName: string;
    encrypted: boolean;
    storageProvider: StorageProvider;
    reRender: boolean;
  }): Promise<{
    allFolders: Folders;
    currentFolder: Folder;
  }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({
          method: SYSTEM_CALL.uploadFile,
          params: {
            folderId,
            fileBase64,
            fileName,
            encrypted,
            storageProvider,
          },
        })
        .then(result => {
          if (reRender) {
            actionSetFolders(
              deepAssignRenameKey(result.allFolders, [
                { mirror: "mirrorFile" },
              ]) as Folders,
            );
          }
          resolve(result);
        })
        .catch(e => {
          reject(e);
        });
    });

  return {
    uploadFile: useCallback(uploadFile, [
      state.dataverseConnector,
      actionSetFolders,
    ]),
  };
};
