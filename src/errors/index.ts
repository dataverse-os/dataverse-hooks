export const ADDRESS_UNDEFINED = new Error("address undefined in state");
export const STREAMS_MAP_UNDEFINED = new Error("streamsMap undefined in state");
export const FOLDERS_MAP_UNDEFINED = new Error("foldersMap undefined in state");
export const PROFILES_NOT_EXSIT = new Error("Profiles not exsit");
export const ACTION_TYPE_NOT_EXSITS = new Error("ActionType not exsits");
export const STREAM_NOT_EXSITS = new Error("stream not exists");
export const FOLDER_NOT_EXSITS = new Error("folder not exists");
export const DATATOKENID_NOT_EXIST = new Error(
  "DatatokenId not exsits in this stream",
);
export const DATAVERSE_CONTEXT_PROVIDER_ERROR = new Error(
  "useStore must be used within a DataverseHooksProvider",
);
