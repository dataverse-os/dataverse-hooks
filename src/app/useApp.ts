import { WALLET } from "@dataverse/dataverse-connector";
import { ConnectResult, MutationStatus } from "../types";
import { useCapability } from "./useCapability";
import { useWallet } from "./useWallet";
import { useMutation } from "../utils";
import { useCallback } from "react";

export const useApp = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: ConnectResult) => void;
}) => {
  const { connectWallet } = useWallet();

  const { createCapability } = useCapability();

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

  const connectApp = useCallback(
    async ({
      appId,
      wallet,
      provider,
    }: {
      appId: string;
      wallet?: WALLET;
      provider?: any;
    }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        const connectWalletResult = await connectWallet({ wallet, provider });
        const pkh = await createCapability(appId);
        const connectResult = {
          ...connectWalletResult,
          pkh,
        };

        setResult(connectResult);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(connectResult);
        }

        return connectResult;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [connectWallet, createCapability],
  );

  return {
    connectInfo: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    connectApp,
  };
};
