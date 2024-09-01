export function isNil<T>(data: T): data is Extract<T, null | undefined> {
  return data === null || data === undefined;
}
