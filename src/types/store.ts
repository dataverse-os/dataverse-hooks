import {
  Chain,
  DataverseConnector,
  StreamRecord,
  WALLET,
} from "@dataverse/dataverse-connector";

export enum ActionType {
  ConnectWallet,
  CreateCapability,
  CreateStream,
  LoadStreams,
  UpdateStream,
}

export type DataverseContextType = {
  dataverseConnector: DataverseConnector;
  state: {
    address?: string;
    chain?: Chain;
    wallet?: WALLET;
    pkh?: string;
    streamsMap: Record<string, StreamRecord>;
  };
  dispatch: React.Dispatch<any>;
};

export type StateType = DataverseContextType["state"];
