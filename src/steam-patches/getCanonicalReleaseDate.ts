import { type Patch, afterPatch } from "@decky/ui";
import { APP_TYPE } from "@src/enums";
import { GamesMetadata } from "@src/gamesMetadata";
import { isNil } from "@src/utils/isNil";
import type { SteamAppOverview } from "@type/steamTypes";

export const patchGetCanonicalReleaseDate = {
  patch(): Patch {
    return afterPatch(
      appStore.allApps[0].__proto__,
      "GetCanonicalReleaseDate",
      function (this: SteamAppOverview, _, ret) {
        if (this.app_type === APP_TYPE.THIRD_PARTY) {
          const releaseDate = GamesMetadata.getGameReleaseDate(this.appid);

          if (!isNil(releaseDate)) {
            return releaseDate;
          }
        }

        return ret;
      },
    );
  },
};
