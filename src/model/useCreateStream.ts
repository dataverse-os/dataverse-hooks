import { SYSTEM_CALL } from "@dataverse/dataverse-connector";
import { useCallback } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useStore } from "../store";
import { useAction } from "../store/useAction";
import {
  CreateStreamArgs,
  CreateStreamResult,
  MutationStatus,
  StreamType,
} from "../types";
import { useMutation } from "../utils";
import { useMonetizeStream } from "./useMonetizeStream";

export const useCreateStream = ({
  streamType,
  onError,
  onPending,
  onSuccess,
}: {
  streamType: StreamType;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: CreateStreamResult) => void;
}) => {
  const { state } = useStore();
  const { actionCreateStream } = useAction();
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

  const createStream = useCallback(
    async (args: CreateStreamArgs[StreamType]) => {
      try {
        if (!state.dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }

        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending();
        }
        // const modelStream = args.model.streams[model.streams.length - 1];
        let encrypted;
        if (streamType === StreamType.Public) {
          const _encrypted = {} as any;
          if (args.stream && Object.keys(args.stream).length > 0) {
            Object.keys(args.stream).forEach(key => {
              _encrypted[key] = false;
            });
          }
          encrypted = _encrypted;
        } else {
          encrypted = (args as CreateStreamArgs[StreamType.Encrypted])
            .encrypted;
        }

        const inputStreamContent = {
          ...args.stream,
          // ...(!modelStream.isPublicDomain &&
          //   stream && {
          //     encrypted: JSON.stringify(encrypted),
          //   }),
          ...(args.stream && {
            encrypted: JSON.stringify(encrypted),
          }),
        };

        const createdStream: CreateStreamResult =
          await state.dataverseConnector.runOS({
            method: SYSTEM_CALL.createStream,
            params: {
              modelId: args.modelId,
              streamContent: inputStreamContent,
            },
          });

        actionCreateStream(createdStream);

        if (streamType === StreamType.Payable) {
          const { profileId, currency, amount, collectLimit } =
            args as CreateStreamArgs[StreamType.Payable];
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
        }

        setResult(createdStream);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(createdStream);
        }
        return createdStream;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [state.dataverseConnector, actionCreateStream],
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
    createStream,
  };
  //   const { createPublicStream } = useCreatePublicStream(params);
  //   const { createEncryptedStream } = useCreateEncryptedStream(params);
  //   const { createPayableStream } = useCreatePayableStream(params);

  //   return {
  //     createPublicStream,
  //     createEncryptedStream,
  //     createPayableStream
  //   };
};
