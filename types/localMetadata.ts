import type { GameMetadata } from "./gameMetadata";

export type GameMetadataJSON = Record<number, GameMetadata>;

export type LocalSavedMetadata = {
  lastActualizeDate?: string;
  gamesMetadata?: GameMetadataJSON;
};
