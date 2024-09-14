import logger from "@utils/logger";

export function identifyPlatformByLaunchCommand(
  launchCommand: string,
): Nullable<Platforms> {
  logger.debug(
    "[identifyPlatformByLaunchCommand] Search platform by launch command: ",
    launchCommand,
  );

  if (launchCommand.includes("roms/ps2")) {
    return "PS2";
  }

  if (launchCommand.includes("roms/nds")) {
    return "NintendoDS";
  }

  if (launchCommand.includes("roms/psp")) {
    return "PSP";
  }

  if (launchCommand.includes("roms/gc")) {
    return "GameCube";
  }

  if (launchCommand.includes("roms/snes")) {
    return "SNES";
  }

  return undefined;
}
