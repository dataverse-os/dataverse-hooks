import { ACTION_TYPE_NOT_EXSITS } from "../errors";
import {
  ActionType,
  CreateIndexFileResult,
  LoadFilesResult,
  StateType,
} from "../types";

export const initialState: StateType = {
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  profileIds: undefined,
  filesMap: undefined,
  foldersMap: undefined,
  dataUnionsMap: undefined,
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
        pkh: payload,
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
      const _state = {
        ...state,
      };
      if (!_state.foldersMap) {
        return _state;
      }
      delete _state.foldersMap[payload];
      return _state;
    }

    case ActionType.UpdateFoldersByFile: {
      const _state = { ...state };
      if (!_state.foldersMap) {
        return _state;
      }
      Object.keys(_state.foldersMap).forEach(folderId => {
        const folder = _state.foldersMap![folderId];
        Object.keys(folder.mirrorRecord).forEach(mirrorId => {
          const mirror = folder.mirrorRecord[mirrorId];
          if (mirror.mirrorFile.fileId === payload.fileId) {
            _state.foldersMap![folderId].mirrorRecord[mirrorId].mirrorFile =
              payload;
          }
        });
      });

      return _state;
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
      const _state = {
        ...state,
      };
      if (!_state.dataUnionsMap) {
        return _state;
      }
      delete _state.dataUnionsMap[payload];
      return _state;
    }

    case ActionType.UpdateDataUnionsByFile: {
      const _state = { ...state };
      if (!_state.dataUnionsMap) {
        return _state;
      }
      Object.keys(_state.dataUnionsMap).forEach(folderId => {
        const dataUnion = _state.dataUnionsMap![folderId];
        Object.keys(dataUnion.mirrorRecord).forEach(mirrorId => {
          const mirror = dataUnion.mirrorRecord[mirrorId];
          if (mirror.mirrorFile.fileId === payload.fileId) {
            _state.dataUnionsMap![folderId].mirrorRecord[mirrorId].mirrorFile =
              payload;
          }
        });
      });

      return _state;
    }

    default: {
      throw ACTION_TYPE_NOT_EXSITS;
    }
  }
};
