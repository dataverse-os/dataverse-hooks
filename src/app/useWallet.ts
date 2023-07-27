import { DataverseConnector, WALLET } from "@dataverse/dataverse-connector";
import { useMutation } from "../utils";
import { useStore } from "../store";
import { ActionType, ConnectWalletResult, MutationStatus } from "../types";

export const useWallet = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: ConnectWalletResult) => void;
}) => {
  const { dispatch } = useStore();

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

  const connectWallet = async ({
    wallet,
    provider,
  }: {
    wallet?: WALLET;
    provider?: any;
  }) => {
    try {
      setStatus(MutationStatus.Pending);
      if (onPending) {
        onPending();
      }
      const connectResult = await dataverseConnector.connectWallet({
        wallet,
        provider,
      });

      dispatch({
        type: ActionType.ConnectWallet,
        payload: connectResult,
      });
      setStatus(MutationStatus.Succeed);
      setResult(connectResult);
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
  };

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
