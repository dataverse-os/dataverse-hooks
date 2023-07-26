import { ActionType, DataverseContextType } from "../types";

export const initialState: DataverseContextType = {
  address: undefined,
  wallet: undefined,
  chain: undefined,
  pkh: undefined,
  streamsMap: {},
};

export const reducer = (state: any, action: any) => {
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

    case ActionType.Create: {
      const streamId = payload.streamId;
      delete payload.streamId;
      state.streamsMap[streamId] = payload;
      break;
    }

    case ActionType.Read: {
      state.streamsMap = payload;
      break;
    }

    case ActionType.Update: {
      const streamId = payload.streamId;
      delete payload.streamId;
      state.streamsMap[streamId].streamContent = payload;
      break;
    }

    case ActionType.Delete: {
      break;
    }

    case ActionType.Status: {
      const { streamId, status } = payload;
      state.streamsMap[streamId].status = status;
      break;
    }

    default: {
      throw new Error("No such ActionType");
    }
  }
  return state;
};
