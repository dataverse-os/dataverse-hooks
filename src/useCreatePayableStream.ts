import { useReducer } from "react";
import { DataverseConnector, Currency } from "@dataverse/dataverse-connector";
import { initialState, reducer } from "./store";
import { useCreateEncryptedStream } from "./useCreateEncryptedStream";
import { useMonetizeStream } from "./useMonetizeStream";
// type StreamRecordMap = Record<string, StreamRecord>;

export const useCreatePayableStream = (
  dataverseConnector: DataverseConnector,
) => {
  const [state] = useReducer(reducer, initialState);
  const { createEncryptedStream } =
    useCreateEncryptedStream(dataverseConnector);
  const { monetizeStream } = useMonetizeStream(dataverseConnector);

  const createPayableStream = async ({
    modelId,
    profileId,
    stream,
    currency,
    amount,
    collectLimit,
    encrypted,
  }: {
    modelId: string;
    profileId?: string;
    stream: object;
    currency: Currency;
    amount: number;
    collectLimit: number;
    encrypted: object;
  }) => {
    if (!profileId) {
      const profileIds = await dataverseConnector.getProfiles(
        dataverseConnector.address!,
      );
      if (profileIds.length === 0) {
        throw new Error("Please create profile first.");
      }
    }

    const { streamId, streamContent } = await createEncryptedStream({
      modelId,
      stream,
      encrypted,
      requireUpdateStreamRecord: false,
    });

    return monetizeStream({
      streamId,
      streamContent,
      profileId,
      currency,
      amount,
      collectLimit,
    });
  };

  return {
    streamRecordMap: state.streamRecordMap,
    createPayableStream,
  };
};
