import { ActionType, StateType } from "../types";
import { ACTION_TYPE_NOT_EXSITS } from "../errors";
import {
  DataverseConnector,
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
  folders: {},
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
      state.folders = payload;
      break;
    }

    case ActionType.UpdateFolders: {
      const folders = payload instanceof Array ? payload : [payload];
      folders.forEach(folder => {
        state.folders[folder.folderId] = folder;
      });
      break;
    }

    case ActionType.DeleteFolder: {
      const folderId = payload;
      delete state.folders[folderId];
      break;
    }

    default: {
      throw ACTION_TYPE_NOT_EXSITS;
    }
  }
  return state;
};
