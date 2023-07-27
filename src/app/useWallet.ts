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
  const {
    state: { dataverseConnector },
    actionInitConnector,
  } = useStore();
  // const { connectAsync } = useConnect({
  //   connector: dataverseConnector,
  // });

  useEffect(() => {
    const dataverseConnector = new DataverseConnector();
    actionInitConnector(dataverseConnector);
  }, []);

  const { actionConnectWallet } = useStore();

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
        if (!dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        const connectResult = await dataverseConnector.connectWallet({
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
    [dataverseConnector, actionConnectWallet],
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
