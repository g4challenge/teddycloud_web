import { useTranslation } from "react-i18next";
import { Typography } from "antd";

import {
    HiddenDesktop,
    StyledBreadcrumb,
    StyledContent,
    StyledLayout,
    StyledSider,
} from "../../components/StyledComponents";
import { CommunitySubNav } from "../../components/community/CommunitySubNav";
import { Link } from "react-router-dom";

const { Paragraph } = Typography;

export const CommunityPage = () => {
    const { t } = useTranslation();

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
                    items={[{ title: t("home.navigationTitle") }, { title: t("community.navigationTitle") }]}
                />
                <StyledContent>
                    <h1>{t(`community.title`)}</h1>
                    <Paragraph>
                        <h2>Get involved</h2>
                        Be a part of our global contributor community by writing code, commenting on issues, or
                        participate in discussons in our telegram group.
                    </Paragraph>
                    <Paragraph>
                        Your best points of contact are the following locations
                        <ul>
                            <li>
                                <Link to="https://github.com/toniebox-reverse-engineering" target="_blank">
                                    GitHub
                                </Link>
                                <li>
                                    The place where all sources are stored for this and related projects. Where you can
                                    fork the repositories, contribute new or improved features, create issues or just
                                    give some feedback on already existing issues.
                                </li>
                            </li>
                            <li>
                                <Link to="https://t.me/toniebox_reverse_engineering" target="_blank">
                                    Telegram Chat
                                </Link>
                                <li>
                                    The first level support if you need help or if you are interested in getting
                                    involved in the development of TeddyCloud.
                                </li>
                            </li>
                            <li>
                                <Link to="https://forum.revvox.de/" target="_blank">
                                    Discourse Forum
                                </Link>
                                <li>
                                    The lively knowledge base for the project, a place to ask questions whose answers
                                    can be helpful for others.
                                </li>
                            </li>
                            <li>
                                <Link to="https://tonies-wiki.revvox.de/docs/tools/teddycloud/" target="_blank">
                                    TeddyCloud Wiki
                                </Link>
                                <li>
                                    A Wiki contains, among other things, how to install TeddyCloud and how to solve
                                    possible problems.
                                </li>
                            </li>
                        </ul>
                    </Paragraph>
                </StyledContent>
            </StyledLayout>
        </>
    );
};
