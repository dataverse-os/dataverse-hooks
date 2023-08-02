import { Folder, FolderType, Folders } from "@dataverse/js-dataverse";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { deepAssignRenameKey } from "../utils/object";

export const useCreateFolder = () => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

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
  }): Promise<{ allFolders: Folders; newFolder: Folder }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({
          method: SYSTEM_CALL.createFolder,
          params: {
            folderType: folderType as any,
            folderName,
            folderDescription,
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
    createFolder,
  };
};
