import {
  Chain,
  DataverseConnector,
  WALLET,
  StructuredFolderRecord,
  MirrorFile,
} from "@dataverse/dataverse-connector";

import { DatatokenInfo } from "./params";

export enum ActionType {
  ConnectWallet,
  CreateCapability,
  CreateFile,
  LoadFiles,
  UpdateFile,
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
    profileIds?: string[];
    filesMap?: Record<string, MirrorFile & { datatokenInfo?: DatatokenInfo }>;
    foldersMap?: StructuredFolderRecord;
  };
  dispatch: React.Dispatch<any>;
};

export interface StreamObject {
  streamId: string;
  streamContent: Record<string, any>;
}

export type StateType = DataverseContextType["state"];
