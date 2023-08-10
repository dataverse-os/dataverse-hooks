import { SYSTEM_CALL, WALLET } from "@dataverse/dataverse-connector";
import { ConnectResult, MutationStatus } from "../types";
import { useCapability } from "./useCapability";
import { useWallet } from "./useWallet";
import { useMutation } from "../utils";
import { useCallback, useEffect } from "react";
import { useAction, useStore } from "../store";
import { useAccount, useConnect } from "wagmi";
import { dataverseWalletConnector } from "../store/wagmi";

export const useApp = ({
  appId,
  autoConnect = true,
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

  const wagmiAccount = useAccount();
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
    autoConnectApp();
  }, []);

  const autoConnectApp = useCallback(async () => {
    if (autoConnect && !address && !pkh) {
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

        if (!wagmiAccount.isConnected) {
          await connectAsync();
        }
      }
    }
  }, [dataverseConnector, address, pkh, autoConnect]);

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
    [dataverseConnector, connectWallet, createCapability],
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
