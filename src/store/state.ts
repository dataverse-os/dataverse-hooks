import { Mirrors } from "@dataverse/dataverse-connector";

import {
  ACTION_TYPE_NOT_EXSITS,
  FOLDERS_MAP_UNDEFINED,
  STREAMS_MAP_UNDEFINED,
} from "../errors";
import { ActionType, StateType } from "../types";

export const initialState: StateType = {
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  profileIds: undefined,
  streamsMap: undefined,
  foldersMap: undefined,
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

    case ActionType.CreateStream: {
      const { streamId, pkh, appId, modelId, streamContent } = payload;

      return {
        ...state,
        streamsMap: {
          ...state.streamsMap,
          [streamId]: {
            pkh,
            appId,
            modelId,
            streamContent,
          },
        },
      };
    }

    case ActionType.LoadStreams: {
      return {
        ...state,
        streamsMap: payload,
      };
    }

    case ActionType.UpdateStream: {
      const { streamId, streamContent } = payload;

      if (!state.streamsMap) {
        throw STREAMS_MAP_UNDEFINED;
      }

      return {
        ...state,
        streamsMap: {
          ...state.streamsMap,
          [streamId]: {
            ...state.streamsMap[streamId],
            streamContent,
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
      const { streamId, datatokenInfo } = payload;

      if (!state.streamsMap) {
        throw STREAMS_MAP_UNDEFINED;
      }

      return {
        ...state,
        streamsMap: {
          ...state.streamsMap,
          [streamId]: {
            ...state.streamsMap[streamId],
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
        throw FOLDERS_MAP_UNDEFINED;
      }
      delete _state.foldersMap[payload];
      return _state;
    }

    case ActionType.UpdateFoldersByFile: {
      const _state = { ...state };
      if (!_state.foldersMap) {
        throw FOLDERS_MAP_UNDEFINED;
      }
      Object.keys(_state.foldersMap).forEach(folderId => {
        const folder = _state.foldersMap![folderId];
        if (typeof folder.mirrors !== "string") {
          Object.keys(folder.mirrors).forEach(mirrorId => {
            const mirror = (folder.mirrors as Mirrors)[mirrorId];
            if (mirror.mirrorFile.indexFileId === payload.indexFileId) {
              (_state.foldersMap![folderId].mirrors as Mirrors)[
                mirrorId
              ].mirrorFile = payload;
            }
          });
        }
      });

      return _state;
    }

    default: {
      throw ACTION_TYPE_NOT_EXSITS;
    }
  }
};
