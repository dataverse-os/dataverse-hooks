import { useCallback } from "react";
import { ADDRESS_UNDEFINED } from "../errors";
import { useStore } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useProfiles = (params?: {
  onError?: (error?: unknown) => void;
  onPending?: () => void;
  onSuccess?: (result?: string[]) => void;
}) => {
  const { state } = useStore();

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
        const targetAddress = state.address || accountAddress;
        if (!targetAddress) {
          throw ADDRESS_UNDEFINED;
        }

        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending();
        }
        const profileIds = (
          await state.dataverseConnector.getProfiles(targetAddress)
        ).map(value => value.id);
        setResult(profileIds);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(profileIds);
        }

        return profileIds;
      } catch (error) {
        setStatus(MutationStatus.Failed);
        setError(error);
        if (params?.onError) {
          params.onError(error);
        }
        throw error;
      }
    },
    [state.address],
  );

  return {
    profileIds: result,
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
