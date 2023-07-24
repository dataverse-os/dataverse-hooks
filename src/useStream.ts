import { useState } from "react";
import {
  FileType,
  Currency,
  WALLET,
  StreamRecord,
  DecryptionConditions,
  SYSTEM_CALL,
  DataverseConnector,
} from "@dataverse/dataverse-connector";
import { Model } from "@dataverse/model-parser";

type StreamRecordMap = Record<string, StreamRecord>;

export function useStream({
  dataverseConnector,
  appId,
}: {
  dataverseConnector: DataverseConnector;
  appId: string;
}) {
  const [pkh, setPkh] = useState<string>();
  const [streamsRecord, setStreamsRecord] = useState<StreamRecordMap>(
    {} as any,
  );

  const checkCapability = async () => {
    const res = await dataverseConnector.runOS({
      method: SYSTEM_CALL.checkCapability,
    });
    return res;
  };

  const createCapability = async (wallet: WALLET) => {
    const currentPkh = await dataverseConnector.runOS({
      method: SYSTEM_CALL.createCapability,
      params: {
        wallet,
        appId,
      },
    });
    setPkh(currentPkh);

    return currentPkh;
  };

  const loadStreams = async ({
    pkh,
    modelId,
  }: {
    pkh?: string;
    modelId: string;
  }) => {
    let streams;
    if (pkh) {
      streams = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadStreamsBy,
        params: {
          modelId,
          pkh,
        },
      });
    } else {
      streams = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadStreamsBy,
        params: {
          modelId,
        },
      });
    }
    setStreamsRecord(streams);
    return streams;
  };

  const createPublicStream = async ({
    model,
    stream,
  }: {
    model: Model;
    stream?: object;
  }) => {
    const modelStream = model.streams[model.streams.length - 1];
    const encrypted = {} as any;
    if (stream && Object.keys(stream).length > 0) {
      Object.keys(stream).forEach(key => {
        encrypted[key] = false;
      });
    }

    const inputStreamContent = {
      ...stream,
      ...(!modelStream.isPublicDomain &&
        stream && {
          encrypted: JSON.stringify(encrypted),
        }),
    };

    const { pkh, modelId, streamId, streamContent } =
      await dataverseConnector.runOS({
        method: SYSTEM_CALL.createStream,
        params: {
          modelId: modelStream.modelId,
          streamContent: inputStreamContent,
        },
      });

    if (streamContent) {
      return _updateStreamRecord({
        pkh,
        modelId,
        streamId,
        streamContent,
      });
    } else {
      throw "Failed to update stream list";
    }
  };

  const createEncryptedStream = async ({
    modelId,
    stream,
    encrypted,
    requireUpdateStreamRecord = true,
  }: {
    modelId: string;
    stream: object;
    encrypted: object;
    requireUpdateStreamRecord?: boolean;
  }) => {
    const inputStreamContent = {
      ...stream,
      ...(stream && {
        encrypted: JSON.stringify(encrypted),
      }),
    };
    const { pkh, streamId, streamContent } = await dataverseConnector.runOS({
      method: SYSTEM_CALL.createStream,
      params: {
        modelId,
        streamContent: inputStreamContent,
      },
    });

    if (streamContent) {
      if (requireUpdateStreamRecord) {
        return _updateStreamRecord({
          pkh,
          modelId,
          streamId,
          streamContent,
        });
      }
      return {
        streamId,
        appId,
        pkh,
        modelId,
        streamContent,
      };
    } else {
      throw "Failed to create stream";
    }
  };

  const createPayableStream = async ({
    pkh,
    modelId,
    profileId,
    stream,
    lensNickName,
    currency,
    amount,
    collectLimit,
    encrypted,
  }: {
    pkh: string;
    modelId: string;
    profileId?: string;
    stream: object;
    lensNickName?: string;
    currency: Currency;
    amount: number;
    collectLimit: number;
    encrypted: object;
  }) => {
    if (!profileId) {
      profileId = await _getProfileId(lensNickName);
    }

    const { streamId, streamContent } = await createEncryptedStream({
      modelId,
      stream,
      encrypted,
      requireUpdateStreamRecord: false,
    });

    return monetizeStream({
      pkh,
      modelId,
      lensNickName,
      streamId,
      streamContent,
      profileId,
      currency,
      amount,
      collectLimit,
    });
  };

  const monetizeStream = async ({
    pkh,
    modelId,
    streamId,
    lensNickName,
    profileId,
    streamContent,
    currency,
    amount,
    collectLimit,
    decryptionConditions,
  }: {
    pkh: string;
    modelId: string;
    streamId: string;
    lensNickName?: string;
    streamContent?: any;
    profileId?: string;
    currency: Currency;
    amount: number;
    collectLimit: number;
    decryptionConditions?: DecryptionConditions;
  }) => {
    if (!profileId) {
      profileId = await _getProfileId(lensNickName);
    }
    if (!streamContent) {
      streamContent = streamsRecord[streamId].streamContent;
    }
    const { streamContent: updatedStreamContent } =
      await dataverseConnector.runOS({
        method: SYSTEM_CALL.monetizeFile,
        params: {
          streamId,
          indexFileId: streamContent?.file.indexFileId,
          datatokenVars: {
            profileId,
            currency,
            amount,
            collectLimit,
          },
          decryptionConditions,
        },
      });
    if (updatedStreamContent) {
      return _updateStreamRecord({
        pkh,
        modelId,
        streamId,
        streamContent: updatedStreamContent,
      });
    } else {
      throw "Failed to monetize file";
    }
  };

  const updateStream = async ({
    model,
    streamId,
    stream,
    encrypted,
  }: {
    model: Model;
    streamId: string;
    stream: object;
    encrypted?: object;
  }) => {
    const modelStream = model.streams[model.streams.length - 1];

    const fileType = streamsRecord[streamId]?.streamContent.file.fileType;
    if (
      !modelStream.isPublicDomain &&
      stream &&
      encrypted &&
      fileType === FileType.Public
    ) {
      for (const key in encrypted) {
        (encrypted as any)[key] = false;
      }
    }
    const inputStreamContent = {
      ...stream,
      encrypted: JSON.stringify(encrypted),
    };

    const { streamContent } = await dataverseConnector.runOS({
      method: SYSTEM_CALL.updateStream,
      params: {
        streamId,
        streamContent: inputStreamContent,
        syncImmediately: true,
      },
    });

    return _updateStreamRecord({
      streamId,
      streamContent: streamContent,
    });
  };

  const unlockStream = async (streamId: string) => {
    const { streamContent } = await dataverseConnector.runOS({
      method: SYSTEM_CALL.unlock,
      params: {
        streamId,
      },
    });

    if (streamContent) {
      return _updateStreamRecord({
        streamId,
        streamContent,
      });
    } else {
      throw "Fail to unlock stream";
    }
  };

  const _getProfileId = async (lensNickName?: string) => {
    const lensProfiles = await dataverseConnector.getProfiles(
      dataverseConnector.address!,
    );

    let profileId;
    if (lensProfiles?.[0]?.id) {
      profileId = lensProfiles?.[0]?.id;
    } else {
      if (!lensNickName) {
        throw "Please pass in lensNickName";
      }
      if (!/^[\da-z]{5,26}$/.test(lensNickName) || lensNickName.length > 26) {
        throw "Only supports lower case characters, numbers, must be minimum of 5 length and maximum of 26 length";
      }
      profileId = await dataverseConnector.createProfile(lensNickName);
    }
    return profileId;
  };

  const _updateStreamRecord = ({
    pkh,
    modelId,
    streamId,
    streamContent,
  }: {
    pkh?: string;
    modelId?: string;
    streamId: string;
    streamContent: any;
  }) => {
    const streamsRecordCopy = JSON.parse(
      JSON.stringify(streamsRecord),
    ) as StreamRecordMap;

    if (pkh && modelId) {
      streamsRecordCopy[streamId] = {
        appId,
        pkh,
        modelId,
        streamContent,
      };
    } else {
      streamsRecordCopy[streamId] = {
        ...streamsRecordCopy[streamId],
        streamContent,
      };
    }
    setStreamsRecord(streamsRecordCopy);

    return {
      streamId,
      appId: streamsRecordCopy[streamId].appId,
      pkh: pkh || streamsRecordCopy[streamId].pkh,
      modelId: modelId || streamsRecordCopy[streamId].modelId,
      streamContent,
    };
  };

  return {
    pkh,
    streamsRecord,
    checkCapability,
    createCapability,
    loadStreams,
    createPublicStream,
    createEncryptedStream,
    createPayableStream,
    monetizeStream,
    unlockStream,
    updateStream,
  };
}
