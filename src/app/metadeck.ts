import { type Patch, Router, afterPatch } from "@decky/ui";
import type { SteamAppOverview } from "../../types/steamTypes";
import { APP_TYPE } from "../enums";
import { GamesMetadata } from "../gamesMetadata";
import { debounce } from "../utils/debounce";
import { isNil } from "../utils/isNil";
import type { MountManager } from "./system";

let isInitializedInformationPage = false;

function setInitializationInformationPage() {
  isInitializedInformationPage = true;
}

const markAsDoneInitializedInformationPage = debounce(
  setInitializationInformationPage,
  100,
  false,
);

export function getMetaDeckMagicMethods(mountManager: MountManager) {
  // @ts-expect-error No existent types
  Router?.WindowStore?.GamepadUIMainWindowInstance?.m_history?.listen((e) => {
    const { pathname } = e;

    if (!pathname?.includes("/library/app/")) {
      return;
    }

    isInitializedInformationPage = false;
  });

  mountManager.addPatchMount({
    patch(): Patch {
      return afterPatch(
        appStore.allApps[0].__proto__,
        "GetPrimaryAppID",
        (_, applicationId: number) => {
          GamesMetadata.updateGameCompatibilityStatusIfNeeded(applicationId);

          return applicationId;
        },
      );
    },
  });

  mountManager.addPatchMount({
    patch(): Patch {
      return afterPatch(
        appStore.allApps[0].__proto__,
        "GetPerClientData",
        (clientDataState, response) => {
          if (isNil(clientDataState) || isNil(clientDataState[0])) {
            return response;
          }

          const firstState = clientDataState[0];

          if (firstState !== "selected") {
            return response;
          }

          return response;
        },
      );
    },
  });

  mountManager.addPatchMount({
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
  });

  mountManager.addPatchMount({
    patch(): Patch {
      return afterPatch(
        appStore?.allApps[0]?.__proto__,
        "BIsModOrShortcut",
        (_, isModOrShortcut) => {
          if (!isModOrShortcut) {
            return isModOrShortcut;
          }

          const pathname =
            // TODO:
            // @ts-expect-error Add types later
            Router?.WindowStore?.GamepadUIMainWindowInstance?.m_history
              ?.location?.pathname as Nullable<string>;

          if (isNil(pathname)) {
            return isModOrShortcut;
          }

          // NOTE: Route when user returns to main menu
          if (
            // NOTE: Main menu
            pathname === "/library/home" ||
            // NOTE: `Library -> Non-Steam`
            pathname === "/library/tab/DesktopApps" ||
            // NOTE: Appears only when user re-enter in `Librarry` with `Non-Steam` tab active
            pathname === "/library"
          ) {
            return false;
          }

          if (!pathname.includes("/library/app/")) {
            return isModOrShortcut;
          }

          const applicationIdFromPath = pathname.replace(/\D/g, "");
          const applicationId = Number.parseInt(applicationIdFromPath, 10);

          if (
            Number.isNaN(applicationId) ||
            !GamesMetadata.gamesMetadata.has(applicationId)
          ) {
            return isModOrShortcut;
          }

          if (!isInitializedInformationPage) {
            markAsDoneInitializedInformationPage();

            return false;
          }

          return isModOrShortcut;
        },
      );
    },
  });
}
