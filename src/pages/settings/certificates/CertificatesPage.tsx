import { Breadcrumb } from "antd";
import { useTranslation } from "react-i18next";
import {
  HiddenDesktop,
  StyledBreadcrumb,
  StyledContent,
  StyledLayout,
  StyledSider,
} from "../../../components/StyledComponents";
import { SettingsSubNav } from "../../../components/settings/SettingsSubNav";

export const CertificatesPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <StyledSider>
        <SettingsSubNav />
      </StyledSider>
      <StyledLayout>
        <HiddenDesktop>
          <SettingsSubNav />
        </HiddenDesktop>
        <StyledBreadcrumb>
          <Breadcrumb.Item>{t("home.navigationTitle")}</Breadcrumb.Item>
          <Breadcrumb.Item>{t("settings.navigationTitle")}</Breadcrumb.Item>
          <Breadcrumb.Item>
            {t("settings.certificates.navigationTitle")}
          </Breadcrumb.Item>
        </StyledBreadcrumb>
        <StyledContent>
          <h1>{t(`settings.certificates.title`)}</h1>
        </StyledContent>
      </StyledLayout>
    </>
  );
};
