import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useStore } from "../store";
import { Folders } from "@dataverse/js-dataverse";
import { useAction } from "../store/useAction";
import { deepAssignRenameKey } from "../utils/object";

export const useReadFolders = () => {
  const { state } = useStore();
  const { actionSetFolders } = useAction();

  /**
   * read all folders when have no param otherwise will read all pubilc
   * folders
   * @param reRender reRender page ?
   * @returns
   */
  const readAllFolders = async ({
    reRender = true,
  }: {
    reRender?: boolean;
  }): Promise<{ folders: Folders }> =>
    new Promise((resolve, reject) => {
      state.dataverseConnector
        ?.runOS({ method: SYSTEM_CALL.readFolders })
        .then(async folders => {
          if (reRender) {
            actionSetFolders(
              deepAssignRenameKey(folders, [
                { mirror: "mirrorFile" },
              ]) as Folders,
            );
          }
          resolve({ folders });
        })
        .catch(e => {
          reject(e);
        });
    });

  return {
    readAllFolders,
  };
};
