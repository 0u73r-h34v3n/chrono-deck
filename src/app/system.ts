import logger from "@utils/logger";
// NOTE: https://github.com/EmuDeck/MetaDeck/blob/main/src/ts/System.ts
//       Some parts of code are from `MetaDeck` repository
import type { ComponentType } from "react";

export { type Clock, EventBus, MountManager, systemClock, type Mountable };

import { routerHook } from "@decky/api";
import type { Patch } from "@decky/ui";
import { waitForServicesInitialized } from "@src/utils/steam/waitForServicesInitialized";
import { registerForLoginStateChange } from "@utils/steam/registerForLoginStateChange";
import type { Events } from "./events";

const systemClock = {
  getTimeMs() {
    return Date.now();
  },
} as Clock;

interface Clock {
  getTimeMs: () => number;
}

export interface PatchMountable {
  patch(): Patch;
}

interface Mountable {
  mount: () => void;
  unMount: () => void;
}

export interface AsyncMountable {
  mount(): Promise<void>;
  unMount(): Promise<void>;
}

export interface AsyncPatchMountable {
  patch(): Promise<Patch>;
}

class MountManager {
  private mounts: Array<Mountable> = [];
  private eventBus: EventBus;
  private clock: Clock;

  constructor(eventBus: EventBus, clock: Clock) {
    this.eventBus = eventBus;
    this.clock = clock;
  }

  addMount(mount: Mountable) {
    this.mounts.push(mount);
  }

  addPatchMount(mount: PatchMountable | AsyncPatchMountable): void {
    let patch: Patch;

    this.addMount({
      async mount() {
        patch = await mount.patch();

        return patch;
      },

      async unMount() {
        patch?.unpatch();
      },
    });
  }

  addPageMount(
    path: string,
    component: ComponentType,
    props?: Omit<unknown, "path" | "children">,
  ): void {
    this.addMount({
      mount(): void {
        routerHook.addRoute(path, component, props);
      },
      unMount(): void {
        routerHook.removeRoute(path);
      },
    });
  }

  mount() {
    for (const mount of this.mounts) {
      mount.mount();
    }

    this.eventBus.emit({
      type: "Mount",
      createdAt: this.clock.getTimeMs(),
      mounts: this.mounts,
    });
  }

  unMount() {
    for (const mount of this.mounts) {
      mount.unMount();
    }

    this.eventBus.emit({
      type: "Unmount",
      createdAt: this.clock.getTimeMs(),
      mounts: this.mounts,
    });
  }

  register(): () => void {
    return registerForLoginStateChange(
      (username) => {
        (async () => {
          if (await waitForServicesInitialized()) {
            logger.debug(`Initializing plugin for ${username}`);

            this.mount();
          }
        })().catch((err) =>
          logger.error("Error while initializing plugin", err),
        );
      },
      () => {
        (async () => {
          logger.debug("Deinitializing plugin");

          this.unMount();
        })().catch((err) =>
          logger.error("Error while deinitializing plugin", err),
        );
      },
    );
  }
}

class EventBus {
  private subscribers: ((event: Events) => void)[] = [];

  public emit(event: Events) {
    logger.info("New event", event);

    for (const it of this.subscribers) {
      it(event);
    }
  }

  public addSubscriber(subscriber: (event: Events) => void) {
    this.subscribers.push(subscriber);
  }
}
