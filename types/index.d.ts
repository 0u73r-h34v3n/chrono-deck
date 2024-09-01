declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

type SteamAppAchievement = {
  strID: string;
  strName: string;
  strDescription: string;
  bAchieved: boolean;
  rtUnlocked: number;
  strImage: string;
  bHidden: boolean;
  flMinProgress: number;
  flCurrentProgress: number;
  flMaxProgress: number;
  flAchieved: number;
};

type Bypass = {
  bypass: number;
  bypassCounter: number;
};

type FetchoNoCorsResponse = {
  body: string;
  header: unknown;
  status: number;
};

type Nullable<T> = T | undefined | null;

type Platforms =
  | "GameCube"
  | "Nintendo3DS"
  | "NintendoDS"
  | "PS1"
  | "PS2"
  | "PSP"
  | "SNES";
