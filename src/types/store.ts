import { Chain, StreamRecord, WALLET } from "@dataverse/dataverse-connector";

export enum StreamStatus {
  Pending,
  Succeed,
  Failed,
}

export enum ActionType {
  ConnectWallet,
  CreateCapability,
  Create,
  Read,
  Update,
  Status,
}

export type DataverseContextType = {
  state: {
    address?: string;
    chain?: Chain;
    wallet?: WALLET;
    pkh?: string;
    streamsMap: Record<string, StreamRecord & { status: StreamStatus }>;
  }
  dispatch: React.Dispatch<any>;
};
