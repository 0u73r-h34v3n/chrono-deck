import { type RoutePatch, routerHook } from "@decky/api";
import { afterPatch } from "@decky/ui";
import type { Mountable } from "@src/app/system";
import { APP_TYPE } from "@src/enums";
import { GamesMetadata } from "@src/gamesMetadata";
import type { AppDetailsStore, SteamAppOverview } from "@type/steamTypes";
import { runInAction } from "mobx";

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

export function patchAppPage(): Mountable {
  return routePatch("/library/app/:appid", (props) => {
    afterPatch(props.children.props, "renderFunc", (_, parameters) => {
      const overview: SteamAppOverview =
        parameters.props?.children?.props?.overview;

      if (overview.app_type === APP_TYPE.THIRD_PARTY) {
        const details: AppDetailsStore =
          parameters.props?.children?.props?.details;
        const applicationId: number = overview.appid;

        const applicationMetadata =
          GamesMetadata.getApplicationMetadata(applicationId);

        runInAction(() => {
          if (applicationMetadata?.compatibility_notes) {
            // TODO:
            // @ts-expect-error Add types later
            details.vecDeckCompatTestResults = [
              {
                test_loc_token: applicationMetadata.compatibility_notes,
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
