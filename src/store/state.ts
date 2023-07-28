import { ActionType, StateType } from "../types";
import { ACTION_TYPE_NOT_EXSITS } from "../errors";
// import _ from "lodash";

export const initialState: StateType = {
  dataverseConnector: undefined,
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  streamsMap: {},
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
    case ActionType.InitConnector: {
      state.dataverseConnector = payload;
      break;
    }

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
      delete payload.streamId;
      state.streamsMap[streamId] = payload;
      break;
    }

    case ActionType.LoadStreams: {
      state.streamsMap = payload;
      break;
    }

    case ActionType.UpdateStream: {
      const { streamId, streamContent } = payload;
      state.streamsMap[streamId].streamContent = streamContent;
      break;
    }

    case ActionType.Status: {
      const { streamId, status } = payload;
      state.streamsMap[streamId].status = status;
      break;
    }

    default: {
      throw ACTION_TYPE_NOT_EXSITS;
    }
  }
  return state;
};
