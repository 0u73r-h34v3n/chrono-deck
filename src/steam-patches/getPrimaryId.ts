import { type Patch, afterPatch } from "@decky/ui";
import { GamesMetadata } from "@src/gamesMetadata";

export const patchGetPrimaryAppId = {
  patch(): Patch {
    return afterPatch(
      appStore.allApps[0].__proto__,
      "GetPrimaryAppID",
      (_, applicationId: number) => {
        GamesMetadata.updateGameCompatibilityStatusIfNeeded(applicationId);
        GamesMetadata.updateLastTimePlayed(applicationId);
        GamesMetadata.updateDateAddedToLibrary(applicationId);
        GamesMetadata.updateGameSizeOnDiskIfNeeded(applicationId);

        return applicationId;
      },
    );
  },
};
