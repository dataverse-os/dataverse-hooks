import { useCallback } from "react";

import { RequestType, SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";

export const useQueryDataUnion = () => {
  const { dataverseConnector } = useStore();

  const loadDataUnionsByPublisher = useCallback(
    async (params: RequestType["loadDataUnionsByPublisher"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDataUnionsByPublisher,
        params,
      });
    },
    [dataverseConnector],
  );

  const loadDataUnionsByCollector = useCallback(
    async (params: RequestType["loadDataUnionsByCollector"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDataUnionsByCollector,
        params,
      });
    },
    [dataverseConnector],
  );

  const loadDataUnionDetail = useCallback(
    async (params: RequestType["loadDataUnionDetail"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDataUnionDetail,
        params,
      });
    },
    [dataverseConnector],
  );

  const loadDataUnionCollectors = useCallback(
    async (params: RequestType["loadDataUnionCollectors"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDataUnionCollectors,
        params,
      });
    },
    [dataverseConnector],
  );

  const loadDataUnionSubscribers = useCallback(
    async (params: RequestType["loadDataUnionSubscribers"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDataUnionSubscribers,
        params,
      });
    },
    [dataverseConnector],
  );

  const isDataUnionCollectedBy = useCallback(
    async (params: RequestType["isDataUnionCollectedBy"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.isDataUnionCollectedBy,
        params,
      });
    },
    [dataverseConnector],
  );

  const isDataUnionSubscribedBy = useCallback(
    async (params: RequestType["isDataUnionSubscribedBy"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.isDataUnionSubscribedBy,
        params,
      });
    },
    [dataverseConnector],
  );

  return {
    loadDataUnionsByPublisher,
    loadDataUnionsByCollector,
    loadDataUnionDetail,
    loadDataUnionCollectors,
    loadDataUnionSubscribers,
    isDataUnionCollectedBy,
    isDataUnionSubscribedBy,
  };
};
