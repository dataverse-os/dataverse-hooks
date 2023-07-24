import { useReducer } from "react";
import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { ActionType, initialState, reducer } from "./store";
// type StreamRecordMap = Record<string, StreamRecord>;

export const useCreateEncryptedStream = (
  dataverseConnector: DataverseConnector,
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const createEncryptedStream = async ({
    modelId,
    stream,
    encrypted,
    requireUpdateStreamRecord = true,
  }: {
    modelId: string;
    stream: object;
    encrypted: object;
    requireUpdateStreamRecord?: boolean;
  }) => {
    const inputStreamContent = {
      ...stream,
      ...(stream && {
        encrypted: JSON.stringify(encrypted),
      }),
    };
    const createdStream = await dataverseConnector.runOS({
      method: SYSTEM_CALL.createStream,
      params: {
        modelId,
        streamContent: inputStreamContent,
      },
    });

    if (requireUpdateStreamRecord) {
      dispatch({
        type: ActionType.Create,
        payload: createdStream,
      });
    }

    return createdStream;

    // if (streamContent) {
    //   if (requireUpdateStreamRecord) {
    //     return _updateStreamRecord({
    //       pkh,
    //       modelId,
    //       streamId,
    //       streamContent,
    //     });
    //   }
    //   return {
    //     streamId,
    //     appId,
    //     pkh,
    //     modelId,
    //     streamContent,
    //   };
    // } else {
    //   throw "Failed to create stream";
    // }
  };

  return {
    streamRecordMap: state.streamRecordMap,
    createEncryptedStream,
  };
};
