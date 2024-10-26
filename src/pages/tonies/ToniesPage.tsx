import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BreadcrumbWrapper, {
    HiddenDesktop,
    StyledContent,
    StyledLayout,
    StyledSider,
} from "../../components/StyledComponents";
import { TonieCardProps } from "../../components/tonies/TonieCard"; // Import the TonieCard component and its props type
import { defaultAPIConfig } from "../../config/defaultApiConfig";
import { TeddyCloudApi } from "../../api";
import { ToniesList } from "../../components/tonies/ToniesList";

import { ToniesSubNav } from "../../components/tonies/ToniesSubNav";
import { message, Select, Tooltip } from "antd";
import { useLocation } from "react-router-dom";
import { useTonieboxContent } from "../../components/utils/OverlayContentDirectories";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const api = new TeddyCloudApi(defaultAPIConfig());
const { Option } = Select;

interface LanguageCounts {
    [key: string]: number;
}

export const ToniesPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const linkOverlay = searchParams.get("overlay");
    const { tonieBoxContentDirs, overlay, handleSelectChange } = useTonieboxContent(linkOverlay);

    const [tonies, setTonies] = useState<TonieCardProps[]>([]);
    const [defaultLanguage, setMaxTag] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const handleUpdate = (updatedTonieCard: TonieCardProps) => {
        setTonies((prevTonies) =>
            prevTonies.map((tonie) => (tonie.ruid === updatedTonieCard.ruid ? updatedTonieCard : tonie))
        );
    };

    useEffect(() => {
        const fetchTonies = async () => {
            setLoading(true);
            try {
                const tonieData = (await api.apiGetTagIndex(overlay ? overlay : "", true)).filter((item) => !item.hide);
                setTonies(
                    tonieData.sort((a, b) => {
                        if (a.tonieInfo.series < b.tonieInfo.series) {
                            return -1;
                        }
                        if (a.tonieInfo.series > b.tonieInfo.series) {
                            return 1;
                        }
                        if (a.tonieInfo.episode < b.tonieInfo.episode) {
                            return -1;
                        }
                        if (a.tonieInfo.episode > b.tonieInfo.episode) {
                            return 1;
                        }
                        return 0;
                    })
                );
            } catch (error) {
                message.error("Fetching Tonies failed: " + error);
                console.log("error: fetching tonies failed: " + error);
            } finally {
                setLoading(false);
            }
        };

        fetchTonies();
    }, [overlay]);

    // Update tagCounts state and find the language tag with the highest count when tags prop changes
    useEffect(() => {
        const counts: LanguageCounts = {};

        // Iterate over the tags array and count occurrences of each language tag
        tonies.forEach((tonies) => {
            const language = tonies.tonieInfo.language;
            // If the language tag already exists in the counts object, increment its count by 1
            if (counts[language]) {
                counts[language]++;
            } else {
                // If the language tag doesn't exist in the counts object, initialize its count to 1
                counts[language] = 1;
            }
        });

        // Find the language tag with the highest count
        let maxCount = 0;
        let maxLanguage = "";
        for (const language in counts) {
            if (counts.hasOwnProperty(language) && counts[language] > maxCount) {
                maxCount = counts[language];
                maxLanguage = language;
            }
        }
        // Update maxTag state with the language tag with the highest count
        setMaxTag(maxLanguage);
    }, [tonies]);

    return (
        <>
            <StyledSider>
                <ToniesSubNav />
            </StyledSider>
            <StyledLayout>
                <HiddenDesktop>
                    <ToniesSubNav />
                </HiddenDesktop>
                <BreadcrumbWrapper
                    items={[{ title: t("home.navigationTitle") }, { title: t("tonies.navigationTitle") }]}
                />
                <StyledContent>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignContent: "center",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <h1 style={{ width: "200px" }}>{t("tonies.title")}</h1>

                        {tonieBoxContentDirs.length > 1 ? (
                            <Tooltip title={t("tonies.content.showToniesOfBoxes")}>
                                <Select
                                    id="contentDirectorySelect"
                                    defaultValue=""
                                    onChange={handleSelectChange}
                                    style={{ maxWidth: "300px" }}
                                    value={overlay}
                                >
                                    {tonieBoxContentDirs.map(([contentDir, boxNames, boxId]) => (
                                        <Option key={boxId} value={boxId}>
                                            {boxNames.join(", ")}
                                        </Option>
                                    ))}
                                </Select>
                            </Tooltip>
                        ) : (
                            ""
                        )}
                    </div>
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <ToniesList
                            showFilter={true}
                            showPagination={true}
                            tonieCards={tonies.filter((tonie) => tonie.type === "tag")}
                            overlay={overlay}
                            readOnly={false}
                            defaultLanguage={defaultLanguage}
                            onToniesCardUpdate={handleUpdate}
                        />
                    )}
                </StyledContent>
            </StyledLayout>
        </>
    );
};
