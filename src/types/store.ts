import {
  Chain,
  DataverseConnector,
  StreamRecord,
  WALLET,
  StructuredFolders,
} from "@dataverse/dataverse-connector";

export enum ActionType {
  ConnectWallet,
  CreateCapability,
  CreateStream,
  LoadStreams,
  UpdateStream,
  SetFolders,
  UpdateFolders,
  DeleteFolder,
  UpdateFoldersByFile,
}

export type DataverseContextType = {
  state: {
    dataverseConnector: DataverseConnector;
    address?: string;
    chain?: Chain;
    wallet?: WALLET;
    pkh?: string;
    streamsMap: Record<string, StreamRecord>;
    folderMap: StructuredFolders;
  };
  dispatch: React.Dispatch<any>;
};

export interface StreamObject {
  streamId: string;
  streamContent: Record<string, any>;
}

export type StateType = DataverseContextType["state"];
