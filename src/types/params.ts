import {
  Chain,
  ReturnType,
  SYSTEM_CALL,
  WALLET,
  RequestType,
  Action,
  MirrorFile,
} from "@dataverse/dataverse-connector";

export enum FileType {
  Public = "Public",
  Encrypted = "Encrypted",
  Payable = "Payable",
}

/* export interface CreateFileArgs {
  Public: CreatePublicFileArgs;
  Encrypted: CreateEncryptedFileArgs;
  Payable: CreatePayableFileArgs;
} */
export type CreateIndexFileArgs = RequestType[SYSTEM_CALL.createIndexFile];

export type ConnectWalletResult = {
  address: string;
  chain: Chain;
  wallet: WALLET;
};

export type ConnectResult = {
  address: string;
  chain: Chain;
  wallet: WALLET;
  pkh: string;
};

export type LoadFilesResult = Awaited<ReturnType[SYSTEM_CALL.loadFilesBy]>;

export type LoadFilesByArgs = {
  pkh: string;
  modelId: string;
};

export type LoadFilesByResult = LoadFilesResult;

/* type CreatePublicFileArgs = {
  modelId: string;
  stream?: object;
};

type CreateEncryptedFileArgs = {
  modelId: string;
  stream: object;
  encrypted: object;
};

type CreatePayableFileArgs = {
  modelId: string;
  profileId?: string;
  stream: object;
  currency: Currency;
  amount: number;
  collectLimit: number;
  encrypted: object;
}; */

export type CreateIndexFileResult = Awaited<
  ReturnType[SYSTEM_CALL.createIndexFile]
>;

export type MonetizeFileArgs = RequestType[SYSTEM_CALL.monetizeFile];

export type MonetizeFileResult = Awaited<ReturnType[SYSTEM_CALL.monetizeFile]>;

export type DatatokenInfo = Partial<{
  address: string;
  collect_info: {
    collect_nft_address: string;
    sold_list: {
      owner: string;
      token_id: string;
    }[];
    price: {
      amount: string;
      currency: string;
      currency_addr: string;
    };
    sold_num: string;
    total: string;
  };
  content_uri: string;
  owner: string;
  source: string;
}>;

export type UnlockFileResult = Awaited<ReturnType[SYSTEM_CALL.unlockFile]>;

export type UpdateFileArgs = {
  fileId: string;
  fileName?: string;
  fileContent?: object;
  encrypted?: object;
};

export type UpdateIndexFileResult = Awaited<
  ReturnType[SYSTEM_CALL.updateIndexFile]
>;

export type CreateActionFileArgs = {
  folderId?: string;
  action: Action;
  relationId: string;
  fileName?: string;
};

export type CreateActionFileResult = MirrorFile;

export type UpdateActionFileArgs = {
  fileId: string;
  fileName?: string | undefined;
  isRelationIdEncrypted?: boolean | undefined;
  isCommentEncrypted?: boolean | undefined;
};

export type UpdateActionFileResult = MirrorFile;

export type CollectFileResult = Awaited<ReturnType[SYSTEM_CALL.collectFile]>;

export type PublishDataUnionArgs = RequestType[SYSTEM_CALL.publishDataUnion];

export type DeleteDataUnionArgs = RequestType[SYSTEM_CALL.deleteDataUnion];

export type CreateBareFileArgs = RequestType[SYSTEM_CALL.createBareFile];

export type UpdateBareFileArgs = RequestType[SYSTEM_CALL.updateBareFile];
