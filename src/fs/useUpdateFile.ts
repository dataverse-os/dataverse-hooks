import { useCallback } from "react";

import { SYSTEM_CALL, FileType } from "@dataverse/dataverse-connector";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus, UpdateFileArgs, UpdateFileResult } from "../types";
import { useMutation } from "../utils";

export const useUpdateFile = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: UpdateFileArgs) => void;
  onSuccess?: (result: UpdateFileResult) => void;
}) => {
  const { dataverseConnector, filesMap } = useStore();
  const { actionUpdateFile } = useAction();

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

  const updateFile = useCallback(
    async ({
      model,
      fileId,
      fileName,
      fileContent,
      encrypted,
    }: UpdateFileArgs) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending({
            model,
            fileId,
            fileContent,
            encrypted,
          });
        }
        const modelStream = model.streams[model.streams.length - 1];

        const fileType = filesMap![fileId]?.fileContent.file?.fileType;
        if (
          !modelStream.isPublicDomain &&
          fileContent &&
          encrypted &&
          fileType === FileType.PublicFileType
        ) {
          for (const key in encrypted) {
            (encrypted as any)[key] = false;
          }
        }
        const _fileContent = {
          ...fileContent,
          encrypted: JSON.stringify(encrypted),
        };

        const updateResult: UpdateFileResult = await dataverseConnector.runOS({
          method: SYSTEM_CALL.updateFile,
          params: {
            fileId,
            fileName,
            fileContent: fileContent && _fileContent,
            syncImmediately: true,
          },
        });

        actionUpdateFile({
          fileId: fileId,
          ...updateResult,
        });

        setStatus(MutationStatus.Succeed);
        setResult(updateResult);
        if (params?.onSuccess) {
          params.onSuccess(updateResult);
        }

        return updateResult;
      } catch (error) {
        setStatus(MutationStatus.Failed);
        setError(error);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [
      dataverseConnector,
      filesMap,
      actionUpdateFile,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    updatedFileContent: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    updateFile,
  };
};
