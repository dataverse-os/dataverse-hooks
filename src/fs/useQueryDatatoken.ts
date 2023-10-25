import { useCallback } from "react";

import { RequestType, SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";

export const useQueryDatatoken = () => {
  const { dataverseConnector } = useStore();

  const loadDatatokensByCreator = useCallback(
    async (params: RequestType["loadDatatokensByCreator"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDatatokensByCreator,
        params,
      });
    },
    [dataverseConnector],
  );

  const loadDatatokensByCollector = useCallback(
    async (params: RequestType["loadDatatokensByCollector"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDatatokensByCollector,
        params,
      });
    },
    [dataverseConnector],
  );

  const loadDatatokenDetail = useCallback(
    async (params: RequestType["loadDatatokenDetail"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDatatokenDetail,
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
    loadDatatokenDetail,
    loadDatatokenCollectors,
    isDatatokenCollectedBy,
  };
};
