import logger from "@utils/logger";

export function identifyPlatformByLaunchCommand(
  launchCommand: string,
): Nullable<Platforms> {
  logger.debug(
    "[MetadataData][identifyPlatformByLaunchCommand] launchCommand: ",
    launchCommand,
  );

  if (launchCommand.includes("pcsx")) {
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

  logger.error(
    "[MetadataData][identifyPlatformByLaunchCommand] Unsupported platform. Launch command: ",
    launchCommand,
  );

  return undefined;
}
