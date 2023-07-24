import { useState } from "react";
import {
  DataverseConnector,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";

type Props = {
  dataverseConnector: DataverseConnector;
  appId: string;
};

export const useCapability = ({ dataverseConnector, appId }: Props) => {
  const [pkh, setPkh] = useState<string>();

  const createCapability = async () => {
    const currentPkh = await dataverseConnector.runOS({
      method: SYSTEM_CALL.createCapability,
      params: {
        appId,
      },
    });
    setPkh(currentPkh);
    return {
      currentPkh,
    };
  };

  return {
    pkh,
    createCapability,
  };
};
