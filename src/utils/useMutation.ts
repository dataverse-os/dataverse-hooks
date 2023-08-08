import { useMemo, useState } from "react";
import { MutationStatus } from "../types";

export const useMutation = () => {
  const [result, setResult] = useState<unknown>();
  const [error, setError] = useState<unknown>();
  const [status, setStatus] = useState<MutationStatus>(MutationStatus.Idle);
  const isIdle = useMemo(() => {
    return status === MutationStatus.Idle;
  }, [status]);
  const isPending = useMemo(() => {
    return status === MutationStatus.Pending;
  }, [status]);
  const isSucceed = useMemo(() => {
    return status === MutationStatus.Succeed;
  }, [status]);
  const isFailed = useMemo(() => {
    return status === MutationStatus.Failed;
  }, [status]);

  const reset = () => {
    setResult(undefined);
    setError(undefined);
    setStatus(MutationStatus.Idle);
  };

  return {
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
    setStatus,
    reset,
  };
};
