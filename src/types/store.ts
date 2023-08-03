import {
  Chain,
  DataverseConnector,
  StreamRecord,
  WALLET,
  StructuredFolders as Folders,
} from "@dataverse/dataverse-connector";

export enum ActionType {
  ConnectWallet,
  CreateCapability,
  CreateStream,
  LoadStreams,
  UpdateStream,
  SetFolders,
}

export type DataverseContextType = {
  state: {
    dataverseConnector: DataverseConnector;
    address?: string;
    chain?: Chain;
    wallet?: WALLET;
    pkh?: string;
    streamsMap: Record<string, StreamRecord>;
    folders: Folders;
    localFolderIdToRemoteFolderId?: Record<string, string>;
    localFolderIdToRemoteFolderIdMap?: Record<string, Record<string, string>>;
    profileStream: StreamObject;
  };
  dispatch: React.Dispatch<any>;
};

export interface StreamObject {
  streamId: string;
  streamContent: Record<string, any>;
}

export type StateType = DataverseContextType["state"];
