import { useCallback } from "react";
import { ADDRESS_UNDEFINED } from "../errors";
import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useProfiles = (params?: {
  onError?: (error: any) => void;
  onPending?: (address: string) => void;
  onSuccess?: (result: string[]) => void;
}) => {
  const { address, dataverseConnector } = useStore();
  const { actionLoadProfileIds } = useAction();

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
        const targetAddress = address || accountAddress;
        if (!targetAddress) {
          throw ADDRESS_UNDEFINED;
        }

        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(targetAddress);
        }
        const profileIds = (
          await dataverseConnector.getProfiles(targetAddress)
        ).map(value => value.id);

        actionLoadProfileIds(profileIds);

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
    [
      address,
      dataverseConnector,
      actionLoadProfileIds,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    profileIds: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    getProfiles,
  };
};
