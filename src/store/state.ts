import { ActionType, DataverseContextType } from "../types";
import _ from "lodash";
import { ACTION_TYPE_NOT_EXSITS } from "../errors";

export const initialState: DataverseContextType["state"] = {
  dataverseConnector: undefined,
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  streamsMap: {},
};

export const reducer = (state: any, action: any) => {
  const { type, payload } = action;
  const clonedState: DataverseContextType["state"] = _.cloneDeep(state);

  switch (type) {
    case ActionType.InitConnector: {
      clonedState.dataverseConnector = payload;
      break;
    }

    case ActionType.ConnectWallet: {
      const { address, chain, wallet } = payload;
      clonedState.address = address;
      clonedState.chain = chain;
      clonedState.wallet = wallet;
      break;
    }

    case ActionType.CreateCapability: {
      clonedState.pkh = payload;
      break;
    }

    case ActionType.CreateStream: {
      const streamId = payload.streamId;
      delete payload.streamId;
      clonedState.streamsMap[streamId] = payload;
      break;
    }

    case ActionType.LoadStreams: {
      clonedState.streamsMap = payload;
      break;
    }

    case ActionType.UpdateStream: {
      const { streamId, streamContent } = payload;
      clonedState.streamsMap[streamId].streamContent = streamContent;
      break;
    }

    case ActionType.Status: {
      const { streamId, status } = payload;
      clonedState.streamsMap[streamId].status = status;
      break;
    }

    default: {
      throw ACTION_TYPE_NOT_EXSITS;
    }
  }
  return clonedState;
};
