import { DataverseConnector } from "@dataverse/dataverse-connector";
import { useCapability } from "./useCapability";
import { useWallet } from "./useWallet";

export const useApp = (
  dataverseConnector: DataverseConnector,
  appId: string,
  provider?: any,
) => {
  const { wallet, address, connectWallet } = useWallet({
    dataverseConnector,
    provider,
  });

  const { pkh, createCapability } = useCapability({
    dataverseConnector,
    appId,
  });

  return {
    wallet,
    address,
    pkh,
    connectWallet,
    createCapability,
  };
};
