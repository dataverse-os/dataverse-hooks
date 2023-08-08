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
  LoadProfileIds,
  CreateProfileId,
}

export type DataverseContextType = {
  dataverseConnector: DataverseConnector;
  state: {
    address?: string;
    chain?: Chain;
    wallet?: WALLET;
    pkh?: string;
    profileIds: string[];
    streamsMap: Record<string, StreamRecord>;
  };
  dispatch: React.Dispatch<any>;
};

export type StateType = DataverseContextType["state"];
