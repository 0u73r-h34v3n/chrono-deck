import { isNil } from "./isNil";

export function getMinValidSyncInterval(
  syncInterval: Nullable<string | number>,
): number {
  if (isNil(syncInterval)) {
    return 1;
  }

  if (
    typeof syncInterval === "number" &&
    syncInterval > 0 &&
    Number.isInteger(syncInterval)
  ) {
    return syncInterval;
  }

  // @ts-expect-error `parseInt` accept `number`
  const syncIntervalAsInt = Number.parseInt(syncInterval, 10);

  if (typeof syncInterval === "string" && Number.isNaN(syncIntervalAsInt)) {
    return 1;
  }

  if (syncIntervalAsInt > 0) {
    return syncIntervalAsInt;
  }

  return 1;
}
