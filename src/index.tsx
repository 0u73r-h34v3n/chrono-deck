import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  type Patch,
  afterPatch,
  callOriginal,
  definePlugin,
  replacePatch,
  staticClasses,
} from "@decky/ui";
import { FaSync } from "react-icons/fa";
import { FaSketch } from "react-icons/fa6";

import type { SteamAppOverview } from "../types/steamTypes";
import { getMetaDeckMagicMethods } from "./app/metadeck";
import { EventBus, MountManager, systemClock } from "./app/system";
import { APP_TYPE } from "./enums";
import { GamesMetadata } from "./gamesMetadata";
import { patchAppPage } from "./steam-ui/patches";
import { isNil } from "./utils/isNil";
import logger from "./utils/logger";
import { stateTransaction } from "./utils/stateTransaction";

const refreshMetadata = GamesMetadata.initialize;

export default definePlugin(() => {
  logger.debug("Initializing...");

  const eventBus = new EventBus();
  const clock = systemClock;
  const mountManager = new MountManager(eventBus, clock);

  mountManager.addMount(patchAppPage());

  mountManager.addPatchMount({
    patch(): Patch {
      return replacePatch(
        appDetailsStore.__proto__,
        "GetDescriptions",
        (args) => {
          const overview = appStore.GetAppOverviewByAppID(args[0]);

          if (overview.app_type === APP_TYPE.THIRD_PARTY) {
            // TODO:
            // @ts-expect-error Add types later
            const appData = appDetailsStore.GetAppData(args[0]);

            if (appData) {
              const gameDescription = GamesMetadata.getGameDescription(
                appData.details.unAppID,
              );

              stateTransaction(() => {
                if (isNil(gameDescription)) {
                  return;
                }

                appData.descriptionsData = {
                  strFullDescription: `${gameDescription?.fullDescription}`,
                  strSnippet: `${gameDescription?.shortDescription}`,
                };

                appDetailsCache.SetCachedDataForApp(
                  args[0],
                  "descriptions",
                  1,
                  appData.descriptionsData,
                );
              });

              return appData.descriptionsData;
            }
          }

          return callOriginal;
        },
      );
    },
  });

  mountManager.addPatchMount({
    patch(): Patch {
      return afterPatch(
        appDetailsStore.__proto__,
        "GetDescriptions",
        (args, ret) => {
          const overview = appStore.GetAppOverviewByAppID(args[0]);

          if (overview.app_type === APP_TYPE.THIRD_PARTY) {
            return {
              strFullDescription: `${ret?.strFullDescription}`,
              strSnippet: `${ret?.strSnippet}`,
            };
          }

          return ret;
        },
      );
    },
  });

  mountManager.addPatchMount({
    patch(): Patch {
      return replacePatch(
        appStore?.allApps[0]?.__proto__,
        "BHasStoreCategory",
        function (this: SteamAppOverview, args) {
          if (this.app_type === APP_TYPE.THIRD_PARTY) {
            const categories = GamesMetadata.getGameCategories(this.appid);

            if (isNil(categories)) {
              return false;
            }

            if (categories.includes(args[0])) {
              return true;
            }
          }

          return callOriginal;
        },
      );
    },
  });

  mountManager.addPatchMount({
    patch(): Patch {
      return replacePatch(
        appDetailsStore.__proto__,
        "GetAssociations",
        (args) => {
          if (
            appStore.GetAppOverviewByAppID(args[0]).app_type ===
            APP_TYPE.THIRD_PARTY
          ) {
            // TODO:
            // @ts-expect-error Add types later
            const appData = appDetailsStore.GetAppData(args[0]);

            if (!appData) {
              return callOriginal;
            }

            const gameDevelopersAndPublishers =
              GamesMetadata.getGameDevelopersAndPublishers(
                appData.details.unAppID,
              );

            if (isNil(gameDevelopersAndPublishers)) {
              return callOriginal;
            }

            const { developers, publishers } = gameDevelopersAndPublishers;

            const getMappedArray = (
              array: Nullable<typeof developers | typeof publishers>,
            ) => {
              if (isNil(array)) {
                return [];
              }

              return array.map((value) => ({ strName: value, strURL: "" }));
            };

            stateTransaction(() => {
              appData.associationData = {
                rgDevelopers: getMappedArray(developers),
                rgPublishers: getMappedArray(publishers),
                rgFranchises: [],
              };

              appDetailsCache.SetCachedDataForApp(
                args[0],
                "associations",
                1,
                appData.associationData,
              );
            });
          }

          return callOriginal;
        },
      );
    },
  });

  getMetaDeckMagicMethods(mountManager);

  mountManager.addMount({
    mount: () => {
      GamesMetadata.initialize();
    },
    unMount: () => {},
  });

  const unregister = mountManager.register();

  return {
    title: <div className={staticClasses.Title}>Example Plugin</div>,
    content: (
      <PanelSection>
        <PanelSectionRow>
          <ButtonItem
            onClick={refreshMetadata}
            layout="below"
            bottomSeparator="none"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaSync />

              <span style={{ marginLeft: "0.2rem" }}>Refresh</span>
            </div>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    ),
    icon: <FaSketch />,
    onDismount() {
      unregister();
    },
  };
});
