import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { DATATOKENID_NOT_EXIST } from "../errors";
import { useStore } from "../store";
import { useAction } from "../store";
import { DatatokenInfo, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useDatatokenInfo = (params?: {
  onError?: (error: any) => void;
  onPending?: (fileId: string) => void;
  onSuccess?: (result: DatatokenInfo) => void;
}) => {
  const { dataverseConnector, filesMap } = useStore();
  const { actionUpdateDatatokenInfo } = useAction();

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
  } = useMutation<DatatokenInfo>();

  const getDatatokenInfo = useCallback(
    async (fileId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(fileId);
        }

        const datatokenId =
          filesMap![fileId].fileContent.file.accessControl?.monetizationProvider
            ?.datatokenId;

        if (!datatokenId) {
          throw DATATOKENID_NOT_EXIST;
        }

        const datatokenInfo = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadDatatoken,
          params: datatokenId,
        });

        actionUpdateDatatokenInfo({
          fileId,
          datatokenInfo,
        });

        setStatus(MutationStatus.Succeed);
        setResult(datatokenInfo);
        if (params?.onSuccess) {
          params.onSuccess(datatokenInfo);
        }
        return datatokenInfo;
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
      actionUpdateDatatokenInfo,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    datatokenInfo: result as DatatokenInfo,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    getDatatokenInfo,
  };
};
