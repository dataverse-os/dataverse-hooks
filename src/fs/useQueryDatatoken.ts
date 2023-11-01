import { useCallback } from "react";

import { RequestType, SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";

export const useQueryDatatoken = () => {
  const { dataverseConnector } = useStore();

  const loadDatatokensByCreator = useCallback(
    async (params: RequestType["loadDatatokensCreatedBy"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDatatokensCreatedBy,
        params,
      });
    },
    [dataverseConnector],
  );

  const loadDatatokensByCollector = useCallback(
    async (params: RequestType["loadDatatokensCollectedBy"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDatatokensCollectedBy,
        params,
      });
    },
    [dataverseConnector],
  );

  const loadDatatokenCollectors = useCallback(
    async (params: RequestType["loadDatatokenCollectors"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDatatokenCollectors,
        params,
      });
    },
    [dataverseConnector],
  );

  const isDatatokenCollectedBy = useCallback(
    async (params: RequestType["isDatatokenCollectedBy"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.isDatatokenCollectedBy,
        params,
      });
    },
    [dataverseConnector],
  );

  return {
    loadDatatokensByCreator,
    loadDatatokensByCollector,
    loadDatatokenCollectors,
    isDatatokenCollectedBy,
  };
};
