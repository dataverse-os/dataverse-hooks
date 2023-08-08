import { ActionType, StateType } from "../types";
import { ACTION_TYPE_NOT_EXSITS } from "../errors";
import _ from "lodash";

export const initialState: StateType = {
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  profileIds: undefined,
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
      state.streamsMap[streamId] = {
        pkh: payload.pkh,
        appId: payload.appId,
        modelId: payload.modelId,
        streamContent: payload.streamContent,
      };
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

    case ActionType.LoadProfileIds: {
      state.profileIds = payload;
      break;
    }

    case ActionType.CreateProfileId: {
      if (state.profileIds) {
        state.profileIds.push(payload);
      } else {
        state.profileIds = [payload];
      }
      break;
    }

    case ActionType.UpdateDatatokenInfo: {
      const { streamId, datatokenInfo } = payload;
      state.streamsMap[streamId] = {
        ...state.streamsMap[streamId],
        datatokenInfo,
      };
      break;
    }

    default: {
      throw ACTION_TYPE_NOT_EXSITS;
    }
  }
  return _.cloneDeep(state);
};
