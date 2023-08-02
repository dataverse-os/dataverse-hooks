import { Folder, FolderType, Folders } from "@dataverse/js-dataverse";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";

export const useUpdateFolder = () => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

  /**
   * change folder name by streamId
   * @param folderId
   * @param newFolderName Folder name
   * @param newFolderDescription Folder description
   * @param reRender reRender page
   * @param syncImmediately sync
   */
  const changeFolderBaseInfo = ({
    folderId,
    newFolderName,
    newFolderDescription,
    reRender = true,
    syncImmediately,
  }: {
    folderId: string;
    newFolderName: string;
    newFolderDescription?: string;
    reRender?: boolean;
    syncImmediately?: boolean;
  }): Promise<{ allFolders: Folders; currentFolder: Folder }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({
          method: SYSTEM_CALL.updateFolderBaseInfo,
          params: {
            folderId,
            newFolderName,
            newFolderDescription,
            syncImmediately,
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

  /**
   * change folder type by folderId (only public and privacy is supported)
   * @param folderId folder id
   * @param targetType folder type
   * @param reRender reRender page ?
   * @param sync sync ?
   */
  const changeFolderType = ({
    folderId,
    targetFolderType,
    reRender = true,
    syncImmediately = false,
  }: {
    folderId: string;
    targetFolderType: FolderType;
    reRender?: boolean;
    syncImmediately?: boolean;
  }): Promise<{ allFolders: Folders; currentFolder: Folder }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({
          method: SYSTEM_CALL.changeFolderType,
          params: {
            folderId,
            targetFolderType: targetFolderType as any,
            syncImmediately,
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
    changeFolderBaseInfo: useCallback(changeFolderBaseInfo, [
      state.dataverseConnector,
      actionSetFolders,
    ]),
    changeFolderType: useCallback(changeFolderType, [
      state.dataverseConnector,
      actionSetFolders,
    ]),
  };
};
