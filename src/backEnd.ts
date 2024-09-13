import { call } from "@decky/api";
import type { GameMetadata } from "@type/gameMetadata";
import type { GameMetadataJSON, LocalSavedMetadata } from "@type/localMetadata";
import { mapToJSON } from "./utils/mapToJSON";

export async function saveMetdata(
  lastActualizeDate: Date,
  gamesMetadata: Map<number, GameMetadata>,
): Promise<void> {
  const mapAsJSON = mapToJSON<number, GameMetadata, GameMetadataJSON>(
    gamesMetadata,
  );

  return call("save_metadata", {
    lastActualizeDate,
    gamesMetadata: mapAsJSON,
  });
}

export async function getMetadata(): Promise<LocalSavedMetadata> {
  return call("get_metadata");
}
