import { fetchNoCors, toaster } from "@decky/api";
import waitUntil from "async-wait-until";
import { closest } from "fastest-levenshtein";
import {
  APP_TYPE,
  SteamDeckCompatibilityCategory,
  StoreCategory,
} from "./enums";
import { dateToUnixTimestamp } from "./utils/date";
import getAppDetails from "./utils/getAppDetails";
import { isNil } from "./utils/isNil";
import logger from "./utils/logger";

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
};

type GameMetadataRaw = Omit<GameMetadata, "category"> & {
  category: string;
};

export class GamesMetadata {
  public static gamesMetadata = new Map<number, GameMetadata>();

  private static getAllNonSteamAppIds() {
    return Array.from(collectionStore.deckDesktopApps.apps.keys());
  }

  private static async findGamesWithSameTitle(displayName: string) {
    const response = await fetchNoCors(
      "https://eu-central-1.aws.data.mongodb-api.com/app/data-vzkgtfx/endpoint/data/v1/action/aggregate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apiKey:
            "8lTTig5uhPYa5tpl1Buusi9ADSq2i37Xd4xNdt5C2t9cPPyV5a4DQWKsqqSaNVSs",
        },
        body: JSON.stringify({
          collection: "games",
          database: "games_info",
          dataSource: "Cluster0",
          pipeline: [
            {
              $search: {
                text: {
                  path: "titles",
                  query: displayName,
                },
              },
            },
            {
              $limit: 5,
            },
          ],
        }),
      },
    );

    if (isNil(response)) {
      // eslint-disable-next-line
      throw new Error('Null response from "DataBase" API');
    }

    if (!response.ok) {
      throw new Error(
        `[MetadataData][fetchMetadata] Error response on fetching information about: "${displayName}"`,
      );
    }

    const result = await response.json();

    return result.documents;
  }

  private static identifyPlatformByLaunchCommand(
    launchCommand: string,
  ): Nullable<Platforms> {
    logger.debug(
      "[MetadataData][identifyPlatformByLaunchCommand] launchCommand: ",
      launchCommand,
    );

    if (launchCommand.includes("pcsx")) {
      return "PS2";
    }

    if (launchCommand.includes("roms/nds")) {
      return "NintendoDS";
    }

    if (launchCommand.includes("roms/psp")) {
      return "PSP";
    }

    if (launchCommand.includes("roms/gc")) {
      return "GameCube";
    }

    if (launchCommand.includes("roms/snes")) {
      return "SNES";
    }

    logger.error(
      "[MetadataData][identifyPlatformByLaunchCommand] Unsupported platform. Launch command: ",
      launchCommand,
    );

    return undefined;
  }

  private static async indetifyExactGame(
    displayName: string,
    applicationId: number,
    gamesWithSameTitle: Array<GameMetadataRaw>,
  ) {
    if (displayName.length === 0) {
      // eslint-disable-next-line
      throw new Error('[identifyExactGame] Empty "displayName" value');
    }

    const appDetails = await getAppDetails(applicationId);

    if (isNil(appDetails)) {
      throw new Error(
        `[identifyExactGame] Impossible to get appDetails for "${displayName}"`,
      );
    }

    const launchCommand = `${appDetails.strShortcutExe} ${appDetails.strShortcutLaunchOptions}`;

    if (launchCommand.includes(".exe")) {
      // eslint-disable-next-line
      throw new Error('Unsupported file type: "exe"');
    }

    const platform =
      GamesMetadata.identifyPlatformByLaunchCommand(launchCommand);

    let gameTitles: Array<string> = [];

    for (const item of gamesWithSameTitle) {
      gameTitles = [...gameTitles, ...item.titles];
    }

    const closestItem = closest(displayName, gameTitles);
    const gameMetadata = gamesWithSameTitle.find(
      (item) => item.titles.includes(closestItem) && item.platform === platform,
    );

    if (isNil(gameMetadata)) {
      throw new Error(
        `[identifyExactGame] Null gameMetadata for "${displayName}".`,
      );
    }

    const categories = gameMetadata.category.split(", ") as Array<
      keyof typeof StoreCategory
    >;
    const categoriesIDs = categories
      .map((category) => StoreCategory[category])
      .filter((category) => !isNil(category));

    return {
      ...gameMetadata,
      category: categoriesIDs,
      launchCommand,
    };
  }

  private static async fetchAndSaveGameMetadata(applicationId: number) {
    try {
      const displayName =
        appStore.GetAppOverviewByAppID(applicationId)?.display_name;

      const gamesWithSameTitle =
        await GamesMetadata.findGamesWithSameTitle(displayName);

      const game = await GamesMetadata.indetifyExactGame(
        displayName,
        applicationId,
        gamesWithSameTitle,
      );
      const gameCompatibility =
        SteamDeckCompatibilityCategory[game.compatibility];

      appStore.GetAppOverviewByAppID(
        applicationId,
      ).steam_hw_compat_category_packed = isNil(gameCompatibility)
        ? SteamDeckCompatibilityCategory.UNKNOWN
        : gameCompatibility;

      GamesMetadata.gamesMetadata.set(applicationId, game);
    } catch (error) {
      logger.error("[MetadataData][fetchAndSaveGameMetadata] Error: ", error);
    }
  }

  public static getMetadataForApplication(applicationId: number) {
    return GamesMetadata.gamesMetadata.get(applicationId);
  }

  private static async initializeGamesMetadata(applicationsIds: Array<number>) {
    logger.debug(
      "[GamesMetadata][initializeGamesMetadata] Wait for estabilishing connect with API...",
    );

    await waitUntil(
      async () => {
        const response = await fetchNoCors(
          "https://eu-central-1.aws.data.mongodb-api.com/app/data-vzkgtfx/endpoint/data/v1/action/aggregate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              apiKey:
                "8lTTig5uhPYa5tpl1Buusi9ADSq2i37Xd4xNdt5C2t9cPPyV5a4DQWKsqqSaNVSs",
            },
            body: JSON.stringify({
              collection: "games",
              database: "games_info",
              dataSource: "Cluster0",
              pipeline: [
                {
                  $limit: 1,
                },
              ],
            }),
          },
        );

        return !isNil(response) && response.ok;
      },
      { timeout: 10000, intervalBetweenAttempts: 500 },
    );

    logger.debug(
      "[GamesMetadata][initializeGamesMetadata] Starting fetching games metadata...",
    );

    toaster.toast({
      title: "ChronoDeck",
      body: "Starting fetching metadata for emulated games...",
    });

    for (const applicationId of applicationsIds) {
      await GamesMetadata.fetchAndSaveGameMetadata(applicationId);
    }

    toaster.toast({
      title: "ChronoDeck",
      body: `Succesefull fetched metadata for ${GamesMetadata.gamesMetadata.size} games.`,
    });
  }

  public static getGameDevelopersAndPublishers(applicationId: number) {
    const gameMetadata = GamesMetadata.gamesMetadata.get(applicationId);

    if (isNil(gameMetadata)) {
      return;
    }

    const { developers, publishers } = gameMetadata;

    return {
      developers,
      publishers,
    };
  }

  public static getGameDescription(applicationId: number) {
    const gameMetadata = GamesMetadata.gamesMetadata.get(applicationId);

    if (isNil(gameMetadata)) {
      return;
    }

    const { full_description, short_description } = gameMetadata;

    return {
      fullDescription: full_description,
      shortDescription: short_description,
    };
  }

  public static getGameCategories(applicationId: number) {
    const gameMetadata = GamesMetadata.gamesMetadata.get(applicationId);

    if (isNil(gameMetadata)) {
      return;
    }

    return gameMetadata.category;
  }

  public static getGameReleaseDate(applicationId: number) {
    const gameMetadata = GamesMetadata.gamesMetadata.get(applicationId);

    if (isNil(gameMetadata)) {
      return;
    }

    const { europe_release_date } = gameMetadata;

    if (europe_release_date) {
      const date = new Date(europe_release_date);

      return dateToUnixTimestamp(date);
    }

    const { north_america_release_date } = gameMetadata;

    if (north_america_release_date) {
      const date = new Date(north_america_release_date);

      return dateToUnixTimestamp(date);
    }

    const { asia_release_date } = gameMetadata;

    if (asia_release_date) {
      const date = new Date(asia_release_date);

      return dateToUnixTimestamp(date);
    }

    return;
  }

  public static getGameCompatibility(applicationId: number) {
    const gameMetadata = GamesMetadata.gamesMetadata.get(applicationId);

    if (isNil(gameMetadata)) {
      return SteamDeckCompatibilityCategory.UNKNOWN;
    }

    const { compatibility } = gameMetadata;

    return SteamDeckCompatibilityCategory[compatibility];
  }

  public static updateGameCompatibilityStatusIfNeeded(applicationId: number) {
    if (applicationId === 0) {
      return;
    }

    const applicationOverview = appStore.GetAppOverviewByAppID(applicationId);

    if (isNil(applicationOverview)) {
      return;
    }

    const { display_name: displayName, app_type: appType } =
      applicationOverview;

    if (appType !== APP_TYPE.THIRD_PARTY) {
      return;
    }

    if (!GamesMetadata.gamesMetadata.has(applicationId)) {
      logger.error(
        `Impossible to update game compatibility for "${displayName}" (ApplicationID: ${applicationId}), because where is no any metadata.`,
      );

      return;
    }

    const gameCompatibility = GamesMetadata.getGameCompatibility(applicationId);
    const { steam_hw_compat_category_packed } = applicationOverview;

    if (steam_hw_compat_category_packed === gameCompatibility) {
      logger.debug(
        `"${displayName}" (ApplicationID: ${applicationId}) already has "${SteamDeckCompatibilityCategory[gameCompatibility]}" compatibility.`,
      );

      return;
    }

    logger.debug(
      `Update "steam_hw_compat_category_packed" for "${displayName}" (ApplicationID: ${applicationId}). Current: "${SteamDeckCompatibilityCategory[steam_hw_compat_category_packed]}" | Wanted: "${SteamDeckCompatibilityCategory[gameCompatibility]}"`,
    );

    appStore.GetAppOverviewByAppID(
      applicationId,
    ).steam_hw_compat_category_packed = gameCompatibility;
  }

  public static updateAllGamesCompatibilitiesStatusIfNeeded() {
    for (const applicationId of [...GamesMetadata.gamesMetadata.keys()]) {
      GamesMetadata.updateGameCompatibilityStatusIfNeeded(applicationId);
    }
  }

  public static async initialize() {
    const allNonSteamAppIds = GamesMetadata.getAllNonSteamAppIds();

    GamesMetadata.initializeGamesMetadata(allNonSteamAppIds).catch((error) => {
      logger.error("Initialization failed. Error: ", error);

      toaster.toast({
        title: "ChronoDeck",
        body: `${error}`,
        duration: 15000,
      });
    });
  }
}
