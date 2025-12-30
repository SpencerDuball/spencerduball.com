/**
 * Returns a new set containing elements in A that are not in B.
 */
export const difference = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  const result = new Set<T>(setA);
  for (const item of setB) result.delete(item);
  return result;
};

/**
 * Returns a new set containing only elements present in both sets.
 */
export const intersection = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  const result = new Set<T>();
  for (const item of setA) if (setB.has(item)) result.add(item);
  return result;
};

/**
 * Checks if every element in setA is also in setB.
 */
export const isSubsetOf = <T>(setA: Set<T>, setB: Set<T>): boolean => {
  for (const item of setA) if (!setB.has(item)) return false;
  return true;
};

/**
 * Checks if every element in setB is also in setA.
 */
export const isSupersetOf = <T>(setA: Set<T>, setB: Set<T>): boolean => {
  return isSubsetOf(setB, setA);
};

/**
 * Returns a new set containing all unique elements from both sets.
 */
export const union = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  return new Set<T>([...setA, ...setB]);
};
