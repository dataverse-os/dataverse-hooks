import { useReducer } from "react";
import {
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { ActionType, initialState, reducer } from "./store";
import { Model } from "@dataverse/model-parser";
// type StreamRecordMap = Record<string, StreamRecord>;

export const useCreatePublicStream = ({
  dataverseConnector,
}: {
  dataverseConnector: DataverseConnector;
  appId: string;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const createPublicStream = async ({
    model,
    stream,
  }: {
    model: Model;
    stream?: object;
  }) => {
    const modelStream = model.streams[model.streams.length - 1];
    const encrypted = {} as any;
    if (stream && Object.keys(stream).length > 0) {
      Object.keys(stream).forEach(key => {
        encrypted[key] = false;
      });
    }

    const inputStreamContent = {
      ...stream,
      ...(!modelStream.isPublicDomain &&
        stream && {
          encrypted: JSON.stringify(encrypted),
        }),
    };

    const createdStream = await dataverseConnector.runOS({
      method: SYSTEM_CALL.createStream,
      params: {
        modelId: modelStream.modelId,
        streamContent: inputStreamContent,
      },
    });

    dispatch({
      type: ActionType.Create,
      payload: createdStream,
    });

    // if (streamContent) {
    //   // return _updateStreamRecord({
    //   //   pkh,
    //   //   modelId,
    //   //   streamId,
    //   //   streamContent,
    //   // });
    //   dispatch({
    //     type: ActionType.Read,
    //     payload: ,
    //   })
    // } else {
    //   throw "Failed to update stream list";
    // }
  };

  return {
    streamRecordMap: state.streamRecordMap,
    createPublicStream,
  };
};
