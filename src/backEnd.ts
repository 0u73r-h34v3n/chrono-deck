import { call } from "@decky/api";
import type { GameMetadata } from "@type/gameMetadata";
import type { GameMetadataJSON, LocalSavedMetadata } from "@type/localMetadata";
import { mapToJSON } from "./utils/mapToJSON";
import { getMinValidSyncInterval } from "./utils/number";

export async function saveMetdata(
  lastSyncDate: Date,
  gamesMetadata: Map<number, GameMetadata>,
  syncIntervalDays = 1,
): Promise<void> {
  const mapAsJSON = mapToJSON<number, GameMetadata, GameMetadataJSON>(
    gamesMetadata,
  );
  const metadataToSave = {
    syncIntervalDays: getMinValidSyncInterval(syncIntervalDays),
    lastSyncDate,
    gamesMetadata: mapAsJSON,
  } as Record<keyof LocalSavedMetadata, unknown>;

  return call("save_metadata", metadataToSave);
}

export async function getMetadata(): Promise<LocalSavedMetadata> {
  return call("get_metadata");
}
