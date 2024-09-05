import { type RoutePatch, routerHook } from "@decky/api";
import { afterPatch } from "@decky/ui";
import { runInAction } from "mobx";
import type { AppDetailsStore, SteamAppOverview } from "../../types/steamTypes";
import type { Mountable } from "../app/system";
import {
  APP_TYPE,
  type SteamDeckCompatibilityCategory,
  type StoreCategory,
} from "../enums";
import { GamesMetadata } from "../gamesMetadata";

function routePatch(path: string, patch: RoutePatch): Mountable {
  return {
    mount() {
      routerHook.addPatch(path, patch);
    },
    unMount() {
      routerHook.removePatch(path, patch);
    },
  };
}

export interface Developer {
  name: string;
  url: string;
}

export interface Publisher {
  name: string;
  url: string;
}

export interface MetadataData {
  title: string;
  id: number;
  description: string;
  developers?: Developer[];
  publishers?: Publisher[];
  release_date?: number;
  compat_category: SteamDeckCompatibilityCategory;
  compat_notes?: string;
  store_categories: StoreCategory[];
}

export function patchAppPage(): Mountable {
  return routePatch("/library/app/:appid", (props) => {
    afterPatch(props.children.props, "renderFunc", (_, parameters) => {
      const overview: SteamAppOverview =
        parameters.props?.children?.props?.overview;

      if (overview.app_type === APP_TYPE.THIRD_PARTY) {
        const details: AppDetailsStore =
          parameters.props?.children?.props?.details;
        const applicationId: number = overview.appid;

        const metadata = GamesMetadata.getMetadataForApplication(applicationId);

        runInAction(() => {
          if (metadata?.compatibility_notes) {
            // TODO:
            // @ts-expect-error Add types later
            details.vecDeckCompatTestResults = [
              {
                test_loc_token: metadata.compatibility_notes,
                test_result: 1,
              },
            ];
          }
        });
      }

      return parameters;
    });

    return props;
  });
}
