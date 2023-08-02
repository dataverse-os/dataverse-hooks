export const deepAssignRenameKey = (
  source: object | [],
  keyMap: Record<string, string>[] = [],
  deep = true,
) => {
  if (
    !source ||
    typeof source !== "object" ||
    Object.keys(source).length === undefined
  ) {
    return source;
  }
  let cloneObj = source instanceof Array ? [] : {};
  if (deep) {
    Object.keys(source).forEach(sKey => {
      // @ts-expect-error ts(7053)
      cloneObj[transfromKeyMap(sKey, keyMap)] = deepAssignRenameKey(
        // @ts-expect-error ts(7053)
        source[sKey],
      );
    });
  } else {
    cloneObj = source;
  }
  return cloneObj;
};

const transfromKeyMap = (
  sourceKey: string,
  keyMap: Record<string, string>[],
) => {
  let returnKey: string = sourceKey;
  keyMap.map(map => {
    if (map[sourceKey]) {
      returnKey = map[sourceKey];
    }
  });
  return returnKey;
};
