import { useCallback } from "react";

import { DATATOKENID_NOT_EXIST } from "../errors";
import { useStore } from "../store";
import { useAction } from "../store";
import { DatatokenInfo, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useDatatokenInfo = (params?: {
  onError?: (error: any) => void;
  onPending?: (streamId: string) => void;
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
  } = useMutation();

  const getDatatokenInfo = useCallback(
    async (fileId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(fileId);
        }

        const datatokenId =
          filesMap![fileId].accessControl?.monetizationProvider?.datatokenId;

        if (!datatokenId) {
          throw DATATOKENID_NOT_EXIST;
        }

        const datatokenInfo: DatatokenInfo =
          await dataverseConnector.getDatatokenBaseInfo(datatokenId);

        actionUpdateDatatokenInfo({
          streamId: fileId,
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
