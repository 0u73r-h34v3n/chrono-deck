import decky  # type: ignore
import json
import os

metadata_file_name = "metadata.json"


class Plugin:
    async def get_file_size(self, route: str):
        return os.path.getsize(route)

    async def get_file_creation_time(self, route: str):
        return os.path.getctime(route)

    async def save_metadata(self, data):
        with open(
            os.path.join(decky.DECKY_PLUGIN_RUNTIME_DIR, metadata_file_name),
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(data, file, ensure_ascii=False, indent=2)

    async def get_metadata(self):
        with open(
            os.path.join(decky.DECKY_PLUGIN_RUNTIME_DIR, metadata_file_name), "r"
        ) as file:
            return json.load(file)

    async def _create_metadata_file_if_needed(self):
        if not os.path.exists(
            os.path.join(decky.DECKY_PLUGIN_RUNTIME_DIR, metadata_file_name)
        ):
            with open(
                os.path.join(decky.DECKY_PLUGIN_RUNTIME_DIR, metadata_file_name), "w"
            ) as file:
                json.dump(
                    {
                        "syncIntervalDays": 1,
                        "lastSyncDate": None,
                        "gamesMetadata": [],
                    },
                    file,
                    ensure_ascii=False,
                    indent=2,
                )

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky.logger.info("Hello, World!")

        await self._create_metadata_file_if_needed()

    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.info("Goodnight, World!")

        pass

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.info("Goodbye, World!")

        pass
