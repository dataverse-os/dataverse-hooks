import { WALLET } from "@dataverse/dataverse-connector";
import { useMutation } from "../utils";
import { useStore } from "../store";
import { ConnectWalletResult, MutationStatus } from "../types";
import { useCallback } from "react";
import { useAccount, useConnect } from "wagmi";
import { dataverseWalletConnector } from "../store/wagmi";
import { useAction } from "../store";

export const useWallet = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: { wallet?: WALLET; provider?: any }) => void;
  onSuccess?: (result: ConnectWalletResult) => void;
}) => {
  const { dataverseConnector } = useStore();

  const { actionConnectWallet } = useAction();

  const { isConnected: isWagmiConnected } = useAccount();

  const { connectAsync } = useConnect({
    connector: dataverseWalletConnector,
  });

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

  const connectWallet = useCallback(
    async ({ wallet, provider }: { wallet?: WALLET; provider?: any }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({ wallet, provider });
        }
        const connectResult = await dataverseConnector.connectWallet({
          wallet,
          provider,
        });

        if (!isWagmiConnected) {
          await connectAsync();
        }

        actionConnectWallet(connectResult);
        setStatus(MutationStatus.Succeed);
        setResult(connectResult);
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
    [
      isWagmiConnected,
      dataverseConnector,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    walletInfo: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    connectWallet,
  };
};
