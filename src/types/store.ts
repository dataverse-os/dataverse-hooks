import {
  Chain,
  DataverseConnector,
  StreamRecord,
  WALLET,
} from "@dataverse/dataverse-connector";

export enum StreamStatus {
  Pending,
  Succeed,
  Failed,
}

export enum ActionType {
  Init,
  ConnectWallet,
  CreateCapability,
  CreateStream,
  LoadStream,
  UpdateStream,
  Status,
}

export type DataverseContextType = {
  state: {
    dataverseConnector?: DataverseConnector;
    address?: string;
    chain?: Chain;
    wallet?: WALLET;
    pkh?: string;
    streamsMap: Record<string, StreamRecord & { status: StreamStatus }>;
  };
  dispatch: React.Dispatch<any>;
};
