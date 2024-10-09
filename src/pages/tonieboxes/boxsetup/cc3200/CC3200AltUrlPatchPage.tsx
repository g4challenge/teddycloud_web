import { useTranslation } from "react-i18next";
import { Alert, Typography } from "antd";

import BreadcrumbWrapper, {
    HiddenDesktop,
    StyledContent,
    StyledLayout,
    StyledSider,
} from "../../../../components/StyledComponents";
import { TonieboxesSubNav } from "../../../../components/tonieboxes/TonieboxesSubNav";
import { Link } from "react-router-dom";

const { Paragraph } = Typography;

export const CC3200AltUrlPatchPage = () => {
    const { t } = useTranslation();

    return (
        <>
            <StyledSider>
                <TonieboxesSubNav />
            </StyledSider>
            <StyledLayout>
                <HiddenDesktop>
                    <TonieboxesSubNav />
                </HiddenDesktop>
                <BreadcrumbWrapper
                    items={[
                        { title: t("home.navigationTitle") },
                        { title: t("tonieboxes.navigationTitle") },
                        { title: t("tonieboxes.cc3200BoxFlashing.navigationTitle") },
                    ]}
                />
                <StyledContent>
                    <h1>{t(`tonieboxes.cc3200BoxFlashing.title`)}</h1>
                    <Alert
                        type="warning"
                        closeIcon
                        showIcon
                        message={t("tonieboxes.hintLatestFirmwareTitle")}
                        description={t("tonieboxes.hintLatestFirmware")}
                    ></Alert>
                    tbd
                </StyledContent>
            </StyledLayout>
        </>
    );
};