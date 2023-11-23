import {
  Chain,
  DataverseConnector,
  WALLET,
  StructuredFolderRecord,
  MirrorFile,
} from "@dataverse/dataverse-connector";
import {
  FileContent,
  MirrorFileRecord,
} from "@dataverse/dataverse-connector/dist/esm/types/fs";

import { DatatokenInfo } from "./params";

export enum ActionType {
  ConnectWallet,
  CreateCapability,
  CreateFile,
  LoadFiles,
  LoadCollectedDatatokenFiles,
  UpdateFile,
  SetFolders,
  UpdateFolders,
  DeleteFolder,
  UpdateFoldersByFile,
  LoadProfileIds,
  CreateProfileId,
  UpdateDatatokenInfo,
  UpdateDatatokenInfos,
  SetDataUnions,
  UpdateDataUnion,
  DeleteDataUnion,
  UpdateDataUnionsByFile,
  UpdateDataUnionsByDeleteFiles,
  SetCollectedDataUnions,
  LoadActions,
  UpdateAction,
}

export type RequiredByKeys<T, K extends keyof T> = {
  [P in K]-?: T[P];
} & Pick<T, Exclude<keyof T, K>>;

export type DataverseContextType = {
  dataverseConnector: DataverseConnector;
  state: {
    appId?: string;
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
    collectedDatatokenFilesMap?: MirrorFileRecord;
    foldersMap?: StructuredFolderRecord;
    dataUnionsMap?: StructuredFolderRecord;
    collectedUnionsMap?: StructuredFolderRecord;
    actionsMap?: Record<
      string,
      Record<string, RequiredByKeys<MirrorFile, "action" | "relationId">>
    >;
  };
  dispatch: React.Dispatch<any>;
};

export interface StreamObject {
  streamId: string;
  streamContent: Record<string, any>;
}

export type StateType = DataverseContextType["state"];
