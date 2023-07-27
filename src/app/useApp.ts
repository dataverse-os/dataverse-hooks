import { DataverseConnector, WALLET } from "@dataverse/dataverse-connector";
import { ConnectResult, MutationStatus } from "../types";
import { useCapability } from "./useCapability";
import { useWallet } from "./useWallet";
import { useMutation } from "../utils";

export const useApp = ({
  dataverseConnector,
  onError,
  onPending,
  onSuccess,
}: {
  dataverseConnector: DataverseConnector;
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: ConnectResult) => void;
}) => {
  const { connectWallet } = useWallet({
    dataverseConnector,
  });

  const { createCapability } = useCapability({
    dataverseConnector,
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

  const connectApp = async ({
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
      if (onPending) {
        onPending();
      }
      const connectWalletResult = await connectWallet({ wallet, provider });
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
    connectApp,
  };
};
