import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import {
  CreateIndexFileArgs,
  CreateIndexFileResult,
  MutationStatus,
} from "../types";
import { useMutation } from "../utils";

export const useCreateIndexFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: CreateIndexFileArgs) => void;
  onSuccess?: (result: CreateIndexFileResult) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionCreateFile } = useAction();

  const {
    result,
    setResult,
    error,
    setError,
    status,
    setStatus,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
  } = useMutation<CreateIndexFileResult>();

  const createIndexFile = useCallback(
    async (args: CreateIndexFileArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params?.onPending(args);
        }

        const encrypted: { [k: string]: boolean } = {};
        if (args.fileContent && Object.keys(args.fileContent).length > 0) {
          Object.keys(args.fileContent).forEach(key => {
            encrypted[key] = false;
          });
        }

        const inputFileContent = {
          encrypted,
          ...args.fileContent,
        };

        const createdIndexFile: CreateIndexFileResult =
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.createIndexFile,
            params: {
              modelId: args.modelId,
              fileName: args.fileName,
              fileContent: {
                ...inputFileContent,
                encrypted:
                  typeof inputFileContent.encrypted === "string"
                    ? inputFileContent.encrypted
                    : JSON.stringify(inputFileContent.encrypted),
              },
            },
          });

        actionCreateFile(
          {
            ...createdIndexFile,
            ...createdIndexFile.fileContent.file,
            content: createdIndexFile.fileContent.content,
          },
          args.modelId,
        );

        setResult(createdIndexFile);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params?.onSuccess(createdIndexFile);
        }
        return createdIndexFile;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (params?.onError) {
          params?.onError(error);
        }
        throw error;
      }
    },
    [
      dataverseConnector,
      actionCreateFile,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    createdIndexFile: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    createIndexFile,
  };
};
