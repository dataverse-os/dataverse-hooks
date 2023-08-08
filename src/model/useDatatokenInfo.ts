import { useStore } from "../store";
import { useMutation } from "../utils";
import { DatatokenInfo, MutationStatus } from "../types";
import { useCallback } from "react";
import { useAction } from "../store/useAction";
import { DATATOKENID_NOT_EXIST } from "../errors";

export const useDatatokenInfo = (params?: {
  onError?: (error: any) => void;
  onPending?: (streamId: string) => void;
  onSuccess?: (result: DatatokenInfo) => void;
}) => {
  const { dataverseConnector, streamsMap } = useStore();
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
    async (streamId: string) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(streamId);
        }

        const datatokenId = streamsMap[streamId].streamContent.file.datatokenId;

        if (!datatokenId) {
          throw DATATOKENID_NOT_EXIST;
        }

        const datatokenInfo: DatatokenInfo =
          await dataverseConnector.getDatatokenBaseInfo(datatokenId);

        actionUpdateDatatokenInfo({
          streamId,
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
    [actionUpdateDatatokenInfo],
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
