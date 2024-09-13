import { toaster } from "@decky/api";
import type {
  GameMetadata,
  GameMetadataRaw,
  GamesMetadataOnlyReleaseDates,
} from "@type/gameMetadata";
import type { LocalSavedMetadata } from "@type/localMetadata";
import { dateToUnixTimestamp } from "@utils/date";
import { isNil } from "@utils/isNil";
import logger from "@utils/logger";
import getAppDetails from "@utils/steam/getAppDetails";
import waitUntil from "async-wait-until";
import { closest } from "fastest-levenshtein";
import { getMetadata, saveMetdata } from "./backEnd";
import {
  APP_TYPE,
  SteamDeckCompatibilityCategory,
  StoreCategory,
} from "./enums";
import { fetchGamesWithSameName, tryConnectToServices } from "./fetch";
import { getMinValidSyncInterval } from "./utils/number";
import { identifyPlatformByLaunchCommand } from "./utils/steam/identifyPlatformByLaunchCommand";

export class GamesMetadata {
  public static gamesMetadata = new Map<number, GameMetadata>();

  public static localSavedGamesMetadata: LocalSavedMetadata = {};

  private static getAllNonSteamAppIds() {
    return Array.from(collectionStore.deckDesktopApps.apps.keys());
  }

  private static getClosestMatchTitleFromGamesList(
    displayName: string,
    gamesWithSameTitle: Array<GameMetadataRaw>,
  ) {
    let gameTitles: Array<string> = [];

    for (const item of gamesWithSameTitle) {
      gameTitles = [...gameTitles, ...item.titles];
    }

    return closest(displayName, gameTitles);
  }

  private static getGameCategoriesFromString(categories: string) {
    const categoriesAsArray = categories.split(", ") as Array<
      keyof typeof StoreCategory
    >;

    const categoriesIDs = categoriesAsArray
      .map((category) => StoreCategory[category])
      .filter((category) => !isNil(category));

    return categoriesIDs;
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

    const platform = identifyPlatformByLaunchCommand(launchCommand);
    const closestMatchTitleFromGamesList =
      GamesMetadata.getClosestMatchTitleFromGamesList(
        displayName,
        gamesWithSameTitle,
      );

    const gameMetadata = gamesWithSameTitle.find(
      (item) =>
        item.titles.includes(closestMatchTitleFromGamesList) &&
        item.platform === platform,
    );

    if (isNil(gameMetadata)) {
      throw new Error(
        `[identifyExactGame] Null gameMetadata for "${displayName}".`,
      );
    }

    return {
      ...gameMetadata,
      category: GamesMetadata.getGameCategoriesFromString(
        gameMetadata.category,
      ),
      launchCommand,
    };
  }

  private static getLocallySavedGameMetadataIfPosible(applicationId: number) {
    const { gamesMetadata } = GamesMetadata.localSavedGamesMetadata;

    if (isNil(gamesMetadata)) {
      return;
    }

    return gamesMetadata[applicationId];
  }

  private static async fetchAndSaveGameMetadata(applicationId: number) {
    try {
      const appOverviewByAppId = appStore.GetAppOverviewByAppID(applicationId);

      if (isNil(appOverviewByAppId)) {
        throw new Error(
          `[GamesMetadata][fetchAndSaveGameMetadata] App overview for APP ID: ${applicationId} is undefined`,
        );
      }

      let game: GameMetadata;

      const metadataFromLocallSavedFile =
        GamesMetadata.getLocallySavedGameMetadataIfPosible(applicationId);

      if (!isNil(metadataFromLocallSavedFile)) {
        game = metadataFromLocallSavedFile;
      } else {
        const { display_name: displayName } = appOverviewByAppId;
        const gamesWithSameTitle = await fetchGamesWithSameName(displayName);

        game = await GamesMetadata.indetifyExactGame(
          displayName,
          applicationId,
          gamesWithSameTitle,
        );
      }

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

  private static async shouldGameMetadataToBeFetched(
    nonSteamApplicationsIds: Array<number>,
  ) {
    const metadata = await getMetadata();

    GamesMetadata.localSavedGamesMetadata = metadata;

    if (isNil(metadata)) {
      return true;
    }

    const { gamesMetadata } = metadata;

    if (isNil(gamesMetadata)) {
      return true;
    }

    const hasSameGameList = nonSteamApplicationsIds.every(
      (applicationId) => gamesMetadata[applicationId],
    );

    if (hasSameGameList) {
      return false;
    }

    const { lastSyncDate: lastSyncDateString } = metadata;

    if (isNil(lastSyncDateString)) {
      return true;
    }

    const { syncIntervalDays } = metadata;
    const lastSyncDate = new Date(lastSyncDateString);
    const syncInterval = getMinValidSyncInterval(syncIntervalDays);

    const dateToCompareWith = new Date(
      lastSyncDate.setDate(lastSyncDate.getDate() + syncInterval),
    );

    if (
      typeof lastSyncDateString === "string" &&
      dateToCompareWith > new Date()
    ) {
      return false;
    }

    return true;
  }

  private static async initializeGamesMetadata(
    nonSteamApplicationsIds: Array<number>,
  ) {
    logger.debug(
      "[GamesMetadata][initializeGamesMetadata] Wait for estabilishing connect with API...",
    );

    const shouldGameMetadataToBeFetched =
      await GamesMetadata.shouldGameMetadataToBeFetched(
        nonSteamApplicationsIds,
      );

    if (shouldGameMetadataToBeFetched) {
      await waitUntil(
        async () => {
          const response = await tryConnectToServices();

          return !isNil(response) && response.ok;
        },
        { timeout: 10000, intervalBetweenAttempts: 500 },
      );

      GamesMetadata.localSavedGamesMetadata.gamesMetadata = {};

      logger.debug(
        "[GamesMetadata][initializeGamesMetadata] Starting fetching games metadata...",
      );

      toaster.toast({
        title: "ChronoDeck",
        body: "Starting fetching metadata for emulated games...",
      });
    } else {
      logger.debug(
        "[GamesMetadata][initializeGamesMetadata] Starting loading games metadata from local file...",
      );

      toaster.toast({
        title: "ChronoDeck",
        body: "Starting loading games metadata from local file...",
      });
    }

    for (const applicationId of nonSteamApplicationsIds) {
      await GamesMetadata.fetchAndSaveGameMetadata(applicationId);
    }

    if (shouldGameMetadataToBeFetched) {
      saveMetdata(
        new Date(),
        GamesMetadata.gamesMetadata,
        GamesMetadata.localSavedGamesMetadata.syncIntervalDays,
      );
    }

    toaster.toast({
      title: "ChronoDeck",
      body: `Succesefull fetched metadata for ${GamesMetadata.gamesMetadata.size} games.`,
    });
  }

  public static getApplicationMetadata(applicationId: number) {
    return GamesMetadata.gamesMetadata.get(applicationId);
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

    const releaseDateKeys: Array<keyof GamesMetadataOnlyReleaseDates> = [
      "europe_release_date",
      "north_america_release_date",
      "asia_release_date",
    ];

    for (const key of releaseDateKeys) {
      const releaseDate =
        gameMetadata[key as keyof GamesMetadataOnlyReleaseDates];

      if (isNil(releaseDate)) {
        continue;
      }

      const date = new Date(releaseDate);

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

  public static async forceSync() {
    await saveMetdata(
      new Date("2000"),
      new Map(),
      GamesMetadata.localSavedGamesMetadata.syncIntervalDays,
    );

    await GamesMetadata.initialize();
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
