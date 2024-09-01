import type { ObservableSet } from "mobx";

// NOTE: Types from
//       https://github.com/EmuDeck/MetaDeck/blob/main/src/ts/SteamTypes.d.ts

type AppStore = {
  m_mapApps: ObservableSet<number, SteamAppOverview>;
  UpdateAppOverview: unknown;
  GetAppOverviewByAppID: (id: number) => SteamAppOverview;
  GetAppOverviewByGameID: (id: string) => SteamAppOverview;
  CompareSortAs: unknown;
  allApps: SteamAppOverview[];
  storeTagCounts: unknown;
  GetTopStoreTags: unknown;
  OnLocalizationChanged: unknown;
  GetStoreTagLocalization: unknown;
  GetLocalizationForStoreTag: unknown;
  AsyncGetLocalizationForStoreTag: unknown;
  sharedLibraryAccountIds: unknown;
  siteLicenseApps: unknown;
  GetIconURLForApp: unknown;
  GetLandscapeImageURLForApp: unknown;
  GetCachedLandscapeImageURLForApp: unknown;
  GetVerticalCapsuleURLForApp: unknown;
  GetPregeneratedVerticalCapsuleForApp: unknown;
  GetCachedVerticalCapsuleURL: unknown;
  GetCustomImageURLs: unknown;
  GetCustomVerticalCapsuleURLs: unknown;
  GetCustomLandcapeImageURLs: unknown;
  GetCustomHeroImageURLs: unknown;
  GetCustomLogoImageURLs: unknown;
  GetStorePageURLForApp: unknown;
};

type SteamGameClientData = {
  bytes_downloaded: string;
  bytes_total: string;
  client_name: string;
  clientid: string;
  cloud_status: number;
  display_status: number;
  is_available_on_current_platform: boolean;
  status_percentage: number;
};

type SteamAppOverview = {
  __proto__: SteamAppOverview;
  app_type: number;
  gameid: string;
  appid: number;
  display_name: string;
  // NOTE: Readonly
  steam_deck_compat_category: number;
  steam_hw_compat_category_packed: number;
  size_on_disk: string | undefined; // can use the type of this to determine if an app is installed!
  association: { type: number; name: string }[];
  canonicalAppType: number;
  controller_support: number;
  header_filename: string | undefined;
  icon_data: string | undefined;
  icon_data_format: string | undefined;
  icon_hash: string;
  library_capsule_filename: string | undefined;
  library_id: number | string | undefined;
  local_per_client_data: SteamGameClientData;
  m_gameid: number | string | undefined;
  m_setStoreCategories: Set<number>;
  m_setStoreTags: Set<number>;
  mastersub_appid: number | string | undefined;
  mastersub_includedwith_logo: string | undefined;
  metacritic_score: number;
  minutes_playtime_forever: number;
  minutes_playtime_last_two_weeks: number;
  most_available_clientid: string;
  most_available_per_client_data: SteamGameClientData;
  mru_index: number | undefined;
  optional_parent_app_id: number | string | undefined;
  owner_account_id: number | string | undefined;
  per_client_data: SteamGameClientData[];
  review_percentage_with_bombs: number;
  review_percentage_without_bombs: number;
  review_score_with_bombs: number;
  review_score_without_bombs: number;
  rt_custom_image_mtime: string | undefined;
  rt_last_time_locally_played: number | undefined;
  rt_last_time_played: number;
  rt_last_time_played_or_installed: number;
  rt_original_release_date: number;
  rt_purchased_time: number;
  rt_recent_activity_time: number;
  rt_steam_release_date: number;
  rt_store_asset_mtime: number;
  selected_clientid: string;
  selected_per_client_data: SteamGameClientData;
  shortcut_override_appid: undefined;
  site_license_site_name: string | undefined;
  sort_as: string;
  third_party_mod: number | string | undefined;
  visible_in_game_list: boolean;
  vr_only: boolean | undefined;
  vr_supported: boolean | undefined;
  BHasStoreTag: () => unknown;
  active_beta: number | string | undefined;
  display_status: number;
  installed: boolean;
  is_available_on_current_platform: boolean;
  is_invalid_os_type: boolean | undefined;
  review_percentage: number;
  review_score: number;
  status_percentage: number;
  store_category: number[];
  store_tag: number[];
};

type AppDetailsStore = {
  __proto__: AppDetailsStore;
  GetAppDetails(id: number): AppDetails;
  RegisterForAppData(
    app_id: unknown,
    callback: (data: AppDetails) => void,
  ): Hook;
  GetAchievements(app_id: number): SteamAppAchievement;
  GetAppData(app_id: number): AppData;
};

type SteamCollection = {
  __proto__: SteamCollection;
  AsDeletableCollection: () => null;
  AsDragDropCollection: () => null;
  AsEditableCollection: () => null;
  GetAppCountWithToolsFilter: (t: unknown) => unknown;
  allApps: SteamAppOverview[];
  apps: Map<number, SteamAppOverview>;
  bAllowsDragAndDrop: boolean;
  bIsDeletable: boolean;
  bIsDynamic: boolean;
  bIsEditable: boolean;
  displayName: string;
  id: string;
  visibleApps: SteamAppOverview[];
};

type CollectionStore = {
  userCollections: SteamCollection[];
  GetUserCollectionsByName: (name: string) => SteamCollection[];
  allAppsCollection: SteamCollection;
  deckDesktopApps: SteamCollection;
};

interface CustomAppDetails extends AppDetails {
  __proto__: AppDetails;
}

declare global {
  let appStore: AppStore;
  let appDetailsStore: CustomAppDetails;
  let appDetailsCache: {
    SetCachedDataForApp(
      app_id: number,
      descriptions: string,
      number: number,
      descriptionsData:
        | {
            strFullDescription: ReactNode;
            strSnippet: ReactNode;
          }
        | {
            rgDevelopers: {
              strName: string;
              strURL: string;
            }[];
            rgPublishers: {
              strName: string;
              strURL: string;
            }[];
            rgFranchises: {
              strName: string;
              strURL: string;
            }[];
          },
    ): void;
  };
  let collectionStore: CollectionStore;
}
