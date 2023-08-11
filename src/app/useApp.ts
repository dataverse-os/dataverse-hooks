import { useCallback, useEffect } from "react";

import { SYSTEM_CALL, WALLET } from "@dataverse/dataverse-connector";
import { useAccount, useConnect } from "wagmi";

import { useCapability } from "./useCapability";
import { useWallet } from "./useWallet";
import { useAction, useStore } from "../store";
import { dataverseWalletConnector } from "../store/wagmi";
import { ConnectResult, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useApp = ({
  appId,
  autoConnect = false,
  onError,
  onPending,
  onSuccess,
}: {
  appId: string;
  autoConnect?: boolean;
  onError?: (error: any) => void;
  onPending?: (args?: { wallet?: WALLET; provider?: any }) => void;
  onSuccess?: (result: ConnectResult) => void;
}) => {
  const { dataverseConnector, address, pkh } = useStore();

  const { actionConnectWallet, actionCreateCapability } = useAction();

  const { connectWallet } = useWallet();

  const { createCapability } = useCapability();

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

  useEffect(() => {
    if (autoConnect) {
      autoConnectApp();
    }
  }, [autoConnect]);

  const autoConnectApp = useCallback(async () => {
    if (!address && !pkh) {
      const hasCapability = await dataverseConnector.runOS({
        method: SYSTEM_CALL.checkCapability,
        params: {
          appId,
        },
      });

      if (hasCapability) {
        const connectResult = await dataverseConnector.getCurrentWallet();
        if (connectResult) {
          actionConnectWallet(connectResult);
          await dataverseConnector.connectWallet({
            wallet: connectResult.wallet,
          });
          const currentPkh = dataverseConnector.getCurrentPkh();
          actionCreateCapability(currentPkh);
        }

        if (!isWagmiConnected) {
          await connectAsync();
        }
      }
    }
  }, [
    dataverseConnector,
    address,
    pkh,
    isWagmiConnected,
    actionConnectWallet,
    actionCreateCapability,
  ]);

  const connectApp = useCallback(
    async (args?: { wallet?: WALLET; provider?: any }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending(args);
        }
        const connectWalletResult = await connectWallet({
          wallet: args?.wallet,
          provider: args?.provider,
        });
        const pkh = await createCapability(appId);
        const connectResult = {
          ...connectWalletResult,
          pkh,
        };

        setResult(connectResult);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(connectResult);
        }

        return connectResult;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
        }
        throw error;
      }
    },
    [
      dataverseConnector,
      connectWallet,
      createCapability,
      setStatus,
      setError,
      setResult,
      onPending,
      onError,
      onSuccess,
    ],
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
