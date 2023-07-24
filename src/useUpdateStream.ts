import { useReducer } from "react";
import {
  SYSTEM_CALL,
  DataverseConnector,
  FileType,
} from "@dataverse/dataverse-connector";
import { ActionType, initialState, reducer } from "./store";
import { Model } from "@dataverse/model-parser";
// type StreamRecordMap = Record<string, StreamRecord>;

export const useUpdateStream = (dataverseConnector: DataverseConnector) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateStream = async ({
    model,
    streamId,
    stream,
    encrypted,
  }: {
    model: Model;
    streamId: string;
    stream: object;
    encrypted?: object;
  }) => {
    const modelStream = model.streams[model.streams.length - 1];

    const fileType =
      state.streamRecordMap[streamId]?.streamContent.file.fileType;
    if (
      !modelStream.isPublicDomain &&
      stream &&
      encrypted &&
      fileType === FileType.Public
    ) {
      for (const key in encrypted) {
        (encrypted as any)[key] = false;
      }
    }
    const streamContent = {
      ...stream,
      encrypted: JSON.stringify(encrypted),
    };

    const { streamContent: updatedStreamContent } =
      await dataverseConnector.runOS({
        method: SYSTEM_CALL.updateStream,
        params: {
          streamId,
          streamContent,
          syncImmediately: true,
        },
      });

    // return _updateStreamRecord({
    //   streamId,
    //   streamContent: streamContent,
    // });
    dispatch({
      type: ActionType.Update,
      payload: updatedStreamContent,
    });

    return updatedStreamContent;
  };

  return {
    streamRecordMap: state.streamRecordMap,
    updateStream,
  };
};
