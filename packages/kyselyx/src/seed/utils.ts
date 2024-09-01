export function getLast<T>(arr: ArrayLike<T>): T | undefined {
  return arr[arr.length - 1];
}

export function freeze<T>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}
