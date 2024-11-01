import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "antd/es/layout/layout";
import styled from "styled-components";

import { gitHubTCReleasesUrl } from "../../constants";

import { TeddyCloudApi } from "../../api";
import { defaultAPIConfig } from "../../config/defaultApiConfig";

import AudioPlayerFooter from "./AudioPlayerFooter";
import { HiddenDesktop, HiddenMobile } from "../StyledComponents";

const StyledFooterComponent = styled(Footer)`
    position: fixed;
    bottom: 0;
    z-index: 10;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 50px;
    color: white;
`;

const StyledCenterPart = styled.div`
    margin: auto;
    display: flex;
    align-items: center;
`;

const api = new TeddyCloudApi(defaultAPIConfig());

export const StyledFooter = () => {
    const [footerHeight, setFooterHeight] = useState(0);

    const [version, setVersion] = useState("");
    const [versionShort, setVersionShort] = useState("");
    const [gitShaShort, setGitShaShort] = useState("");

    const handleAudioPlayerVisibilityChange = () => {
        const footer = document.querySelector("footer");
        if (footer) {
            setFooterHeight(footer.offsetHeight);
        }
    };

    useEffect(() => {
        api.apiGetTeddyCloudSettingRaw("internal.version.v_long")
            .then((response) => response.text())
            .then((data) => setVersion(data))
            .catch((error) => console.error("Error fetching data:", error));
        api.apiGetTeddyCloudSettingRaw("internal.version.v_short")
            .then((response) => response.text())
            .then((data) => setVersionShort(data))
            .catch((error) => console.error("Error fetching data:", error));
        api.apiGetTeddyCloudSettingRaw("internal.version.git_sha_short")
            .then((response) => response.text())
            .then((data) => setGitShaShort(data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <>
            <div style={{ paddingBottom: footerHeight }} />

            <StyledFooterComponent>
                <StyledCenterPart>
                    <AudioPlayerFooter onVisibilityChange={handleAudioPlayerVisibilityChange} />
                </StyledCenterPart>
                <StyledCenterPart>
                    <div>
                        <small>
                            <Link to={gitHubTCReleasesUrl} target="_blank">
                                <HiddenDesktop>
                                    {versionShort} ({gitShaShort})
                                </HiddenDesktop>
                                <HiddenMobile>{version}</HiddenMobile>
                            </Link>
                        </small>
                    </div>
                </StyledCenterPart>
            </StyledFooterComponent>
        </>
    );
};
