import { useCallback } from "react";
import { ADDRESS_UNDEFINED, DATAVERSE_CONNECTOR_UNDEFINED } from "../errors";
import { useStore } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useGetProfiles = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: string[]) => void;
}) => {
  const {
    state: { dataverseConnector, address },
  } = useStore();

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

  const getProfiles = useCallback(
    async (accountAddress?: string) => {
      try {
        if (!dataverseConnector) {
          throw DATAVERSE_CONNECTOR_UNDEFINED;
        }
        const targetAddress = address || accountAddress;
        if (!targetAddress) {
          throw ADDRESS_UNDEFINED;
        }
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params?.onPending();
        }
        const profileIds = (
          await dataverseConnector.getProfiles(targetAddress)
        ).map(value => value.id);
        setResult(profileIds);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params?.onSuccess(profileIds);
        }
      } catch (error) {
        setStatus(MutationStatus.Failed);
        setError(error);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [dataverseConnector],
  );

  return {
    result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    reset,
    getProfiles,
  };
};
