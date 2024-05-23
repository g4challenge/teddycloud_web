import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Typography, List } from "antd";

import {
    HiddenDesktop,
    StyledBreadcrumb,
    StyledContent,
    StyledLayout,
    StyledSider,
} from "../../components/StyledComponents";
import { CommunitySubNav } from "../../components/community/CommunitySubNav";

const { Paragraph, Text } = Typography;

export const ChangelogPage = () => {
    const { t } = useTranslation();

    const changelogData = [
        {
            version: "0.5.3",
            changes: [
                "Stabilization backend",
                "store last played time of last played tag",
                "extend getTagIndex API, provide language in tonieInfos",
                "PoC Toniebox api access (explicitly allow access to teddy cloud api on tonebox level)",
                "Added enable/disable new Tonieboxes: prohibit registration of new tonieboxes if not enabled",
                "Added removal of overlays (= removal of Tonieboxes from TeddyCloud)",
                "add hide tonie/tag functionality",
                "fixed bug not storing cloud auth in some circumstances",
                "fixed bug not storing source in json file: https://github.com/toniebox-reverse-engineering/teddycloud/issues/165",
                "new /web gui: enhanced Toniecard, added search for Radiostream in Edit Modal",
                "new /web gui: Tonies - Content section - added Migrate Content to Lib button on TAF files",
                "new /web gui: added RTNL Log Page",
                "new /web gui: added Json File Modal in Content section (double click on json file row)",
                "new /web gui: show date time of last played tag (toniecard + toniboxcard)",
                "new /web gui: added Tonie Audio Playlist page (WIP - Implementation not yet finished), rearranged menu entries tonies section",
                "new /web gui: added delete feature in content, library and audio playlist page",
                "new /web gui: improved changelog page, parse links and open links in new tab",
                "new /web gui: added language flag to tonies card if it's not the same as the most owned language ones, added language filter",
                "new /web gui: deletion of tonieboxes",
                "new /web gui: info if add new boxes is enabled on homepage and tonieboxes page",
                "new /web gui: enable/disable API access for toniebox added on tonieboxes page",
                "new /web gui: add hide tonie/tag in tonies list (in info modal)",
                "new /web gui: PoC (WiP, not working) Tonies Custom Json Editor"
            ],
            commits: [
                "https://github.com/toniebox-reverse-engineering/teddycloud/compare/tc_v0.5.2...tc_v0.5.3",
                "https://github.com/toniebox-reverse-engineering/teddycloud_web/compare/tcw_v0.5.2...tcw_v0.5.3",
            ],
            discussionLink: "https://forum.revvox.de/t/release-notes-0-5-3/468",
            githubReleaseLink: "https://github.com/toniebox-reverse-engineering/teddycloud/releases/tag/tc_v0.5.3",
        },
        {
            version: "0.5.2",
            changes: [
                "Stabilization backend",
                "Several fixes and changes regards backend crashes and emptied config files when changing any tonie setting",
                "Fix for random directories in library (and everywhere)",
                "Fixed bug storing last played tonie per box",
                "Fixed bug clearing text settings (like paths or flex tonie)",
                "API for searching models is now case insensitive",
                "Save IP of Toniebox as prepartion for linking CFW Tonieboxes",
                "Introduced Settings level - 1: Basic, 2: Detail, 3: Expert (1 Default - if you are missing settings, increase level!)",
                "new /web gui: enhanced Tonies Card, added editable content source",
                "new /web gui: enhanced Toniebox Card, improved UX",
                "new /web gui: Dark theme (Last used Theme stored in localStorage in Browser)",
                "new /web gui: Show All (Hide Pagination on Tonies List, stored in localStorage in Browser)",
                "new /web gui: Support of overlayed content folder. More details can be found here: https://forum.revvox.de/t/teddycloud-supporting-multiple-tonieboxes/451/1",
                "new /web gui: Text inputs in Settings must be saved explicitly. (only Textinputs, other types are still autosaved.) Expect changes in future releases.",
                "new /web gui: fixed various state bugs",
                "new /web gui: show last online date of offline tonieboxes",
                "new /web gui: Messages on successful setting updates",
                "new /web gui: some refactoring",
            ],
            commits: [
                "https://github.com/toniebox-reverse-engineering/teddycloud/compare/tc_v0.5.1...tc_v0.5.2",
                "https://github.com/toniebox-reverse-engineering/teddycloud_web/compare/tcw_v0.5.1...tcw_v0.5.2",
            ],
            discussionLink: "https://forum.revvox.de/t/release-notes-0-5-2/450",
            githubReleaseLink: "https://github.com/toniebox-reverse-engineering/teddycloud/releases/tag/tc_v0.5.2",
        },
        {
            version: "0.5.1",
            changes: [
                "Stabilization Backend (added locks to prevent crashes, removed memory leaks)",
                "Creating dirs when uploading certificates to a not yet existing path",
                "Moving Tafs from Content to Library on click (not yet available in (new?) frontend)",
                "new /web gui: Pagination + Filtering on Tonies List ( Paging Tonies · Issue #24 · toniebox-reverse-engineering/teddycloud_web · GitHub 2 )",
                "new /web gui: Extend Box Management: Certificate upload now box specific possible, overworked certificate upload ( Certificate upload box related · Issue #26 · toniebox-reverse-engineering/teddycloud_web · GitHub )",
                "new /web gui: Show last played Tonie on Box Management, link to prefiltered Tonieslist, added marking of the Last played Tonies on each box in Tonieslist ( Make use of internal.last_ruid · Issue #30 · toniebox-reverse-engineering/teddycloud_web · GitHub 1 )",
                "new /web gui: adapted cursor on cards to default as cards not really clickable ( TonieCard Cursor · Issue #25 · toniebox-reverse-engineering/teddycloud_web · GitHub )",
                "new /web gui: fixed navigation item marking",
                "new /web gui: updated box models, added pseudomodels of the official tonies covers (sleepy bear, sheep and rabbit). They are now placed in a json in the config folder. Custom tonieboxes are now also possible. Add your customised one in tonieboxes.custom.json and choose it in the box mgmt.",
                "new /web gui: added community section (WIP) ( Add Changelog and contribution page · Issue #27 · toniebox-reverse-engineering/teddycloud_web · GitHub 1 )",
                "new /web gui: fixed warnings",
            ],
            commits: [
                "https://github.com/toniebox-reverse-engineering/teddycloud/compare/tc_v0.5.0...tc_v0.5.1",
                "https://github.com/toniebox-reverse-engineering/teddycloud_web/compare/tcw_v0.5.0...tcw_v0.5.1",
            ],
            discussionLink: "https://forum.revvox.de/t/release-notes-0-5-1/447",
            githubReleaseLink: "https://github.com/toniebox-reverse-engineering/teddycloud/releases/tag/tc_v0.5.1",
        },
        {
            version: "0.5.0",
            changes: [
                "security mitigations on public instances as it‘s definitely not recommended to host teddycloud in public accessible for all",
                "prepared authentication for frontend (backend adaptions)",
                "linked new /web gui on teddycloud administration gui",
                "overworked header, reordered menu items, new icons, better readable status in new /web gui",
                "fixed modals (still some display problems on small devices like mobiles exists)",
                "added audio encoder to new /web gui, you are now able to select files and encode them to a taf",
                "This lets you bring your own content easily on an existing tonie.", // This line added
                "added toniebox management to new /web gui, improved backend functions for that",
                "only at least once connected boxes are listed, model must be set manually",
                "enriched homepage in new /web gui with 5 randomly selected tonies of yours",
                "adapt tonie card list to different cover image sizes in new /web gui (all cards within one row have now the same height)",
                "added no cloud and live icon (Toggle to enable/disable) on tonie card in new /web gui",
                "fixed several bugs",
            ],
            commits: [
                "https://github.com/toniebox-reverse-engineering/teddycloud/pull/154",
                "https://github.com/toniebox-reverse-engineering/teddycloud_web/pull/8",
                "https://github.com/toniebox-reverse-engineering/teddycloud_web/pull/9",
                "https://github.com/toniebox-reverse-engineering/teddycloud_web/pull/19",
                "https://github.com/toniebox-reverse-engineering/teddycloud_web/pull/21",
                "https://github.com/toniebox-reverse-engineering/teddycloud_web/pull/22",
            ],
            discussionLink: "https://forum.revvox.de/t/release-notes-0-5-0/444",
            githubReleaseLink: "https://github.com/toniebox-reverse-engineering/teddycloud/releases/tag/tc_v0.5.0",
        },
        {
            version: "0.4.5 and older",
            changes: ["A lot more. See Github for details!"],
            commits: [],
        },
    ];

    const renderChangeEntry = (entry: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = entry.split(urlRegex);

        return parts.map((part, index) =>
            urlRegex.test(part) ? (
                <Link key={index} to={part} target="_blank" rel="noopener noreferrer">
                    {part}
                </Link>
            ) : (
                part
            )
        );
    };

    return (
        <>
            <StyledSider>
                <CommunitySubNav />
            </StyledSider>
            <StyledLayout>
                <HiddenDesktop>
                    <CommunitySubNav />
                </HiddenDesktop>
                <StyledBreadcrumb
                    items={[
                        { title: t("home.navigationTitle") },
                        { title: t("community.navigationTitle") },
                        { title: t("community.changelog.navigationTitle") },
                    ]}
                />
                <StyledContent>
                    <h1>{t(`community.changelog.title`)}</h1>
                    <Paragraph>
                        <List
                            dataSource={changelogData}
                            renderItem={(item) => (
                                <>
                                    <h2>Version {item.version}</h2>
                                    <Paragraph>
                                        <h3>Changes</h3>
                                        <ul>
                                            {item.changes.map((change, index) => (
                                                <li key={index}>{renderChangeEntry(change)}</li>
                                            ))}
                                        </ul>
                                    </Paragraph>
                                    {item.commits && item.commits.length > 0 && (
                                        <>
                                            <Text strong>
                                                All contained commits can be found here (teddy cloud repo):
                                            </Text>
                                            <ul>
                                                {item.commits.map((commit, index) => (
                                                    <li key={index}>
                                                        <Link to={commit} target="_blank">
                                                            {commit}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    {item.discussionLink && (
                                        <>
                                            <Text strong>Discussion:</Text>
                                            <ul>
                                                <li>
                                                    <Link to={item.discussionLink} target="_blank">
                                                        {item.discussionLink}
                                                    </Link>
                                                </li>
                                            </ul>
                                        </>
                                    )}
                                    {item.githubReleaseLink && (
                                        <>
                                            <Text strong>GitHub Release:</Text>
                                            <ul>
                                                <li>
                                                    <Link to={item.githubReleaseLink} target="_blank">
                                                        {item.githubReleaseLink}
                                                    </Link>
                                                </li>
                                            </ul>
                                        </>
                                    )}
                                </>
                            )}
                        />
                    </Paragraph>
                </StyledContent>
            </StyledLayout>
        </>
    );
};
