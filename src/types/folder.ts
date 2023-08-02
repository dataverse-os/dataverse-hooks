import { ContentType, FolderType } from "@dataverse/js-dataverse";

export interface IMirrorContent {
  contentType: ContentType; // 0：NFT；1：Mirror，2：Video，3：File，4：Website
  url: string;
  name: string;
  date: string;
  embedUrl?: string;
  note?: string;
  tags?: [];
  chain?: string;
  tokenId?: string;
  contract?: string;
}

export interface IConvertArray {
  ids: string[];
  types: FolderType[];
  dates: string[];
  names: string[];
  mirrors: object[];
}
