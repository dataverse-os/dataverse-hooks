import {
  Chain,
  Currency,
  DecryptionConditions,
  ReturnType,
  SYSTEM_CALL,
  WALLET,
  RequestType,
} from "@dataverse/dataverse-connector";
import { Model } from "@dataverse/model-parser";

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
export type CreateFileArgs = RequestType[SYSTEM_CALL.createFile];

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

export type CreateFileResult = Awaited<ReturnType[SYSTEM_CALL.createFile]>;

export type MonetizeFileArgs = {
  fileId: string;
  profileId?: string;
  currency: Currency;
  amount: number;
  collectLimit: number;
  decryptionConditions?: DecryptionConditions;
  dataUnionId?: string;
};

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
    sold_num: number;
    total: string;
    who_can_free_collect: string[];
  };
  content_uri: string;
  owner: string;
  source: string;
}>;

export type UnlockFileResult = Awaited<ReturnType[SYSTEM_CALL.unlockFile]>;

export type UpdateFileArgs = {
  model: Model;
  fileId: string;
  fileName?: string;
  fileContent?: object;
  encrypted?: object;
};

export type UpdateFileResult = Awaited<ReturnType[SYSTEM_CALL.updateFile]>;
