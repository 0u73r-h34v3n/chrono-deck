import { ButtonItem, PanelSection, PanelSectionRow } from "@decky/ui";
import { GamesMetadata } from "@src/gamesMetadata";
import { FaCloudDownloadAlt, FaSync } from "react-icons/fa";
import PanelSocialButton from "./SocialButtons";

import GitHubQrCode from "@src/assets/GitHubQrCode";
import GoogleFormQrCode from "@src/assets/GoogleFormQrCode";
import GoogleSheetQrCode from "@src/assets/GoogleSheetQrCode";
import { SiGithub, SiGoogleforms, SiGooglesheets } from "react-icons/si";

const refreshMetadata = GamesMetadata.initialize;
const forceSyncMedatadata = GamesMetadata.forceSync;

export default function QuickAcces() {
  return (
    <>
      <PanelSection title="">
        <PanelSectionRow>
          <ButtonItem
            onClick={refreshMetadata}
            layout="below"
            bottomSeparator="standard"
            description="Reapply the game metadata stored in the local saved file, or synchronize it with the latest updates from the database when the synchronization interval occurs"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaSync />

              <span style={{ marginLeft: "0.2rem" }}>Refresh</span>
            </div>
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem
            onClick={forceSyncMedatadata}
            layout="below"
            bottomSeparator="standard"
            description="Update game metadata to reflect the latest changes from the database"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaCloudDownloadAlt />

              <span style={{ marginLeft: "0.2rem" }}>Force Sync</span>
            </div>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Links">
        <PanelSocialButton
          icon={<SiGithub />}
          qrCode={<GitHubQrCode />}
          url="https://github.com/0u73r-h34v3n/chrono-deck"
          description="Read the Wiki for more information, or create an issue to request features or report bugs"
        >
          GitHub
        </PanelSocialButton>

        <PanelSocialButton
          icon={<SiGooglesheets fill="#34A853" />}
          qrCode={<GoogleSheetQrCode />}
          url="https://docs.google.com/spreadsheets/d/1lF2zJN4S7Ktu8xaLgyymWm9I8kMW7ts2rR6cVj3ZmEA"
          description="View the current list of supported games and platforms"
        >
          Google Sheets
        </PanelSocialButton>

        <PanelSocialButton
          icon={<SiGoogleforms fill="#673AB7" />}
          qrCode={<GoogleFormQrCode />}
          url="https://docs.google.com/forms/d/1Wp2sE3oI7JI1smGe_vHYUI_HMI_GLqiK9_X5En8rQdU"
          description="Help by contributing detailed information about games"
        >
          Google Form
        </PanelSocialButton>
      </PanelSection>

      <PanelSection title="NOTE">
        <span style={{ fontSize: "12px" }}>
          Additional platforms will be supported as the plugin becomes more
          robust.
        </span>
      </PanelSection>
    </>
  );
}
