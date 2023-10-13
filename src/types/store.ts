import {
  Chain,
  DataverseConnector,
  WALLET,
  StructuredFolderRecord,
  MirrorFile,
} from "@dataverse/dataverse-connector";
import { FileContent } from "@dataverse/dataverse-connector/dist/esm/types/fs";

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
  SetDataUnions,
  UpdateDataUnion,
  DeleteDataUnion,
  UpdateDataUnionsByFile,
  UpdateDataUnionsByDeleteFiles,
  // UpdateDataUnionsByMonetizeFile,
}

export type DataverseContextType = {
  dataverseConnector: DataverseConnector;
  state: {
    address?: string;
    chain?: Chain;
    wallet?: WALLET;
    pkh?: string;
    profileIds?: string[];
    filesMap?: Record<
      string,
      {
        appId: string;
        modelId: string;
        pkh: string;
        fileContent:
          | {
              file?: Omit<MirrorFile, "fileKey" | "content" | "external">;
              content?: FileContent;
            }
          | FileContent;
      } & { datatokenInfo?: DatatokenInfo }
    >;
    foldersMap?: StructuredFolderRecord;
    dataUnionsMap?: StructuredFolderRecord;
  };
  dispatch: React.Dispatch<any>;
};

export interface StreamObject {
  streamId: string;
  streamContent: Record<string, any>;
}

export type StateType = DataverseContextType["state"];
