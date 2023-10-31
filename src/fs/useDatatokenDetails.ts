import { useCallback } from "react";

import { SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { DATATOKENID_NOT_EXIST } from "../errors";
import { useStore } from "../store";
import { useAction } from "../store";
import { DatatokenInfo, MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useDatatokenDetails = (params?: {
  onError?: (error: any) => void;
  onPending?: (fileIds: string[]) => void;
  onSuccess?: (result: DatatokenInfo[]) => void;
}) => {
  const { dataverseConnector, filesMap } = useStore();
  const { actionUpdateDatatokenInfos } = useAction();

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
  } = useMutation<DatatokenInfo[]>();

  const getDatatokenDetails = useCallback(
    async (fileIds: string[]) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(fileIds);
        }

        const datatokenIds = fileIds.map(fileId => {
          const datatokenId =
            filesMap![fileId].fileContent.file.accessControl
              ?.monetizationProvider?.datatokenId;

          if (!datatokenId) {
            throw DATATOKENID_NOT_EXIST;
          }

          return datatokenId;
        });

        const datatokenInfos = await dataverseConnector.runOS({
          method: SYSTEM_CALL.loadDatatokenDetailsBy,
          params: datatokenIds,
        });

        actionUpdateDatatokenInfos({
          fileIds,
          datatokenInfos,
        });

        setStatus(MutationStatus.Succeed);
        setResult(datatokenInfos);
        if (params?.onSuccess) {
          params.onSuccess(datatokenInfos);
        }
        return datatokenInfos;
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
      actionUpdateDatatokenInfos,
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
    getDatatokenDetails,
  };
};
