import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { CreateFileArgs, CreateFileResult, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useCreateFile = ({
  onError,
  onPending,
  onSuccess,
}: {
  onError?: (error: any) => void;
  onPending?: (args: CreateFileArgs) => void;
  onSuccess?: (result: CreateFileResult) => void;
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
  } = useMutation();

  const createFile = useCallback(
    async (args: CreateFileArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (onPending) {
          onPending(args);
        }

        const encrypted: { [k: string]: boolean } = {};
        if (args.fileContent && Object.keys(args.fileContent).length > 0) {
          Object.keys(args.fileContent).forEach(key => {
            encrypted[key] = false;
          });
        }

        const inputFileContent = {
          ...(args.fileContent && {
            encrypted: JSON.stringify(encrypted),
          }),
          ...args.fileContent,
        };

        const createdFile: CreateFileResult = (
          await dataverseConnector.runOS({
            method: SYSTEM_CALL.createFile,
            params: {
              modelId: args.modelId,
              fileContent: inputFileContent,
            },
          })
        ).fileContent;

        actionCreateFile(createdFile);

        setResult(createdFile);
        setStatus(MutationStatus.Succeed);
        if (onSuccess) {
          onSuccess(createdFile);
        }
        return createdFile;
      } catch (error) {
        setError(error);
        setStatus(MutationStatus.Failed);
        if (onError) {
          onError(error);
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
      onPending,
      onError,
      onSuccess,
    ],
  );

  return {
    createdFile: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    createFile,
  };
};
