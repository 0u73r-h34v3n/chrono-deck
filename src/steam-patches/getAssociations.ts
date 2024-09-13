import { type Patch, callOriginal, replacePatch } from "@decky/ui";
import { APP_TYPE } from "@src/enums";
import { GamesMetadata } from "@src/gamesMetadata";
import { isNil } from "@src/utils/isNil";
import { stateTransaction } from "@src/utils/stateTransaction";

export const patchGetAssociations = {
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
};
