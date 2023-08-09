import { SYSTEM_CALL, WALLET } from "@dataverse/dataverse-connector";
import { ConnectResult, MutationStatus } from "../types";
import { useCapability } from "./useCapability";
import { useWallet } from "./useWallet";
import { useMutation } from "../utils";
import { useCallback, useEffect } from "react";
import { useAction, useStore } from "../store";

export const useApp = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: {
    appId: string;
    wallet?: WALLET;
    provider?: any;
  }) => void;
  onSuccess?: (result: ConnectResult) => void;
}) => {
  const { dataverseConnector, address, pkh } = useStore();

  const { actionConnectWallet, actionCreateCapability } = useAction();

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

  useEffect(() => {
    autoConnectApp();
  }, []);

  const autoConnectApp = useCallback(async () => {
    if (!address && !pkh) {
      const hasCapability = await dataverseConnector.runOS({
        method: SYSTEM_CALL.checkCapability,
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
      }
    }
  }, [dataverseConnector, address, pkh]);

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
          params.onPending({
            appId,
            wallet,
            provider,
          });
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
