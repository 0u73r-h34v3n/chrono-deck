import { type Patch, Router, afterPatch } from "@decky/ui";
import { GamesMetadata } from "@src/gamesMetadata";
import { debounce } from "@utils/debounce";
import { isNil } from "@utils/isNil";
import type { MountManager } from "./system";

let shouldWeLieToSteam = true;
let isBlockedLieToSteamFromGetPerClientData = false;
let oldPathName: Nullable<string>;

function resetShouldSteamRunGameState() {
  shouldWeLieToSteam = true;
}

function removeBlockFromSteamLie() {
  isBlockedLieToSteamFromGetPerClientData = false;
}

const resetShouldSteamRunGameStateDebounce = debounce(
  resetShouldSteamRunGameState,
  300,
  false,
);

const removeBlockFromSteamLieDebounce = debounce(
  removeBlockFromSteamLie,
  500,
  false,
);

export function getMetaDeckMagicMethods(mountManager: MountManager) {
  // @ts-expect-error No existent types
  Router?.WindowStore?.GamepadUIMainWindowInstance?.m_history?.listen(
    (event: { pathname: string }) => {
      const { pathname } = event;

      shouldWeLieToSteam = true;
      const gamePage = "/library/app/";

      if (
        pathname.includes(gamePage) &&
        !isNil(oldPathName) &&
        !oldPathName.includes(gamePage)
      ) {
        isBlockedLieToSteamFromGetPerClientData = true;

        removeBlockFromSteamLieDebounce();
      }

      oldPathName = pathname;
    },
  );

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

          if (!isBlockedLieToSteamFromGetPerClientData) {
            shouldWeLieToSteam = false;
          }

          return response;
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
          resetShouldSteamRunGameStateDebounce();

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

          if (shouldWeLieToSteam) {
            return false;
          }

          return isModOrShortcut;
        },
      );
    },
  });
}
