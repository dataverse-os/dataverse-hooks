import { useState } from "react";
import { DataverseConnector, WALLET } from "@dataverse/dataverse-connector";

type Props = {
  dataverseConnector: DataverseConnector;
  provider?: any;
};

export const useWallet = ({ dataverseConnector, provider }: Props) => {
  const [wallet, setWallet] = useState<WALLET>();
  const [address, setAddress] = useState<string>();

  const connectWallet = async () => {
    const { wallet, address } = await dataverseConnector.connectWallet({
      provider,
    });
    setWallet(wallet);
    setAddress(address);
    return {
      address,
      wallet,
    };
  };

  return {
    wallet,
    address,
    connectWallet,
  };
};
