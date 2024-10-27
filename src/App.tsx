import "./App.css";
import { Layout } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AudioProvider } from "./components/audio/AudioContext";

import { SettingsPage } from "./pages/settings/SettingsPage";
import { RtnlPage } from "./pages/settings/RtnlPage";
import { CertificatesPage } from "./pages/settings/certificates/CertificatesPage";
import { HomePage } from "./pages/home/HomePage";
import { Error404Page } from "./pages/Error404Page";
import { StatsPage } from "./pages/home/StatsPage";
import { StyledHeader } from "./components/header/StyledHeader";
import { StyledFooter } from "./components/footer/StyledFooter";
import { ToniesPage } from "./pages/tonies/ToniesPage";
import { SystemSoundsPage } from "./pages/tonies/SystemSoundsPage";
import { ContentPage } from "./pages/tonies/ContentPage";
import { LibraryPage } from "./pages/tonies/LibraryPage";
import { EncoderPage } from "./pages/tonies/EncoderPage";
import { TonieAudioPlaylistsPage } from "./pages/tonies/TonieAudioPlaylistsPage";
import { TonieboxesPage } from "./pages/tonieboxes/TonieboxesPage";
import { CommunityPage } from "./pages/community/CommunityPage";
import { ContributionPage } from "./pages/community/ContributionPage";
import { ContributionToniesJsonPage } from "./pages/community/ContributionToniesJsonPage";
import { ContributorsPage } from "./pages/community/ContributorsPage";
import { ChangelogPage } from "./pages/community/ChangelogPage";
import { useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import { SunOutlined, MoonOutlined, BulbOutlined } from "@ant-design/icons";
import { ESP32BoxFlashingPage } from "./pages/tonieboxes/boxsetup/esp32/ESP32BoxFlashingPage";
import { TonieMeetingPage } from "./pages/home/TonieMeetingPage";
import { FAQPage } from "./pages/community/FAQPage";
import { FeaturesPage } from "./pages/home/FeaturesPage";
import { CC3235BoxFlashingPage } from "./pages/tonieboxes/boxsetup/cc3235/CC3235BoxFlashingPage";
import { CC3200BoxFlashingPage } from "./pages/tonieboxes/boxsetup/cc3200/CC3200BoxFlashingPage";
import { BoxSetupPage } from "./pages/tonieboxes/boxsetup/BoxSetupPage";
import { IdentifyBoxVersionPage } from "./pages/tonieboxes/boxsetup/IdentifyBoxVersionPage";
import { ESP32LegacyPage } from "./pages/tonieboxes/boxsetup/esp32/ESP32LegacyPage";
import { TranslationsPage } from "./pages/community/TranslationsPage";
import { OpenBoxGuidePage } from "./pages/tonieboxes/boxsetup/OpenBoxGuidePage";
import { detectColorScheme } from "./utils/browserUtils";
import { BoxVersionInformationPage } from "./pages/tonieboxes/boxsetup/BoxVersionInformation";

function App() {
    const { defaultAlgorithm, darkAlgorithm } = theme;

    const updateMetaThemeColor = (themeColor: string) => {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute("content", themeColor);
        }
        document.body.style.backgroundColor = themeColor;
    };

    // State for managing theme mode
    const [themeMode, setThemeMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme || "auto"; // Default to 'auto' if no theme is saved
    });

    const [isDarkMode, setIsDarkMode] = useState(detectColorScheme() === "dark");

    // Function to toggle between dark, light, and auto modes
    const toggleTheme = () => {
        setThemeMode((prevMode) => {
            if (prevMode === "dark") return "light";
            else if (prevMode === "light") return "auto";
            else return "dark";
        });
    };

    // Effect to update local storage when theme mode changes
    useEffect(() => {
        localStorage.setItem("theme", themeMode);
        setIsDarkMode(detectColorScheme() === "dark");
        if (detectColorScheme() === "dark") {
            updateMetaThemeColor("#000000");
        } else {
            updateMetaThemeColor("#f5f5f5");
        }
    }, [themeMode]);

    let themeSwitchIcon;
    if (themeMode === "dark") themeSwitchIcon = <MoonOutlined onClick={toggleTheme} />;
    else if (themeMode === "light") themeSwitchIcon = <SunOutlined onClick={toggleTheme} />;
    else themeSwitchIcon = <BulbOutlined onClick={toggleTheme} />;

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
                components: {
                    Slider: {
                        dotSize: 3,
                        handleSize: 6,
                        handleSizeHover: 8,
                        railSize: 4,
                    },
                    Popover: {
                        titleMinWidth: 0,
                    },
                },
            }}
        >
            <div className="App">
                <Layout style={{ minHeight: "100vh" }}>
                    <Router basename={import.meta.env.VITE_APP_TEDDYCLOUD_WEB_BASE}>
                        <AudioProvider>
                            <StyledHeader themeSwitch={themeSwitchIcon} />
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/home/stats" element={<StatsPage />} />
                                    <Route path="/home/features" element={<FeaturesPage />} />
                                    <Route path="/home/toniemeeting" element={<TonieMeetingPage />} />
                                    <Route path="/tonies" element={<ToniesPage />} />
                                    <Route path="/tonies/system-sounds" element={<SystemSoundsPage />} />
                                    <Route path="/tonies/content" element={<ContentPage />} />
                                    <Route path="/tonies/library" element={<LibraryPage />} />
                                    <Route path="/tonies/encoder" element={<EncoderPage />} />
                                    <Route path="/tonies/tap" element={<TonieAudioPlaylistsPage />} />
                                    <Route path="/tonieboxes" element={<TonieboxesPage />} />
                                    <Route path="/tonieboxes/boxsetup" element={<BoxSetupPage />} />
                                    <Route
                                        path="/tonieboxes/boxsetup/identifyboxversion"
                                        element={<IdentifyBoxVersionPage />}
                                    />
                                    <Route path="/tonieboxes/boxsetup/openboxguide" element={<OpenBoxGuidePage />} />
                                    <Route
                                        path="/tonieboxes/boxsetup/boxversioninfo"
                                        element={<BoxVersionInformationPage />}
                                    />
                                    <Route
                                        path="/tonieboxes/boxsetup/esp32/flashing"
                                        element={<ESP32BoxFlashingPage />}
                                    />
                                    <Route path="/tonieboxes/boxsetup/esp32/legacy" element={<ESP32LegacyPage />} />
                                    <Route
                                        path="/tonieboxes/boxsetup/cc3200/flashing"
                                        element={<CC3200BoxFlashingPage />}
                                    />
                                    <Route
                                        path="/tonieboxes/boxsetup/cc3235/flashing"
                                        element={<CC3235BoxFlashingPage />}
                                    />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/settings/certificates" element={<CertificatesPage />} />
                                    <Route path="/settings/rtnl" element={<RtnlPage />} />
                                    <Route path="/community" element={<CommunityPage />} />
                                    <Route path="/community/faq" element={<FAQPage />} />
                                    <Route path="/community/contribution" element={<ContributionPage />} />
                                    <Route
                                        path="/community/contribution/tonies-json"
                                        element={<ContributionToniesJsonPage />}
                                    />
                                    <Route path="/community/contribution/translations" element={<TranslationsPage />} />
                                    <Route path="/community/contributors" element={<ContributorsPage />} />
                                    <Route path="/community/changelog" element={<ChangelogPage />} />
                                    <Route path="/*" element={<Error404Page />} />
                                </Routes>
                            </Layout>
                            <StyledFooter />
                        </AudioProvider>
                    </Router>
                </Layout>
            </div>
        </ConfigProvider>
    );
}

export default App;
