import { useCreateEncryptedStream } from "./useCreateEncryptedStream";
import { useMonetizeStream } from "./useMonetizeStream";
import {
  createPayableStreamArgs,
  CreateStreamResult,
  MutationStatus,
} from "../types";
import { useMutation } from "../utils";
import { DATAVERSE_CONNECTOR_UNDEFINED, PROFILES_NOT_EXSIT } from "../errors";
import { useStore } from "../store";
import { useCallback } from "react";

export const useCreatePayableStream = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: CreateStreamResult) => void;
}) => {
  const {
    state: { dataverseConnector },
  } = useStore();

  const { createEncryptedStream } = useCreateEncryptedStream();
  const { monetizeStream } = useMonetizeStream();
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

  const createPayableStream = useCallback(
    async ({
      modelId,
      profileId,
      stream,
      currency,
      amount,
      collectLimit,
      encrypted,
    }: createPayableStreamArgs) => {
      try {
        if (!dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        if (!profileId) {
          const profileIds = await dataverseConnector.getProfiles(
            dataverseConnector.address!,
          );
          if (profileIds.length === 0) {
            throw PROFILES_NOT_EXSIT;
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
        if (params?.onSuccess) {
          params.onSuccess(createdStream);
        }

        return createdStream;
      } catch (error) {
        setStatus(MutationStatus.Failed);
        setError(error);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [dataverseConnector],
  );

  return {
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
