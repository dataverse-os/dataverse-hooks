import { Folders } from "@dataverse/js-dataverse";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import { MirrorFiles, SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";
import { useCallback } from "react";

export const useDeleteFile = () => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

  /**
   * remove mirror by both folderId and mirrorId
   * @param mirrorIds mirrors id
   * @param reRender reRender page ?
   * @param syncImmediately sync ?
   */
  const removeFiles = ({
    indexFileIds,
    reRender = true,
    syncImmediately = false,
  }: {
    indexFileIds: string[];
    reRender?: boolean;
    syncImmediately?: boolean;
  }): Promise<{
    allFolders: Folders;
    removedFiles: MirrorFiles;
    sourceFolders: Folders;
  }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({
          method: SYSTEM_CALL.removeFiles,
          params: {
            indexFileIds,
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
    removeFiles: useCallback(removeFiles, [
      state.dataverseConnector,
      actionSetFolders,
    ]),
  };
};
