import { MirrorFile, MirrorFileRecord } from "@dataverse/dataverse-connector";

import { ACTION_TYPE_NOT_EXSITS } from "../errors";
import {
  ActionType,
  CreateIndexFileResult,
  LoadFilesResult,
  RequiredByKeys,
  StateType,
} from "../types";

export const initialState: StateType = {
  appId: undefined,
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  profileIds: undefined,
  filesMap: undefined,
  collectedDatatokenFilesMap: undefined,
  foldersMap: undefined,
  dataUnionsMap: undefined,
  collectedUnionsMap: undefined,
  actionsMap: undefined,
};

export const reducer = (
  state: StateType,
  action: {
    type: ActionType;
    payload: any;
  },
) => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.ConnectWallet: {
      const { address, chain, wallet } = payload;

      return {
        ...state,
        address,
        chain,
        wallet,
      };
    }

    case ActionType.CreateCapability: {
      return {
        ...state,
        pkh: payload.pkh,
        appId: payload.appId,
      };
    }

    case ActionType.CreateFile: {
      const { pkh, appId, modelId, fileContent } =
        payload as CreateIndexFileResult;

      return {
        ...state,
        filesMap: {
          ...state.filesMap,
          [fileContent.file.fileId]: {
            pkh,
            appId,
            modelId,
            fileContent,
          },
        },
      };
    }

    case ActionType.LoadFiles: {
      const _payload = payload as LoadFilesResult;
      return {
        ...state,
        filesMap: _payload,
      };
    }

    case ActionType.LoadCollectedDatatokenFiles: {
      return {
        ...state,
        collectedDatatokenFilesMap: payload,
      };
    }

    case ActionType.UpdateFile: {
      const { fileId, fileContent } = payload;

      if (!state.filesMap) {
        return state;
      }

      return {
        ...state,
        filesMap: {
          ...state.filesMap,
          [fileId]: {
            ...state.filesMap[fileId],
            fileContent,
          },
        },
      };
    }

    case ActionType.LoadProfileIds: {
      return {
        ...state,
        profileIds: payload,
      };
    }

    case ActionType.CreateProfileId: {
      return {
        ...state,
        profileIds: state.profileIds
          ? [...state.profileIds, payload]
          : [payload],
      };
    }

    case ActionType.UpdateDatatokenInfo: {
      const { fileId, datatokenInfo } = payload;

      if (!state.filesMap) {
        throw state;
      }

      return {
        ...state,
        filesMap: {
          ...state.filesMap,
          [fileId]: {
            ...state.filesMap[fileId],
            datatokenInfo,
          },
        },
      };
    }

    case ActionType.UpdateDatatokenInfos: {
      const { fileIds, datatokenInfos } = payload;

      if (!state.filesMap) {
        throw state;
      }

      const filesMap = { ...state.filesMap };
      fileIds.forEach((fileId: string, index: number) => {
        filesMap[fileId] = {
          ...filesMap[fileId],
          datatokenInfo: datatokenInfos[index],
        };
      });

      return {
        ...state,
        filesMap,
      };
    }

    case ActionType.SetFolders: {
      return {
        ...state,
        foldersMap: payload,
      };
    }

    case ActionType.UpdateFolders: {
      const folders = payload instanceof Array ? payload : [payload];

      if (!state.foldersMap) {
        return state;
      }

      return {
        ...state,
        foldersMap: {
          ...state.foldersMap,
          ...Object.assign(
            {},
            ...folders.map(folder => {
              return {
                [folder.folderId]: folder,
              };
            }),
          ),
        },
      };
    }

    case ActionType.DeleteFolder: {
      if (!state.foldersMap) {
        return state;
      }
      const foldersMap = { ...state.foldersMap };
      delete foldersMap[payload];
      return {
        ...state,
        foldersMap,
      };
    }

    case ActionType.UpdateFoldersByFile: {
      if (!state.foldersMap) {
        return state;
      }
      const foldersMap = { ...state.foldersMap };
      Object.keys(foldersMap).forEach(folderId => {
        const folder = foldersMap![folderId];
        Object.keys(folder.mirrorRecord).forEach(mirrorId => {
          const mirror = folder.mirrorRecord[mirrorId];
          if (mirror.mirrorFile.fileId === payload.fileId) {
            foldersMap![folderId].mirrorRecord[mirrorId].mirrorFile = payload;
          }
        });
      });

      return {
        ...state,
        foldersMap,
      };
    }

    case ActionType.SetDataUnions: {
      return {
        ...state,
        dataUnionsMap: payload,
      };
    }

    case ActionType.UpdateDataUnion: {
      return {
        ...state,
        dataUnionsMap: {
          ...state.dataUnionsMap,
          [payload.folderId]: payload,
        },
      };
    }

    case ActionType.DeleteDataUnion: {
      if (!state.dataUnionsMap) {
        return state;
      }
      const dataUnionsMap = { ...state.dataUnionsMap };
      delete dataUnionsMap[payload];
      return {
        ...state,
        dataUnionsMap,
      };
    }

    case ActionType.UpdateDataUnionsByFile: {
      if (!state.dataUnionsMap) {
        return state;
      }
      const dataUnionsMap = { ...state.dataUnionsMap };
      Object.keys(dataUnionsMap).forEach(folderId => {
        const dataUnion = dataUnionsMap![folderId];
        Object.keys(dataUnion.mirrorRecord).forEach(mirrorId => {
          const mirror = dataUnion.mirrorRecord[mirrorId];
          if (mirror.mirrorFile.fileId === payload.fileId) {
            dataUnionsMap![folderId].mirrorRecord[mirrorId].mirrorFile =
              payload;
          }
        });
      });

      return {
        ...state,
        dataUnionsMap,
      };
    }

    case ActionType.UpdateDataUnionsByDeleteFiles: {
      if (!state.dataUnionsMap) {
        return state;
      }
      const dataUnionsMap = { ...state.dataUnionsMap };
      Object.keys(dataUnionsMap).forEach(folderId => {
        const dataUnion = dataUnionsMap![folderId];
        Object.keys(dataUnion.mirrorRecord).forEach(mirrorId => {
          const mirror = dataUnion.mirrorRecord[mirrorId];
          if ((payload as string[]).includes(mirror.mirrorId)) {
            delete dataUnionsMap![folderId].mirrorRecord[mirrorId];
          }
        });
      });

      return {
        ...state,
        dataUnionsMap,
      };
    }

    case ActionType.UpdateActionsMap: {
      const filesMap: MirrorFileRecord = payload;
      const actionsMap: Record<
        string,
        RequiredByKeys<MirrorFile, "action" | "relationId">[]
      > = {};

      Object.keys(filesMap).forEach(mirrorId => {
        const file = filesMap[mirrorId];
        if (file.action && file.relationId) {
          actionsMap[file.relationId] = actionsMap[file.relationId] || [];
          actionsMap[file.relationId].push({
            ...file,
            action: file.action,
            relationId: file.relationId,
          });
        }
      });

      return {
        ...state,
        actionsMap,
      };
    }

    case ActionType.SetCollectedDataUnions: {
      return {
        ...state,
        collectedUnionsMap: payload,
      };
    }

    default: {
      throw ACTION_TYPE_NOT_EXSITS;
    }
  }
};
