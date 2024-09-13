import type { GameMetadata } from "./gameMetadata";

export type GameMetadataJSON = Record<number, GameMetadata>;

export type LocalSavedMetadata = {
  gamesMetadata?: GameMetadataJSON;
  lastSyncDate?: string;
  syncIntervalDays?: number;
};
