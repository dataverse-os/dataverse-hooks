import {
  Chain,
  DataverseConnector,
  StreamRecord,
  WALLET,
  StructuredFolders,
} from "@dataverse/dataverse-connector";
import { DatatokenInfo } from "./params";

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
  LoadProfileIds,
  CreateProfileId,
  UpdateDatatokenInfo,
}

export type DataverseContextType = {
  dataverseConnector: DataverseConnector;
  state: {
    address?: string;
    chain?: Chain;
    wallet?: WALLET;
    pkh?: string;
    folderMap: StructuredFolders;
    profileIds?: string[];
    streamsMap: Record<
      string,
      StreamRecord & { datatokenInfo?: DatatokenInfo }
    >;
  };
  dispatch: React.Dispatch<any>;
};

export interface StreamObject {
  streamId: string;
  streamContent: Record<string, any>;
}

export type StateType = DataverseContextType["state"];
