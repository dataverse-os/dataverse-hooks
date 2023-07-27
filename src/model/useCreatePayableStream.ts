import { DataverseConnector } from "@dataverse/dataverse-connector";
import { useCreateEncryptedStream } from "./useCreateEncryptedStream";
import { useMonetizeStream } from "./useMonetizeStream";
import {
  createPayableStreamArgs,
  CreateStreamResult,
  MutationStatus,
} from "../types";
import { useMutation } from "../utils";

export const useCreatePayableStream = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: CreateStreamResult) => void;
}) => {
  const { createEncryptedStream } = useCreateEncryptedStream({
    dataverseConnector,
  });
  const { monetizeStream } = useMonetizeStream({ dataverseConnector });
  const {
    result,
    setResult,
    error,
    setError,
    status,
    setStatus,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
  } = useMutation();

  const createPayableStream = async ({
    modelId,
    profileId,
    stream,
    currency,
    amount,
    collectLimit,
    encrypted,
  }: createPayableStreamArgs) => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }
      if (!profileId) {
        const profileIds = await dataverseConnector.getProfiles(
          dataverseConnector.address!,
        );
        if (profileIds.length === 0) {
          throw new Error("Please create profile first.");
        }
      }

      const createdStream = await createEncryptedStream({
        modelId,
        stream,
        encrypted,
      });

      const monetizedResult = await monetizeStream({
        streamId: createdStream.streamId,
        streamContent: createdStream.streamContent,
        profileId,
        currency,
        amount,
        collectLimit,
      });

      Object.assign(createdStream, {
        ...createdStream,
        streamContent: monetizedResult.streamContent,
      });

      setStatus(MutationStatus.Succeed);
      setResult(createdStream);
      if (onSuccess) {
        onSuccess(createdStream);
      }

      return createdStream;
    } catch (error) {
      setStatus(MutationStatus.Failed);
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };

  return {
    // streamRecordMap: state.streamRecordMap,
    result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    createPayableStream,
  };
};
