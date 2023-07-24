import { StreamRecord } from "@dataverse/dataverse-connector";
import React, { createContext, ReactNode, useReducer } from "react";

// Context
type ContextType = {
  streamRecordMap: Record<string, StreamRecord>;
};

const HooksContext = createContext<ContextType>({ streamRecordMap: {} });

export const StreamRecordMapProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state] = useReducer(reducer, initialState);

  return (
    <HooksContext.Provider
      value={{
        streamRecordMap: state.streamRecordMap,
      }}
    >
      {children}
    </HooksContext.Provider>
  );
};

// State
export const initialState: ContextType = {
  streamRecordMap: {},
};

export enum ActionType {
  Create,
  Read,
  Update,
  Delete,
}

export const reducer = (state: any, action: any) => {
  const { type, payload } = action;

  switch (type) {
    case ActionType.Create: {
      const streamId = payload.streamId;
      delete payload.streamId;
      return {
        ...state,
        streamRecordMap: state.streamRecordMap[streamId](payload),
      };
    }

    case ActionType.Read: {
      return {
        ...state,
        streamRecordMap: payload,
      };
    }

    case ActionType.Update: {
      const streamId = payload.streamId;
      delete payload.streamId;
      state.streamRecordMap[streamId].steamContent = payload;
      return {
        ...state,
        streamRecordMap: state.streamRecordMap,
      };
    }

    case ActionType.Delete: {
      break;
    }

    default: {
      throw new Error("No such ActionType");
    }
  }
};

// export const useStore = () => {
//   const context = useContext(StreamRecordsContext);
//   if (context === undefined) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// };
