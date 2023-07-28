import {
  Chain,
  Currency,
  DecryptionConditions,
  ReturnType,
  StreamRecord,
  SYSTEM_CALL,
  WALLET,
} from "@dataverse/dataverse-connector";
import { Model } from "@dataverse/model-parser";

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

export type LoadStreamsResult = Record<string, StreamRecord>;

export type LoadStreamsByArgs = {
  pkh: string;
  modelId: string;
};

export type LoadStreamsByResult = LoadStreamsResult;

export type CreatePublicStreamArgs = {
  model: Model;
  stream?: object;
};

export type CreateEncryptedStreamArgs = {
  modelId: string;
  stream: object;
  encrypted: object;
};

export type createPayableStreamArgs = {
  modelId: string;
  profileId?: string;
  stream: object;
  currency: Currency;
  amount: number;
  collectLimit: number;
  encrypted: object;
};

export type CreateStreamResult = StreamRecord & { streamId: string };

export type MonetizeStreamArgs = {
  streamId: string;
  streamContent?: any;
  profileId?: string;
  currency: Currency;
  amount: number;
  collectLimit: number;
  decryptionConditions?: DecryptionConditions;
};

export type MonetizeStreamResult = Awaited<
  ReturnType[SYSTEM_CALL.monetizeFile]
>;

export type UnlockStreamResult = Awaited<ReturnType[SYSTEM_CALL.unlock]>;

export type UpdateStreamArgs = {
  model: Model;
  streamId: string;
  stream: object;
  encrypted?: object;
};

export type UpdateStreamResult = Awaited<ReturnType[SYSTEM_CALL.updateStream]>;
