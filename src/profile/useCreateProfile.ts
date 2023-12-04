import { useCallback } from "react";

import { ChainId } from "@dataverse/contracts-sdk/data-token";

import { useStore } from "../store";
import { useAction } from "../store";
import { MutationStatus } from "../types";
import { useMutation } from "../utils";

export const useCreateProfile = (params?: {
  onError?: (error: any) => void;
  onPending?: (args: { chainId: ChainId; handle: string }) => void;
  onSuccess?: (result: string) => void;
}) => {
  const { dataverseConnector } = useStore();
  const { actionCreateProfile } = useAction();

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
  } = useMutation<string>();

  const createProfile = useCallback(
    async (args: { chainId: ChainId; handle: string }) => {
      try {
        setStatus(MutationStatus.Pending);
        if (params?.onPending) {
          params.onPending(args);
        }
        const profileId = await dataverseConnector.createProfile(args);

        actionCreateProfile(profileId);

        setResult(profileId);
        setStatus(MutationStatus.Succeed);
        if (params?.onSuccess) {
          params.onSuccess(profileId);
        }

        return profileId;
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
      actionCreateProfile,
      setStatus,
      setError,
      setResult,
      params?.onPending,
      params?.onError,
      params?.onSuccess,
    ],
  );

  return {
    profileId: result,
    error,
    status,
    isIdle,
    isPending,
    isSucceed,
    isFailed,
    setStatus,
    reset,
    createProfile,
  };
};
