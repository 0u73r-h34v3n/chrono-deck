import type { SteamDeckCompatibilityCategory } from "../src/enums";

type GameMetadata = {
  _id: string;
  asia_release_date: string;
  category: Array<StoreCategory>;
  compatibility: keyof typeof SteamDeckCompatibilityCategory;
  compatibility_notes: string;
  developers: Array<string>;
  europe_release_date: string;
  full_description: string;
  launchCommand: string;
  north_america_release_date: string;
  platform: string;
  publishers: Array<string>;
  short_description: string;
  titles: Array<string>;
  metacriticScore: Nullable<number>;
  sizeOnDisk: Nullable<number>;
};

type GameMetadataRaw = Omit<GameMetadata, "category"> & {
  category: string;
};

type GamesMetadataOnlyReleaseDates = Pick<
  GameMetadata,
  "europe_release_date" | "north_america_release_date" | "asia_release_date"
>;
