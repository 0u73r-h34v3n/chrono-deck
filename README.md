<h1 align="center">ChronoDeck Plugin for Decky Loader</h1>

<div align="center">

  [![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)](LICENSE)
  [![Supported Games](https://img.shields.io/badge/18,077_Supported_Games-blue?logo=googlesheets&logoColor=white)](https://docs.google.com/spreadsheets/d/1lF2zJN4S7Ktu8xaLgyymWm9I8kMW7ts2rR6cVj3ZmEA)
  ![Store Downloads](https://img.shields.io/badge/dynamic/json?url=https://testing.deckbrew.xyz/plugins?query=ChronoDeck&query=$[:1].downloads&suffix=%20installs&label=Testing%20store)


  <img src="./images/example.png" alt="Example UI" width="600"/>

</div>

## Overview

**ChronoDeck** brings metadata for **Emulated** games, enhancing the native experience on your Deck.

> [!NOTE]
> Internet connection is required to fetch game metadata.

## Getting Started

1. **Check Game Name:**
   Ensure the **Display Name** of your game matches the official one to retrieve accurate metadata.

2. **Verify Game in Database:**
   If a game is not detected correctly, make sure it exists in our [Google Sheets Database](https://docs.google.com/spreadsheets/d/1lF2zJN4S7Ktu8xaLgyymWm9I8kMW7ts2rR6cVj3ZmEA).

3. You can modify locally **Games Metadata** in file `/home/deck/homebrew/data/ChronoDeck/metadata.json`
4. Once per ~`24` hours are executed automatically sync with **DataBase**.
   
   If you want to control `Sync Interval` you can change value of  `syncIntervalDays` from `metadata.json` to **an integer value**.
   Default value: `1` (one day)

## Contribute

Want to help improve the plugin? Submit your feedback or contribute to the supported games list by filling out this [Google Form](https://docs.google.com/forms/d/1Wp2sE3oI7JI1smGe_vHYUI_HMI_GLqiK9_X5En8rQdU).

## Known issues
After press `Play` button, **Game Info** may disappear. This happens due to some internal conflicts between showing *game information* and run non-steam game. At the moment i didn't find perfect way to fix this.
**PR** is highly appreciated.

---

> [!TIP]
> The supported game count reflects basic metadata. The actual game status may differ depending on the version or other factors.

