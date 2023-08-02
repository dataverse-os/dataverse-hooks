import { Folder, Folders } from "@dataverse/js-dataverse";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";

export const useDeleteFolder = () => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

  /**
   * delete folder by streamId
   * @param folderId
   * @param reRender reRender page
   */
  const deleteFolder = ({
    folderId,
    reRender = true,
    syncImmediately,
  }: {
    folderId: string;
    reRender?: boolean;
    syncImmediately?: boolean;
  }): Promise<{ allFolders: Folders; currentFolder: Folder }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({
          method: SYSTEM_CALL.deleteFolder,
          params: {
            folderId,
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
    deleteFolder,
  };
};
