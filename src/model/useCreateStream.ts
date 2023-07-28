import { CreateStreamResult } from "../types";
// import { useCreateEncryptedStream } from "./useCreateEncryptedStream";
// import { useCreatePayableStream } from "./useCreatePayableStream";
// import { useCreatePublicStream } from "./useCreatePublicStream";

export const useCreateStream = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: CreateStreamResult) => void;
}) => {
  return params;
  //   const { createPublicStream } = useCreatePublicStream(params);
  //   const { createEncryptedStream } = useCreateEncryptedStream(params);
  //   const { createPayableStream } = useCreatePayableStream(params);

  //   return {
  //     createPublicStream,
  //     createEncryptedStream,
  //     createPayableStream
  //   };
};
