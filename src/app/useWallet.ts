import { DataverseConnector, WALLET } from "@dataverse/dataverse-connector";
import { useMutation } from "../utils";
import { useStore } from "../store";
import { ConnectWalletResult, MutationStatus } from "../types";
import { useCallback, useEffect } from "react";
import { DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
// import { useConnect } from "wagmi";

export const useWallet = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: ConnectWalletResult) => void;
}) => {
  const { state, actionInitConnector, actionConnectWallet } = useStore();

  useEffect(() => {
    const _dataverseConnector = new DataverseConnector();
    actionInitConnector(_dataverseConnector);
  }, []);

  // const { connectAsync } = useConnect({
  //   connector: dataverseConnector,
  // });

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
        if (!state.dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        const connectResult = await state.dataverseConnector.connectWallet({
          wallet,
          provider,
        });
        // await connectAsync();

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
    [state.dataverseConnector, actionConnectWallet],
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
    connectWallet,
  };
};
