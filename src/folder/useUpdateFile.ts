import { Folder, Folders } from "@dataverse/js-dataverse";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  FileInfo,
  MirrorFile,
  MirrorFiles,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";

export const useUpdateFile = () => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

  /**
   * update mirror by both folderId and mirrorId
   * @param model
   * @param mirrorId mirror id
   * @param newName new mirror content
   * @param newNote new mirror note
   * @param newTags new mirror tags
   * @param reRender reRender page ?
   * @param sync sync ?
   */
  const updateFileBaseInfo = ({
    indexFileId,
    fileInfo,
    reRender = true,
    syncImmediately = false,
  }: {
    indexFileId: string;
    fileInfo: FileInfo;
    reRender?: boolean;
    syncImmediately?: boolean;
  }): Promise<{
    allFolders: Folders;
    currentFolder: Folder;
    currentFile: MirrorFile;
  }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({
          method: SYSTEM_CALL.updateFileBaseInfo,
          params: {
            indexFileId,
            fileInfo,
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
   * move mirror from sourceFolder to targetFolder by id
   * @param sourceMirrorIds source mirrors id
   * @param targetFolderId target folder id
   * @param reRender reRender page ?
   * @param syncImmediately sync ?
   */
  const moveFiles = ({
    sourceIndexFileIds,
    targetFolderId,
    reRender = true,
    syncImmediately = false,
  }: {
    sourceIndexFileIds: string[];
    targetFolderId: string;
    reRender?: boolean;
    syncImmediately?: boolean;
  }): Promise<{
    allFolders: Folders;
    sourceFolders: Folders;
    targetFolder: Folder;
    movedFiles: MirrorFiles;
  }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({
          method: SYSTEM_CALL.moveFiles,
          params: {
            targetFolderId,
            sourceIndexFileIds,
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
    updateFileBaseInfo,
    moveFiles,
  };
};
