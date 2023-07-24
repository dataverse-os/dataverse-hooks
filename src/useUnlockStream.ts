import { useReducer } from "react";
import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { ActionType, initialState, reducer } from "./store";

export const useUnlockStream = (dataverseConnector: DataverseConnector) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const unlockStream = async (streamId: string) => {
    const { streamContent: unlockedStreamContent } =
      await dataverseConnector.runOS({
        method: SYSTEM_CALL.unlock,
        params: {
          streamId,
        },
      });

    // if (streamContent) {
    //   return _updateStreamRecord({
    //     streamId,
    //     streamContent,
    //   });
    // } else {
    //   throw "Fail to unlock stream";
    // }
    dispatch({
      type: ActionType.Update,
      payload: unlockedStreamContent,
    });

    return unlockedStreamContent;
  };

  return {
    streamRecordMap: state.streamRecordMap,
    unlockStream,
  };
};
