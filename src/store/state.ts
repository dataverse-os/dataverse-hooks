import { ActionType, DataverseContextType } from "../types";
import _ from "lodash";

export const initialState: DataverseContextType = {
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  streamsMap: {},
};

export const reducer = (state: any, action: any) => {
  const { type, payload } = action;
  const clonedState: DataverseContextType = _.cloneDeep(state);

  switch (type) {
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

    case ActionType.Create: {
      const streamId = payload.streamId;
      delete payload.streamId;
      clonedState.streamsMap[streamId] = payload;
      break;
    }

    case ActionType.Read: {
      clonedState.streamsMap = payload;
      break;
    }

    case ActionType.Update: {
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
      throw new Error("No such ActionType");
    }
  }
  return clonedState;
};
