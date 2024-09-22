import { type Patch, afterPatch, callOriginal, replacePatch } from "@decky/ui";
import { APP_TYPE } from "@src/enums";
import { GamesMetadata } from "@src/gamesMetadata";
import { isNil } from "@src/utils/isNil";
import { stateTransaction } from "@src/utils/stateTransaction";

export const patchGetDescriptions = {
  replacePatch: {
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

              if (isNil(gameDescription)) {
                return;
              }

              stateTransaction(() => {
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
  },

  afterPatch: {
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
  },
};
