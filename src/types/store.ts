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
  Delete,
  Status,
}

export type DataverseContextType = {
  address?: string;
  chain?: Chain;
  wallet?: WALLET;
  pkh?: string;
  streamsMap: Record<string, StreamRecord & { status: StreamStatus }>;
};
