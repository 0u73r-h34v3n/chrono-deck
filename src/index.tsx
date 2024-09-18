import { definePlugin, staticClasses } from "@decky/ui";
import { FaSketch } from "react-icons/fa6";

import logger from "@utils/logger";
import { getMetaDeckMagicMethods } from "./app/metadeck";
import { EventBus, MountManager, systemClock } from "./app/system";
import QuickAccessPanel from "./components/QuickAccessPanel";
import { GamesMetadata } from "./gamesMetadata";
import { patchAppPage } from "./steam-patches/appPage";
import { patchBHasStoreCategory } from "./steam-patches/bHasStoreCategory";
import { patchGetAssociations } from "./steam-patches/getAssociations";
import { patchGetCanonicalReleaseDate } from "./steam-patches/getCanonicalReleaseDate";
import { patchGetDescriptions } from "./steam-patches/getDescriptions";
import { patchGetPrimaryAppId } from "./steam-patches/getPrimaryId";

export default definePlugin(() => {
  logger.debug("Initializing...");

  const eventBus = new EventBus();
  const clock = systemClock;
  const mountManager = new MountManager(eventBus, clock);

  mountManager.addMount(patchAppPage());

  mountManager.addPatchMount(patchBHasStoreCategory);
  mountManager.addPatchMount(patchGetAssociations);
  mountManager.addPatchMount(patchGetCanonicalReleaseDate);
  mountManager.addPatchMount(patchGetDescriptions.afterPatch);
  mountManager.addPatchMount(patchGetDescriptions.replacePatch);
  mountManager.addPatchMount(patchGetPrimaryAppId);

  getMetaDeckMagicMethods(mountManager);

  mountManager.addMount({
    mount: () => {
      GamesMetadata.initialize();
    },
    unMount: () => {},
  });

  const unregister = mountManager.register();

  return {
    title: <div className={staticClasses.Title}>ChronoDeck</div>,
    content: <QuickAccessPanel />,
    icon: <FaSketch />,
    onDismount() {
      unregister();
    },
  };
});
