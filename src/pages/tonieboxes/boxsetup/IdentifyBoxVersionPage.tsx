import { useTranslation } from "react-i18next";
import { Alert, Button, Col, Form, Input, Row, Typography } from "antd";

import BreadcrumbWrapper, {
    HiddenDesktop,
    StyledContent,
    StyledLayout,
    StyledSider,
} from "../../../components/StyledComponents";
import { TonieboxesSubNav } from "../../../components/tonieboxes/TonieboxesSubNav";
import { CodeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Paragraph } = Typography;

export const IdentifyBoxVersionPage = () => {
    const { t } = useTranslation();
    const [boxMac, setBoxMac] = useState<string>("");
    const [warningTextMac, setWarningTextMac] = useState<string>("");
    const [vendor, setVendor] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sanitizeMac = (input: string) => {
        return input.replace(/[^a-zA-Z0-9-:]/g, "").trim();
    };

    const checkMac = async () => {
        // Reset states
        setVendor(null);
        setError(null);

        try {
            const response = await fetch(`https://api.macvendors.com/${boxMac}`);

            if (!response.ok) {
                throw new Error("MAC address not found or invalid");
            }

            const data = await response.text();
            setVendor(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

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
                        { title: t("tonieboxes.boxSetup.identifyVersion.navigationTitle") },
                    ]}
                />
                <StyledContent>
                    <h1>{t(`tonieboxes.boxSetup.identifyVersion.title`)}</h1>

                    <Form>
                        <Paragraph>{t("tonieboxes.boxSetup.identifyVersion.identifyUsingMac")} </Paragraph>
                        <Form.Item>
                            <Row align="middle" style={{ display: "flex", alignItems: "center" }}>
                                <Col style={{ flex: "0 0 200px", color: warningTextMac ? "#CC3010" : "unset" }}>
                                    <label>{t("tonieboxes.boxSetup.identifyVersion.mac")}</label>
                                </Col>
                                <Col style={{ flex: "1 1 auto" }}>
                                    <Input
                                        type="text"
                                        value={boxMac}
                                        onChange={(e) => {
                                            let value = sanitizeMac(e.target.value);
                                            let warningText = "";
                                            if (value.length > 17) {
                                                warningText = t("tonieboxes.boxSetup.identifyVersion.boxMacTooLong");
                                            } else {
                                                warningText = "";
                                            }
                                            setBoxMac(value);
                                            setWarningTextMac(warningText);
                                        }}
                                    />
                                </Col>
                            </Row>
                            {warningTextMac && <p style={{ color: "#CC3010" }}>{warningTextMac}</p>}
                        </Form.Item>
                        <Button
                            icon={<CodeOutlined />}
                            disabled={boxMac.length > 17 || boxMac.length === 0}
                            type="primary"
                            onClick={checkMac}
                        >
                            {t("tonieboxes.boxSetup.identifyVersion.identify")}
                        </Button>
                    </Form>
                    {vendor ? (
                        <Alert
                            style={{ marginTop: 32 }}
                            type="success"
                            description={
                                <>
                                    {t("tonieboxes.boxSetup.identifyVersion.vendor")}: <b>{vendor}</b>{" "}
                                    {t("tonieboxes.boxSetup.identifyVersion.boxVersion")}
                                    {vendor.includes("Espressif") ? (
                                        <b> ESP32</b>
                                    ) : (
                                        <>
                                            <b> CC3200 </b> {t("tonieboxes.boxSetup.identifyVersion.or")}
                                            <b> CC3235</b>
                                        </>
                                    )}{" "}
                                    {t("tonieboxes.boxSetup.identifyVersion.version")}
                                </>
                            }
                        />
                    ) : error ? (
                        <Alert
                            style={{ marginTop: 32 }}
                            type="error"
                            description={<>{t("tonieboxes.boxSetup.identifyVersion.errorMac")}</>}
                        />
                    ) : (
                        ""
                    )}
                    <Paragraph style={{ fontSize: "small", marginTop: 16 }}>
                        {t("tonieboxes.boxSetup.identifyVersion.macvendors")}{" "}
                        <Link to="https://macvendors.com/">
                            {t("tonieboxes.boxSetup.identifyVersion.macvendorsLink")}
                        </Link>
                    </Paragraph>
                </StyledContent>
            </StyledLayout>
        </>
    );
};
