import { useReducer } from "react";
import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { ActionType, initialState, reducer } from "./store";
// type StreamRecordMap = Record<string, StreamRecord>;

export const useLoadStream = ({
  dataverseConnector,
}: {
  dataverseConnector: DataverseConnector;
  appId: string;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadStreams = async ({
    pkh,
    modelId,
  }: {
    pkh?: string;
    modelId: string;
  }) => {
    let streams;
    if (pkh) {
      streams = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadStreamsBy,
        params: {
          modelId,
          pkh,
        },
      });
    } else {
      streams = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadStreamsBy,
        params: {
          modelId,
        },
      });
    }
    // setStreamsRecord(streams);
    dispatch({
      type: ActionType.Read,
      payload: streams,
    });
    return streams;
  };

  return {
    streamRecordMap: state.streamRecordMap,
    loadStreams,
  };
};
