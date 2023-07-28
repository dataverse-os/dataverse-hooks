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
  InitConnector,
  ConnectWallet,
  CreateCapability,
  CreateStream,
  LoadStreams,
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

export type StateType = DataverseContextType["state"];
