import { type Patch, callOriginal, replacePatch } from "@decky/ui";
import { APP_TYPE } from "@src/enums";
import { GamesMetadata } from "@src/gamesMetadata";
import { isNil } from "@src/utils/isNil";
import type { SteamAppOverview } from "@type/steamTypes";

export const patchBHasStoreCategory = {
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
};
