import { useState } from "react";
import {
  DataverseConnector,
  SYSTEM_CALL,
  WALLET,
} from "@dataverse/dataverse-connector";

export function useWallet(dataverseConnector: DataverseConnector) {
  const [wallet, setWallet] = useState<WALLET>();
  const [address, setAddress] = useState<string>();

  const connectWallet = async () => {
    const { wallet, address } = await dataverseConnector.connectWallet();
    setWallet(wallet);
    setAddress(address);
    return {
      address,
      wallet,
    };
  };

  const contractCall = async (params: {
    contractAddress: string;
    abi: any[];
    method: string;
    params: any[];
  }) => {
    const res = await dataverseConnector.runOS({
      method: SYSTEM_CALL.contractCall,
      params,
    });
    return res;
  };

  const ethereumRequest = async (params: { method: string; params?: any }) => {
    const res = await dataverseConnector.runOS({
      method: SYSTEM_CALL.ethereumRequest,
      params,
    });
    return res;
  };

  const getPKP = async () => {
    const res = await dataverseConnector.runOS({
      method: SYSTEM_CALL.getPKP,
    });
    return res;
  };

  const executeLitAction = async (params: {
    code: string;
    jsParams: object;
  }) => {
    const res = await dataverseConnector.runOS({
      method: SYSTEM_CALL.executeLitAction,
      params,
    });
    return res;
  };

  return {
    wallet,
    address,
    connectWallet,
    contractCall,
    ethereumRequest,
    getPKP,
    executeLitAction,
  };
}
