import { useReducer } from "react";
import {
  SYSTEM_CALL,
  DataverseConnector,
  Currency,
  DecryptionConditions,
} from "@dataverse/dataverse-connector";
import { ActionType, initialState, reducer } from "./store";
// type StreamRecordMap = Record<string, StreamRecord>;

export const useMonetizeStream = (dataverseConnector: DataverseConnector) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const monetizeStream = async ({
    streamId,
    profileId,
    streamContent,
    currency,
    amount,
    collectLimit,
    decryptionConditions,
  }: {
    streamId: string;
    streamContent?: any;
    profileId?: string;
    currency: Currency;
    amount: number;
    collectLimit: number;
    decryptionConditions?: DecryptionConditions;
  }) => {
    if (!profileId) {
      const profileIds = await dataverseConnector.getProfiles(
        dataverseConnector.address!,
      );
      if (profileIds.length === 0) {
        throw new Error("Please create profile first.");
      }
    }

    if (!streamContent) {
      streamContent = state.streamRecordMap[streamId].streamContent;
    }
    const { streamContent: updatedStreamContent } =
      await dataverseConnector.runOS({
        method: SYSTEM_CALL.monetizeFile,
        params: {
          streamId,
          indexFileId: streamContent?.file.indexFileId,
          datatokenVars: {
            profileId,
            currency,
            amount,
            collectLimit,
          },
          decryptionConditions,
        },
      });

    dispatch({
      type: ActionType.Update,
      payload: updatedStreamContent,
    });

    return updatedStreamContent;

    // if (updatedStreamContent) {
    //   return _updateStreamRecord({
    //     pkh,
    //     modelId,
    //     streamId,
    //     streamContent: updatedStreamContent,
    //   });
    // } else {
    //   throw "Failed to monetize file";
    // }
  };

  return {
    streamRecordMap: state.streamRecordMap,
    monetizeStream,
  };
};
