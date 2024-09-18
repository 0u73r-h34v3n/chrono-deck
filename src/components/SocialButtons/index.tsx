// NOTE: https://github.com/SteamGridDB/decky-steamgriddb/blob/main/src/components/qam-contents/PanelSocialButton.tsx#L81
import {
  DialogButton,
  Field,
  Focusable,
  ModalRoot,
  Navigation,
  PanelSectionRow,
  showModal,
} from "@decky/ui";
import type { FC, ReactNode } from "react";
import { HiQrCode } from "react-icons/hi2";

const navLink = (url: string) => {
  Navigation.CloseSideMenus();
  Navigation.NavigateToExternalWeb(url);
};

const showQrModal = ({ url, qrCode }: { url: string; qrCode: ReactNode }) => {
  showModal(
    <ModalRoot>
      <span style={{ textAlign: "center", wordBreak: "break-word" }}>
        <div style={{ width: "256px", margin: "0 auto" }}>{qrCode}</div>

        {url}
      </span>
    </ModalRoot>,
    window,
  );
};

const PanelSocialButton: FC<{
  icon: ReactNode;
  qrCode: ReactNode;
  url: string;
  children: string;
  description?: string;
}> = ({ icon, children, url, qrCode, description }) => (
  <PanelSectionRow>
    <Field
      bottomSeparator="none"
      icon={null}
      label={null}
      childrenLayout={undefined}
      inlineWrap="keep-inline"
      padding="none"
      spacingBetweenLabelAndChild="none"
      childrenContainerWidth="max"
      description={description}
    >
      <Focusable style={{ display: "flex" }}>
        <div
          style={{
            display: "flex",
            fontSize: "1.5em",
            justifyContent: "center",
            alignItems: "center",
            marginRight: ".5em",
          }}
        >
          {icon}
        </div>

        <DialogButton
          onClick={() => navLink(url)}
          onSecondaryButton={() => showQrModal({ url, qrCode })}
          onSecondaryActionDescription="Show Link QR"
          style={{
            padding: "10px",
            fontSize: "14px",
          }}
        >
          {children}
        </DialogButton>

        <DialogButton
          onOKActionDescription={"Show Link QR"}
          onClick={() => showQrModal({ url, qrCode })}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px",
            maxWidth: "40px",
            minWidth: "auto",
            marginLeft: ".5em",
          }}
        >
          <HiQrCode />
        </DialogButton>
      </Focusable>
    </Field>
  </PanelSectionRow>
);

export default PanelSocialButton;
