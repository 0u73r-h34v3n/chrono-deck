// https://github.com/FrogTheFrog/moondeck/blob/main/src/steam-utils/registerForLoginStateChange.ts

import logger from "@utils/logger";

/**
 * Invokes appropriate callback when user logs in or out.
 *
 * @note
 * Either login or logout callback will be invoked based on the
 * current state once this function is called.
 */
export function registerForLoginStateChange(
  onLogin: (username: string) => void,
  onLogout: () => void,
): () => void {
  try {
    let isLoggedIn: boolean | null = null;

    return SteamClient.User.RegisterForLoginStateChange((username: string) => {
      if (username === "") {
        if (isLoggedIn !== false) {
          onLogout();
        }

        isLoggedIn = false;
      } else {
        if (isLoggedIn !== true) {
          onLogin(username);
        }

        isLoggedIn = true;
      }
    }).unregister;
  } catch (error) {
    logger.error(error);

    return () => {};
  }
}
