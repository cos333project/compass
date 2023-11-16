import { createContext, useCallback, useContext, useMemo } from "react";

export const AssignmentsContext = createContext(null);

export const useAssignedHeads = (id) => {
  const ctx = useContext(AssignmentsContext);

  return useMemo(() => {
    const headIds = [];

    for (const [headId, projectId] of Object.entries(ctx)) {
      if (projectId === id) {
        headIds.push(headId);
      }
    }

    return headIds;
  }, [ctx, id]);
};

export const useAssignedIdCount = () => {
  const ctx = useContext(AssignmentsContext);

  return useCallback(
    (id) => {
      let count = 0;
      for (const [headId] of Object.entries(ctx)) {
        if (headId.startsWith(id)) {
          count += 1;
        }
      }
      return count;
    },
    [ctx]
  );
};

export const useIsAssigned = () => {
  const ctx = useContext(AssignmentsContext);

  return useCallback(
    (id) => {
      return !!ctx[id];
    },
    [ctx]
  );
};
