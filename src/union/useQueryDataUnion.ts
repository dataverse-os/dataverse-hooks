import { useCallback } from "react";

import { RequestType, SYSTEM_CALL } from "@dataverse/dataverse-connector";

import { useStore } from "../store";

export const useQueryDataUnion = () => {
  const { dataverseConnector } = useStore();

  // const loadDataUnionsByPublisher = useCallback(
  //   async (params: RequestType["loadDataUnionsPublishedBy"]) => {
  //     return await dataverseConnector.runOS({
  //       method: SYSTEM_CALL.loadDataUnionsPublishedBy,
  //       params,
  //     });
  //   },
  //   [dataverseConnector],
  // );

  // const loadDataUnionsByCollector = useCallback(
  //   async (params: RequestType["loadDataUnionsCollectedBy"]) => {
  //     return await dataverseConnector.runOS({
  //       method: SYSTEM_CALL.loadDataUnionsCollectedBy,
  //       params,
  //     });
  //   },
  //   [dataverseConnector],
  // );

  const loadDataUnionDetail = useCallback(
    async (params: RequestType["loadDataUnion"]) => {
      return await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadDataUnion,
        params,
      });
    },
    [dataverseConnector],
  );

  // const loadDataUnionCollectors = useCallback(
  //   async (params: RequestType["loadDataUnionCollectors"]) => {
  //     return await dataverseConnector.runOS({
  //       method: SYSTEM_CALL.loadDataUnionCollectors,
  //       params,
  //     });
  //   },
  //   [dataverseConnector],
  // );

  // const loadDataUnionSubscribers = useCallback(
  //   async (params: RequestType["loadDataUnionSubscribers"]) => {
  //     return await dataverseConnector.runOS({
  //       method: SYSTEM_CALL.loadDataUnionSubscribers,
  //       params,
  //     });
  //   },
  //   [dataverseConnector],
  // );

  // const loadDataUnionSubscriptionListByCollector = useCallback(
  //   async (params: RequestType["loadDataUnionSubscriptionsBy"]) => {
  //     return await dataverseConnector.runOS({
  //       method: SYSTEM_CALL.loadDataUnionSubscriptionsBy,
  //       params,
  //     });
  //   },
  //   [dataverseConnector],
  // );

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
    // loadDataUnionsByPublisher,
    // loadDataUnionsByCollector,
    loadDataUnionDetail,
    // loadDataUnionCollectors,
    // loadDataUnionSubscribers,
    // loadDataUnionSubscriptionListByCollector,
    isDataUnionCollectedBy,
    isDataUnionSubscribedBy,
  };
};
