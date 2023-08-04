import { ActionType, StateType } from "../types";
import { ACTION_TYPE_NOT_EXSITS } from "../errors";
import {
  DataverseConnector,
  MirrorFile,
  Mirrors,
  StreamRecord,
} from "@dataverse/dataverse-connector";
// import _ from "lodash";

export const initialState: StateType = {
  dataverseConnector: new DataverseConnector(),
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  streamsMap: {},
  folderMap: {},
};

export const reducer = (
  state: StateType,
  action: {
    type: ActionType;
    payload: any;
  },
) => {
  const { type, payload } = action;
  // const clonedState: StateType = _.cloneDeep(state);

  switch (type) {
    case ActionType.ConnectWallet: {
      const { address, chain, wallet } = payload;
      state.address = address;
      state.chain = chain;
      state.wallet = wallet;
      break;
    }

    case ActionType.CreateCapability: {
      state.pkh = payload;
      break;
    }

    case ActionType.CreateStream: {
      const streamId = payload.streamId;
      state.streamsMap[streamId] = payload as StreamRecord;
      break;
    }

    case ActionType.LoadStreams: {
      state.streamsMap = payload;
      break;
    }

    case ActionType.UpdateStream: {
      const { streamId, streamContent } = payload;
      state.streamsMap[streamId] = {
        ...state.streamsMap[streamId],
        streamContent,
      };
      break;
    }

    case ActionType.SetFolders: {
      state.folderMap = payload;
      break;
    }

    case ActionType.UpdateFolders: {
      const folders = payload instanceof Array ? payload : [payload];
      folders.forEach(folder => {
        state.folderMap[folder.folderId] = folder;
      });
      break;
    }

    case ActionType.DeleteFolder: {
      const folderId = payload;
      delete state.folderMap[folderId];
      break;
    }

    case ActionType.UpdateFoldersByFile: {
      const file: MirrorFile = payload;
      Object.keys(state.folderMap).forEach(folderId => {
        const folder = state.folderMap[folderId];
        if (typeof folder.mirrors !== "string") {
          Object.keys(folder.mirrors).forEach(mirrorId => {
            const mirror = (folder.mirrors as Mirrors)[mirrorId];
            if (mirror.mirrorFile.indexFileId === file.indexFileId) {
              (state.folderMap[folderId].mirrors as Mirrors)[
                mirrorId
              ].mirrorFile = file;
            }
          });
        }
      });
      break;
    }

    default: {
      throw ACTION_TYPE_NOT_EXSITS;
    }
  }
  return state;
};
