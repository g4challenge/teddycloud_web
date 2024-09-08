import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Modal,
    Table,
    Tooltip,
    message,
    Button,
    Input,
    Breadcrumb,
    InputRef,
    theme,
    TreeSelectProps,
    TreeSelect,
    Typography,
    Alert,
} from "antd";
import { Key } from "antd/es/table/interface";
import { SortOrder } from "antd/es/table/interface";
import { useAudioContext } from "../audio/AudioContext";
import {
    CloseOutlined,
    CloudServerOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderAddOutlined,
    FormOutlined,
    NodeExpandOutlined,
    PlayCircleOutlined,
    TruckOutlined,
} from "@ant-design/icons";
import { humanFileSize } from "../../utils/humanFileSize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { TonieInfo } from "../tonies/TonieCard";
import ConfirmationDialog from "./ConfirmationDialog";
import TonieAudioPlaylistEditor from "../tonies/TonieAudioPlaylistEditor";
import TonieInformationModal from "./TonieInformationModal";

import { TeddyCloudApi } from "../../api";
import { defaultAPIConfig } from "../../config/defaultApiConfig";
import { DefaultOptionType } from "antd/es/select";

const api = new TeddyCloudApi(defaultAPIConfig());

const { useToken } = theme;

const rootTreeNode = { id: "1", pId: "-1", value: "1", title: "/", fullPath: "/" };

interface RecordTafHeader {
    audioId?: any;
    sha1Hash?: any;
    size?: number;
    tracks?: any;
}

export type Record = {
    date: number;
    isDir: boolean;
    name: string;
    tafHeader: RecordTafHeader;
    tonieInfo: TonieInfo;
};

export const FileBrowser: React.FC<{
    special: string;
    filetypeFilter?: string[];
    isTapList?: boolean;
    overlay?: string;
    maxSelectedRows?: number;
    trackUrl?: boolean;
    selectTafOrTapOnly?: boolean;
    showDirOnly?: boolean;
    showColumns?: string[];
    onFileSelectChange?: (files: any[], path: string, special: string) => void;
}> = ({
    special,
    filetypeFilter = [],
    isTapList = false,
    overlay = "",
    maxSelectedRows = 0,
    selectTafOrTapOnly = true,
    trackUrl = true,
    showDirOnly = false,
    showColumns = undefined,
    onFileSelectChange,
}) => {
    const { t } = useTranslation();
    const { playAudio } = useAudioContext();
    const { token } = useToken();
    const location = useLocation();
    const navigate = useNavigate();
    const inputRef = useRef<InputRef>(null);
    const inputRefFilter = useRef<InputRef>(null);
    const cursorPositionFilterRef = useRef<number | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const [files, setFiles] = useState([]);
    const [path, setPath] = useState("");
    const [rebuildList, setRebuildList] = useState(false);
    const [currentFile, setCurrentFile] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [jsonData, setJsonData] = useState<string>("");
    const [jsonViewerModalOpened, setJsonViewerModalOpened] = useState(false);

    const [tapEditorModalOpen, setTapEditorModalOpen] = useState(false);
    const [tapEditorKey, setTapEditorKey] = useState(0);

    const [currentRecordTafHeader, setCurrentRecordTafHeader] = useState<RecordTafHeader>();
    const [tafHeaderModalOpened, setTafHeaderModalOpened] = useState<boolean>(false);

    const [isCreateDirectoryModalOpen, setCreateDirectoryModalOpen] = useState<boolean>(false);
    const [createDirectoryPath, setCreateDirectoryPath] = useState<string>(path);
    const [inputValueCreateDirectory, setInputValueCreateDirectory] = useState("");

    const [isInformationModalOpen, setInformationModalOpen] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<Record>();

    const [filterText, setFilterText] = useState("");
    const [filterFieldAutoFocus, setFilterFieldAutoFocus] = useState(false);

    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [isConfirmMultipleDeleteModalOpen, setIsConfirmMultipleDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);
    const [deletePath, setDeletePath] = useState<string>("");
    const [deleteApiCall, setDeleteApiCall] = useState<string>("");

    const [treeNodeId, setTreeNodeId] = useState<string>(rootTreeNode.id);
    const [treeData, setTreeData] = useState<Omit<DefaultOptionType, "label">[]>([rootTreeNode]);

    const [isMoveFileModalOpen, setIsMoveFileModalOpen] = useState(false);

    const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
    const [newFilename, setInputValueNewFilename] = useState<string>(currentFile);

    useEffect(() => {
        const preLoadTreeData = async () => {
            const newPath = pathFromNodeId(rootTreeNode.id);

            api.apiGetTeddyCloudApiRaw(`/api/fileIndexV2?path=${newPath}&special=library`)
                .then((response) => response.json())
                .then((data) => {
                    var list: any[] = data.files;
                    list = list
                        .filter((entry) => entry.isDir && entry.name !== "..")
                        .sort((a, b) => {
                            return a.name === b.name ? 0 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
                        })
                        .map((entry) => {
                            return {
                                id: rootTreeNode.id + "." + list.indexOf(entry),
                                pId: rootTreeNode.id,
                                value: rootTreeNode.id + "." + list.indexOf(entry),
                                title: entry.name,
                                fullPath: `${newPath}/${entry.name}/`,
                            };
                        });
                    setTreeData(treeData.concat(list));
                });
        };
        preLoadTreeData();
    }, []);

    useEffect(() => {
        // Function to parse the query parameters from the URL
        const queryParams = new URLSearchParams(location.search);
        const initialPath = queryParams.get("path") || ""; // Get the 'path' parameter from the URL, default to empty string if not present

        setPath(initialPath); // Set the initial path
    }, [location]);

    useEffect(() => {
        if (overlay) {
            const queryParams = new URLSearchParams(location.search);
            queryParams.set("path", "");
            setPath("");
            const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
            window.history.replaceState(null, "", newUrl);
            setRebuildList((prev) => !prev);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overlay]);

    useEffect(() => {
        api.apiGetTeddyCloudApiRaw(
            `/api/fileIndexV2?path=${path}&special=${special}` + (overlay ? `&overlay=${overlay}` : ""),
        )
            .then((response) => response.json())
            .then((data) => {
                var list: never[] = data.files;

                if (showDirOnly) list = list.filter((file: any) => file.isDir);
                if (filetypeFilter.length > 0)
                    list = list.filter(
                        (file: any) =>
                            file.isDir || filetypeFilter.some((filetypeFilter) => file.name.endsWith(filetypeFilter)),
                    );
                setFiles(list);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, special, showDirOnly, rebuildList]);

    useEffect(() => {
        if (isCreateDirectoryModalOpen) {
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 0);
        }
    }, [isCreateDirectoryModalOpen]);

    useEffect(() => {
        if (cursorPositionFilterRef.current !== null && inputRefFilter.current) {
            inputRefFilter.current.setSelectionRange(cursorPositionFilterRef.current, cursorPositionFilterRef.current);
        }
    }, [filterText]);

    useEffect(() => {
        setCreateDirectoryPath(path);
    }, [path]);

    useEffect(() => {
        setInputValueNewFilename(currentFile);
    }, [currentFile]);

    // general functions
    function detectColorScheme() {
        const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const storedTheme = localStorage.getItem("theme");

        if (storedTheme === "auto") {
            return prefersDarkMode ? "dark" : "light";
        } else {
            return storedTheme;
        }
    }

    // Json Viewer functions
    const fetchJsonData = async (path: string) => {
        try {
            const response = await api.apiGetTeddyCloudApiRaw(path);
            const data = await response.json();
            setJsonData(data);
        } catch (error) {
            console.error("Error fetching JSON data:", error);
        }
    };

    const showJsonViewer = (file: string) => {
        const folder = special === "library" ? "/library" : "/content";
        fetchJsonData(folder + file);
        setFilterFieldAutoFocus(false);
        setCurrentFile(file);
        setJsonViewerModalOpened(true);
    };

    const closeJsonViewer = () => {
        setJsonViewerModalOpened(false);
    };

    const jsonViewerModalFooter = (
        <Button type="primary" onClick={() => setJsonViewerModalOpened(false)}>
            {t("tonies.informationModal.ok")}
        </Button>
    );

    const jsonViewerModal = (
        <Modal
            className="json-viewer"
            footer={jsonViewerModalFooter}
            width={700}
            title={"File: " + currentFile}
            open={jsonViewerModalOpened}
            onCancel={closeJsonViewer}
        >
            {jsonData ? (
                <SyntaxHighlighter
                    language="json"
                    style={detectColorScheme() === "dark" ? oneDark : oneLight}
                    customStyle={{
                        padding: 0,
                        borderRadius: 0,
                        margin: 0,
                        border: "none",
                    }}
                >
                    {JSON.stringify(jsonData, null, 2)}
                </SyntaxHighlighter>
            ) : (
                "Loading..."
            )}
        </Modal>
    );

    // taf header viewer functions
    const showTafHeader = (file: string, recordTafHeader: RecordTafHeader) => {
        const currentRecordTafHeader: RecordTafHeader = recordTafHeader;
        const { tracks, ...currentRecordTafHeaderCopy } = currentRecordTafHeader;
        setFilterFieldAutoFocus(false);
        setCurrentRecordTafHeader(currentRecordTafHeaderCopy);
        setCurrentFile(file);
        setTafHeaderModalOpened(true);
    };

    const closeTafHeader = () => {
        setTafHeaderModalOpened(false);
    };

    const tafHeaderViewerModal = (
        <Modal
            className="taf-header-viewer"
            footer={
                <Button type="primary" onClick={() => setTafHeaderModalOpened(false)}>
                    {t("tonies.informationModal.ok")}
                </Button>
            }
            title={t("tonies.tafHeaderOf") + currentFile}
            open={tafHeaderModalOpened}
            onCancel={closeTafHeader}
        >
            {currentRecordTafHeader ? (
                <SyntaxHighlighter
                    language="json"
                    style={detectColorScheme() === "dark" ? oneDark : oneLight}
                    customStyle={{
                        padding: 0,
                        borderRadius: 0,
                        margin: 0,
                        border: "none",
                    }}
                >
                    {JSON.stringify(currentRecordTafHeader, null, 2)}
                </SyntaxHighlighter>
            ) : (
                "Loading..."
            )}
        </Modal>
    );

    // directory tree
    const onLoadTreeData: TreeSelectProps["loadData"] = ({ id }) =>
        new Promise((resolve, reject) => {
            const newPath = pathFromNodeId(id);
            api.apiGetTeddyCloudApiRaw(`/api/fileIndexV2?path=${newPath}&special=library`)
                .then((response) => response.json())
                .then((data) => {
                    let list: any[] = data.files;
                    list = list
                        .filter((entry) => entry.isDir && entry.name !== "..")
                        .sort((a, b) => {
                            return a.name === b.name ? 0 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
                        })
                        .map((entry) => {
                            return {
                                id: id + "." + list.indexOf(entry),
                                pId: id,
                                value: id + "." + list.indexOf(entry),
                                title: entry.name,
                                fullPath: `${newPath}/${entry.name}/`,
                            };
                        });
                    setTreeData(treeData.concat(list));
                    resolve(true);
                })
                .then(() => {
                    reject();
                });
        });

    const pathFromNodeId = (nodeId: string): string => {
        const node = treeData.filter((entry) => entry.value === nodeId)[0];
        if (node.pId === "-1") return "";
        return pathFromNodeId(treeData.filter((entry) => entry.id === node.pId)[0].id) + "/" + node.title;
    };

    const findNodeIdByFullPath = (fullPath: string, nodes: any[]): string | null => {
        for (const node of nodes) {
            if (node.fullPath === fullPath) {
                return node.id;
            }
        }
        return null;
    };

    // tap functions
    const onTAPCreate = (values: any) => {
        console.log("Received values of form: ", values);
        setTapEditorModalOpen(false);
    };

    const handleEditTapClick = (file: string) => {
        if (file.includes(".tap")) {
            const folder = special === "library" ? "/library" : "/content";
            fetchJsonData(folder + file);
            setFilterFieldAutoFocus(false);
            setCurrentFile(file);
            setTapEditorKey((prevKey) => prevKey + 1);
            setTapEditorModalOpen(true);
        }
    };

    // move / rename functions
    const moveRenameFile = async (source: string, target: string, moving: boolean) => {
        const body = "source=" + encodeURIComponent(source) + "&target=" + encodeURIComponent(target);
        const loadingMessage = message.loading(
            moving ? t("fileBrowser.messages.moving") : t("fileBrowser.messages.renaming"),
            0,
        );
        try {
            const moveUrl = `/api/fileMove${"?special=" + special + (overlay ? `&overlay=${overlay}` : "")}`;
            const response = await api.apiPostTeddyCloudRaw(moveUrl, body);

            const data = await response.text();
            loadingMessage();
            if (data === "OK") {
                message.success(
                    moving
                        ? t("fileBrowser.messages.movingSuccessful", { file: source })
                        : t("fileBrowser.messages.renamingSuccessful"),
                );
            } else {
                message.error(
                    `${moving ? t("fileBrowser.messages.movingFailed", { file: source }) : t("fileBrowser.messages.renamingFailed")}: ${data}`,
                );
                throw data;
            }
        } catch (error) {
            loadingMessage();
            message.error(
                `${moving ? t("fileBrowser.messages.movingFailed", { file: source }) : t("fileBrowser.messages.renamingFailed")}: ${error}`,
            );
            throw error;
        }
    };

    // move
    const showMoveDialog = (fileName: string) => {
        setCurrentFile(fileName);
        setIsMoveFileModalOpen(true);
    };

    const closeMoveFileModal = () => {
        setIsMoveFileModalOpen(false);
        setTreeNodeId(rootTreeNode.id);
    };

    const handleSingleMove = async (source: string, target: string) => {
        try {
            await moveRenameFile(source + "/" + currentFile, target + "/" + currentFile, true);
            setRebuildList((prev) => !prev);
            setIsMoveFileModalOpen(false);
            setTreeNodeId(rootTreeNode.id);
        } catch (error) {}
    };

    const handleMultipleMove = async (source: string, target: string) => {
        if (selectedRowKeys.length > 0) {
            for (const rowName of selectedRowKeys) {
                const file = (files as Record[]).find((file) => file.name === rowName);
                if (file && !file.isDir) {
                    await moveRenameFile(source + "/" + file.name, target + "/" + file.name, true);
                }
            }
            setRebuildList((prev) => !prev);
            setIsMoveFileModalOpen(false);
            setSelectedRowKeys([]);
            setTreeNodeId(rootTreeNode.id);
        } else {
            message.warning("No rows selected for moving.");
        }
    };

    const isMoveButtonDisabled = !treeNodeId || pathFromNodeId(treeNodeId) === path;

    const moveFileModal = (
        <Modal
            title={currentFile ? t("fileBrowser.moveFile.modalTitle") : t("fileBrowser.moveFile.modalTitleMultiple")}
            open={isMoveFileModalOpen}
            onCancel={closeMoveFileModal}
            onOk={() =>
                currentFile
                    ? handleSingleMove(path, pathFromNodeId(treeNodeId))
                    : handleMultipleMove(path, pathFromNodeId(treeNodeId))
            }
            okText={t("fileBrowser.moveFile.move")}
            cancelText={t("fileBrowser.moveFile.cancel")}
            okButtonProps={{ disabled: isMoveButtonDisabled }}
        >
            <Alert
                message={t("fileBrowser.attention")}
                description={t("fileBrowser.moveFile.attention")}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "space-between" }}>
                <Input
                    type="text"
                    style={{
                        borderTopRightRadius: currentFile ? 0 : "unset",
                        borderBottomRightRadius: currentFile ? 0 : "unset",
                    }}
                    disabled
                    value={path + "/" + (currentFile ? currentFile : "")}
                    placeholder={path + "/" + (currentFile ? currentFile : "")}
                />
                <div>{t("fileBrowser.moveFile.moveTo")}</div>

                <div style={{ display: "flex" }}>
                    <TreeSelect
                        className="move-file"
                        treeLine
                        treeDataSimpleMode
                        value={treeNodeId}
                        dropdownStyle={{
                            maxHeight: 400,
                            overflow: "auto",
                        }}
                        onChange={setTreeNodeId}
                        loadData={onLoadTreeData}
                        treeData={treeData}
                        treeNodeLabelProp="fullPath"
                        placeholder={t("fileBrowser.moveFile.destinationPlaceholder")}
                    />
                    <Tooltip title={t("fileBrowser.createDirectory.createDirectory")}>
                        <Button
                            icon={<FolderAddOutlined />}
                            onClick={() => {
                                setCreateDirectoryPath(pathFromNodeId(treeNodeId));
                                setCreateDirectoryModalOpen(true);
                            }}
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        ></Button>
                    </Tooltip>
                </div>
            </div>
        </Modal>
    );

    // rename
    const showRenameDialog = (fileName: string) => {
        setCurrentFile(fileName);
        setIsRenameFileModalOpen(true);
    };

    const handleRename = async (source: string, newFileName: string) => {
        try {
            await moveRenameFile(source + "/" + currentFile, source + "/" + newFileName, false);
            setInputValueNewFilename("");
            setRebuildList((prev) => !prev);
            setIsRenameFileModalOpen(false);
        } catch (error) {}
    };

    const closeRenameFileModal = () => {
        setIsRenameFileModalOpen(false);
    };

    const handleNewFilenameInputChange = (e: { target: { value: React.SetStateAction<string> } }) => {
        setInputValueNewFilename(e.target.value);
    };

    const isRenameButtonDisabled = !newFilename || newFilename === currentFile;

    const renameFileModal = (
        <Modal
            title={t("fileBrowser.renameFile.modalTitle")}
            open={isRenameFileModalOpen}
            onCancel={closeRenameFileModal}
            onOk={() => handleRename(path, newFilename)}
            okText={t("fileBrowser.renameFile.rename")}
            cancelText={t("fileBrowser.renameFile.cancel")}
            okButtonProps={{ disabled: isRenameButtonDisabled }}
        >
            <Alert
                message={t("fileBrowser.attention")}
                description={t("fileBrowser.renameFile.attention")}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "space-between" }}>
                <Input
                    type="text"
                    value={newFilename}
                    onChange={handleNewFilenameInputChange}
                    placeholder={currentFile}
                />
            </div>
        </Modal>
    );

    // delete functions
    const showDeleteConfirmDialog = (fileName: string, path: string, apiCall: string) => {
        setFilterFieldAutoFocus(false);
        setFileToDelete(fileName);
        setDeletePath(path);
        setDeleteApiCall(apiCall);
        setIsConfirmDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        deleteFile(deletePath, deleteApiCall);
        setRebuildList((prev) => !prev);
        setIsConfirmDeleteModalOpen(false);
    };

    const handleCancelDelete = () => {
        setIsConfirmDeleteModalOpen(false);
        setIsConfirmMultipleDeleteModalOpen(false);
    };

    const handleMultipleDelete = () => {
        setIsConfirmMultipleDeleteModalOpen(true);
    };

    const handleConfirmMultipleDelete = async () => {
        if (selectedRowKeys.length > 0) {
            for (const rowName of selectedRowKeys) {
                const file = (files as Record[]).find((file) => file.name === rowName);
                if (file) {
                    const deletePath = path + "/" + file.name;
                    const deleteApiCall = "?special=" + special + (overlay ? `&overlay=${overlay}` : "");
                    await deleteFile(deletePath, deleteApiCall);
                }
            }
            setRebuildList((prev) => !prev);
            setIsConfirmMultipleDeleteModalOpen(false);
            setSelectedRowKeys([]);
        } else {
            message.warning("No rows selected for deletion.");
        }
    };

    const deleteFile = async (deletePath: string, apiCall: string) => {
        const loadingMessage = message.loading(t("fileBrowser.messages.deleting"), 0);
        try {
            const deleteUrl = `/api/fileDelete${apiCall}`;
            const response = await api.apiPostTeddyCloudRaw(deleteUrl, deletePath);

            const data = await response.text();
            loadingMessage();
            if (data === "OK") {
                message.success(t("fileBrowser.messages.deleteSuccessful", { file: deletePath }));
                const idToRemove = findNodeIdByFullPath(deletePath + "/", treeData);
                if (idToRemove) {
                    setTreeData((prevData) => prevData.filter((node) => node.id !== idToRemove));
                }
                if (createDirectoryPath === deletePath + "/") {
                    setCreateDirectoryPath(path);
                }
            } else {
                message.error(`${t("fileBrowser.messages.deleteFailed", { file: deletePath })}: ${data}`);
            }
        } catch (error) {
            loadingMessage();
            message.error(`${t("fileBrowser.messages.deleteFailed", { file: deletePath })}: ${error}`);
        }
    };

    // create directory functions
    const openCreateDirectoryModal = () => {
        setFilterFieldAutoFocus(false);
        setCreateDirectoryModalOpen(true);
    };

    const handleCreateDirectoryInputChange = (e: { target: { value: React.SetStateAction<string> } }) => {
        setInputValueCreateDirectory(e.target.value);
    };

    const createDirectory = () => {
        try {
            api.apiPostTeddyCloudRaw(
                `/api/dirCreate?special=library`,
                createDirectoryPath + "/" + inputValueCreateDirectory,
            )
                .then((response) => {
                    return response.text();
                })
                .then((text) => {
                    if (text !== "OK") {
                        throw new Error(text);
                    }

                    const newNodeId = `${treeNodeId}.${treeData.length}`; // Generate a unique ID for the new node
                    const newDir = {
                        id: newNodeId,
                        pId: treeNodeId,
                        value: newNodeId,
                        title: inputValueCreateDirectory,
                        fullPath: createDirectoryPath + "/" + inputValueCreateDirectory + "/",
                    };
                    setTreeData(
                        [...treeData, newDir].sort((a, b) => {
                            return a.title === b.title ? 0 : a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
                        }),
                    );
                    if (isMoveFileModalOpen) {
                        setTreeNodeId(newNodeId);
                    }
                    message.success(t("fileBrowser.createDirectory.directoryCreated"));
                    setCreateDirectoryModalOpen(false);
                    setRebuildList((prev) => !prev);
                    setInputValueCreateDirectory("");
                })
                .catch((error) => {
                    message.error(error.message);
                });
        } catch (error) {
            message.error(`Error while creating directory`);
        }
    };

    const closeCreateDirectoryModal = () => {
        setFilterFieldAutoFocus(false);
        setCreateDirectoryModalOpen(false);
        setInputValueCreateDirectory("");
    };

    const isCreateDirectoryButtonDisabled = !inputValueCreateDirectory;

    const createDirectoryModal = (
        <Modal
            title={t("fileBrowser.createDirectory.modalTitle")}
            open={isCreateDirectoryModalOpen}
            onCancel={closeCreateDirectoryModal}
            onOk={createDirectory}
            okText={t("fileBrowser.createDirectory.create")}
            cancelText={t("fileBrowser.createDirectory.cancel")}
            zIndex={1050}
            okButtonProps={{ disabled: isCreateDirectoryButtonDisabled }}
        >
            <Typography style={{ marginBottom: 8 }}>
                {t("fileBrowser.createDirectory.parentPath") + " " + createDirectoryPath + "/"}{" "}
            </Typography>
            <Input
                ref={inputRef}
                placeholder={t("fileBrowser.createDirectory.placeholder")}
                value={inputValueCreateDirectory}
                onChange={handleCreateDirectoryInputChange}
            />
        </Modal>
    );

    // information model functions
    const showInformationModal = (record: any) => {
        if (!record.isDir && record.tonieInfo?.tracks) {
            setCurrentRecord(record);
            setInformationModalOpen(true);
        }
    };

    // breadcrumb functions
    const handleBreadcrumbClick = (dirPath: string) => {
        if (trackUrl) {
            navigate(`?path=${dirPath}`);
        }
        if (path === dirPath) {
            setRebuildList((prev) => !prev);
        }
        setFilterFieldAutoFocus(false);
        setPath(dirPath);
    };

    const generateBreadcrumbs = (path: string, handleBreadcrumbClick: { (dirPath: string): void }) => {
        const pathArray = path.split("/").filter((segment) => segment);

        const breadcrumbItems = [
            {
                title: (
                    <span style={{ cursor: "pointer" }} onClick={() => handleBreadcrumbClick("")}>
                        {t("fileBrowser.root")}
                    </span>
                ),
                key: "/",
            },
        ];

        pathArray.forEach((segment, index) => {
            const segmentPath = `/${pathArray.slice(0, index + 1).join("/")}`;
            breadcrumbItems.push({
                title: (
                    <span style={{ cursor: "pointer" }} onClick={() => handleBreadcrumbClick(segmentPath)}>
                        {segment}
                    </span>
                ),
                key: segmentPath,
            });
        });

        return <Breadcrumb items={breadcrumbItems} />;
    };

    // migrate Content functions
    const migrateContent2Lib = (ruid: string, libroot: boolean, overlay?: string) => {
        try {
            messageApi.open({
                type: "loading",
                content: t("fileBrowser.messages.migrationOngoing"),
                duration: 0,
            });

            const body = `ruid=${ruid}&libroot=${libroot}`;

            api.apiPostTeddyCloudRaw("/api/migrateContent2Lib", body, overlay)
                .then((response) => response.text())
                .then((data) => {
                    messageApi.destroy();

                    if (data === "OK") {
                        messageApi.open({
                            type: "success",
                            content: t("fileBrowser.messages.migrationSuccessful"),
                        });
                        setRebuildList((prev) => !prev);
                    } else {
                        messageApi.open({
                            type: "error",
                            content: t("fileBrowser.messages.migrationFailed") + ": " + data,
                        });
                    }
                })
                .catch((error) => {
                    messageApi.destroy();
                    messageApi.open({
                        type: "error",
                        content: t("fileBrowser.messages.migrationFailed") + ": " + error,
                    });
                });
        } catch (error) {
            messageApi.destroy();
            messageApi.open({
                type: "error",
                content: t("fileBrowser.messages.migrationFailed") + ": " + error,
            });
        }
    };

    // filter functions
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(e.target.value);
        cursorPositionFilterRef.current = e.target.selectionStart;
        setFilterFieldAutoFocus(true);
    };

    const clearFilterField = () => {
        setFilterText("");
        cursorPositionFilterRef.current = 0;
    };

    const handleFilterFieldInputFocus = () => {
        setFilterFieldAutoFocus(true);
    };

    // table functions
    const rowClassName = (record: any) => {
        return selectedRowKeys.includes(record.key) ? "highlight-row" : "";
    };

    const onSelectChange = (newSelectedRowKeys: Key[]) => {
        if (maxSelectedRows > 0) {
            if (selectTafOrTapOnly) {
                const rowCount = newSelectedRowKeys.length;
                newSelectedRowKeys = newSelectedRowKeys.filter((key) => {
                    const file = files.find((f: any) => f.name === key) as any;
                    return (file && file.tafHeader !== undefined) || (file && file.name.toLowerCase().endsWith(".tap"));
                });
                if (rowCount !== newSelectedRowKeys.length) {
                    message.warning(t("fileBrowser.selectTafOrTapOnly"));
                }
            }
            if (newSelectedRowKeys.length > maxSelectedRows) {
                message.warning(
                    t("fileBrowser.maxSelectedRows", {
                        maxSelectedRows: maxSelectedRows,
                    }),
                );
            } else {
                setSelectedRowKeys(newSelectedRowKeys);
            }
        } else {
            setSelectedRowKeys(newSelectedRowKeys);
        }
        const selectedFiles = files?.filter((file: any) => newSelectedRowKeys.includes(file.name)) || [];
        if (onFileSelectChange !== undefined) onFileSelectChange(selectedFiles, path, special);
    };

    const handleDirClick = (dirPath: string) => {
        const newPath = dirPath === ".." ? path.split("/").slice(0, -1).join("/") : `${path}/${dirPath}`;
        if (trackUrl) {
            navigate(`?path=${newPath}`);
        }
        setFilterFieldAutoFocus(false);
        setSelectedRowKeys([]);
        setPath(newPath);
    };

    const getFieldValue = (obj: any, keys: string[]) => {
        return keys.reduce((acc, currentKey) => {
            if (acc && acc[currentKey] !== undefined) {
                return acc[currentKey];
            }
            return undefined;
        }, obj);
    };

    const defaultSorter = (a: any, b: any, dataIndex: string | string[]) => {
        // Get the values of the fields
        const fieldA = Array.isArray(dataIndex) ? getFieldValue(a, dataIndex) : a[dataIndex];
        const fieldB = Array.isArray(dataIndex) ? getFieldValue(b, dataIndex) : b[dataIndex];

        if (fieldA === undefined && fieldB === undefined) {
            return 0; // Both values are undefined, consider them equal
        } else if (fieldA === undefined) {
            return 1; // Field A is undefined, consider it greater than B
        } else if (fieldB === undefined) {
            return -1; // Field B is undefined, consider it greater than A
        }

        if (typeof fieldA === "string" && typeof fieldB === "string") {
            return fieldA.localeCompare(fieldB);
        } else if (typeof fieldA === "number" && typeof fieldB === "number") {
            return fieldA - fieldB;
        } else {
            console.log("Unsupported types for sorting:", a, b);
            console.log("Unsupported types for sorting field:", dataIndex, fieldA, fieldB);
            return 0;
        }
    };

    const dirNameSorter = (a: any, b: any) => {
        if (a.isDir === b.isDir) {
            return defaultSorter(a, b, "name");
        }
        return a.isDir ? -1 : 1;
    };

    var columns: any[] = [
        {
            title:
                maxSelectedRows === 0 && selectedRowKeys.length > 0 ? (
                    <div style={{ display: "flex", gap: 8 }}>
                        <Tooltip key="moveMultiple" title={t("fileBrowser.moveMultiple")}>
                            <Button
                                icon={<NodeExpandOutlined />}
                                onClick={() => showMoveDialog("")}
                                disabled={selectedRowKeys.length === 0}
                            />
                        </Tooltip>
                        <Tooltip key="deleteMultiple" title={t("fileBrowser.deleteMultiple")}>
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={handleMultipleDelete}
                                disabled={selectedRowKeys.length === 0}
                            />
                        </Tooltip>
                    </div>
                ) : (
                    ""
                ),
            dataIndex: ["tonieInfo", "picture"],
            key: "picture",
            sorter: undefined,
            width: 10,
            render: (picture: string, record: any) =>
                record && record.tonieInfo?.picture ? (
                    <img
                        key={`picture-${record.name}`}
                        src={record.tonieInfo.picture}
                        alt={t("tonies.content.toniePicture")}
                        onClick={() => showInformationModal(record)}
                        style={{
                            width: 100,
                            cursor: !record.isDir && record?.tonieInfo?.tracks ? "help" : "default",
                        }}
                    />
                ) : (
                    <></>
                ),
            showOnDirOnly: false,
        },
        {
            title: t("fileBrowser.name"),
            dataIndex: "name",
            key: "name",
            sorter: dirNameSorter,
            defaultSortOrder: "ascend" as SortOrder,
            render: (picture: string, record: any) =>
                record && (
                    <div key={`name-${record.name}`}>
                        <div className="showSmallDevicesOnly">
                            <div>
                                <div style={{ wordBreak: record.isDir ? "normal" : "break-word" }}>
                                    {record.isDir ? "[" + record.name + "]" : record.name}{" "}
                                </div>
                                {!record.isDir && record.size ? "(" + humanFileSize(record.size) + ")" : ""}
                            </div>

                            <div>{record.tonieInfo?.model}</div>
                            <div style={{ wordBreak: record.isDir ? "normal" : "break-word" }}>
                                {(record.tonieInfo?.series ? record.tonieInfo?.series : "") +
                                    (record.tonieInfo?.episode ? " - " + record.tonieInfo?.episode : "")}
                            </div>
                            <div>{!record.isDir && new Date(record.date * 1000).toLocaleString()}</div>
                        </div>
                        <div className="showMediumDevicesOnly">
                            <div>
                                <div style={{ wordBreak: record.isDir ? "normal" : "break-word" }}>
                                    {record.isDir ? "[" + record.name + "]" : record.name}{" "}
                                </div>
                                {!record.isDir && record.size ? "(" + humanFileSize(record.size) + ")" : ""}
                            </div>
                            <div>{!record.isDir && new Date(record.date * 1000).toLocaleString()}</div>
                        </div>
                        <div className="showBigDevicesOnly">{record.isDir ? "[" + record.name + "]" : record.name}</div>
                    </div>
                ),
            filteredValue: [filterText],
            onFilter: (value: string, record: Record) => {
                const text = value.toLowerCase();
                return (
                    record.name === ".." ||
                    record.name.toLowerCase().includes(text) ||
                    (!record.isDir &&
                        "tafHeader" in record &&
                        record.tafHeader.size &&
                        humanFileSize(record.tafHeader.size).toString().includes(text)) ||
                    ("tafHeader" in record && record.tafHeader.audioId?.toString().includes(text)) ||
                    ("tonieInfo" in record && record.tonieInfo?.model.toLowerCase().includes(text)) ||
                    ("tonieInfo" in record && record.tonieInfo?.series.toLowerCase().includes(text)) ||
                    ("tonieInfo" in record && record.tonieInfo?.episode.toLowerCase().includes(text))
                );
            },
            showOnDirOnly: true,
        },
        {
            title: t("fileBrowser.size"),
            dataIndex: "size",
            key: "size",
            render: (size: number, record: any) => (
                <div key={`size-${record.name}`}>{record.isDir ? "<DIR>" : humanFileSize(size)}</div>
            ),
            showOnDirOnly: false,
            responsive: ["xl"],
        },
        {
            title: t("fileBrowser.model"),
            dataIndex: ["tonieInfo", "model"],
            key: "model",
            showOnDirOnly: false,
            responsive: ["xl"],
            render: (model: string, record: any) => <div key={`model-${record.name}`}>{record.tonieInfo?.model}</div>,
        },
        {
            title: (
                <>
                    <div className="showMediumDevicesOnly">
                        {t("fileBrowser.model")}/{t("fileBrowser.series")}/{t("fileBrowser.episode")}
                    </div>
                    <div className="showBigDevicesOnly">{t("fileBrowser.series")}</div>
                </>
            ),
            dataIndex: ["tonieInfo", "series"],
            key: "series",
            render: (series: string, record: any) => (
                <div key={`series-${record.name}`}>
                    <div className="showMediumDevicesOnly">
                        <div>{record.tonieInfo?.model}</div>
                        <div style={{ wordBreak: "break-word" }}>
                            {(record.tonieInfo?.series ? record.tonieInfo?.series : "") +
                                (record.tonieInfo?.episode ? " - " + record.tonieInfo?.episode : "")}
                        </div>
                    </div>
                    <div className="showBigDevicesOnly">{record.tonieInfo?.series ? record.tonieInfo?.series : ""}</div>
                </div>
            ),
            showOnDirOnly: false,
            responsive: ["md"],
        },
        {
            title: t("fileBrowser.episode"),
            dataIndex: ["tonieInfo", "episode"],
            key: "episode",
            showOnDirOnly: false,
            responsive: ["xl"],
            render: (episode: string, record: any) => (
                <div key={`episode-${record.name}`}>{record.tonieInfo?.episode}</div>
            ),
        },
        {
            title: t("fileBrowser.date"),
            dataIndex: "date",
            key: "date",
            render: (timestamp: number, record: any) => (
                <div key={`date-${record.name}`}>{new Date(timestamp * 1000).toLocaleString()}</div>
            ),
            showOnDirOnly: true,
            responsive: ["xl"],
        },
        {
            title: <div className="showMediumDevicesOnly showBigDevicesOnly">{t("fileBrowser.actions")}</div>,
            dataIndex: "controls",
            key: "controls",
            sorter: undefined,
            render: (name: string, record: any) => {
                let actions = [];

                // taf file
                if (record.tafHeader) {
                    // migration to lib possible
                    if (special !== "library") {
                        actions.push(
                            <Tooltip key={`action-migrate-${record.name}`} title={t("fileBrowser.migrateContentToLib")}>
                                <CloudServerOutlined
                                    onClick={() =>
                                        migrateContent2Lib(path.replace("/", "") + record.name, false, overlay)
                                    }
                                    style={{ margin: "0 8px 0 0" }}
                                />
                            </Tooltip>,
                        );
                        actions.push(
                            <Tooltip
                                key={`action-migrate-root-${record.name}`}
                                title={t("fileBrowser.migrateContentToLibRoot")}
                            >
                                <TruckOutlined
                                    onClick={() =>
                                        migrateContent2Lib(path.replace("/", "") + record.name, true, overlay)
                                    }
                                    style={{ margin: "0 8px 0 0" }}
                                />
                            </Tooltip>,
                        );
                    }
                    actions.push(
                        <Tooltip key={`action-play-${record.name}`} title={t("fileBrowser.playFile")}>
                            <PlayCircleOutlined
                                style={{ margin: "0 8px 0 0" }}
                                onClick={() =>
                                    playAudio(
                                        import.meta.env.VITE_APP_TEDDYCLOUD_API_URL +
                                            "/content" +
                                            path +
                                            "/" +
                                            record.name +
                                            "?ogg=true&special=" +
                                            special +
                                            (overlay ? `&overlay=${overlay}` : ""),
                                        record.tonieInfo,
                                    )
                                }
                            />
                        </Tooltip>,
                    );
                }
                // tap file
                if (isTapList && record.name.includes(".tap")) {
                    actions.push(
                        <Tooltip key={`action-edit-${record.name}`} title={t("fileBrowser.tap.edit")}>
                            <EditOutlined
                                style={{ margin: "0 8px 0 0" }}
                                onClick={() => handleEditTapClick(path + "/" + record.name)}
                            />
                        </Tooltip>,
                    );
                    actions.push(
                        <Tooltip key={`action-copy-${record.name}`} title={t("fileBrowser.tap.copy")}>
                            <CopyOutlined style={{ margin: "0 8px 0 0" }} />
                        </Tooltip>,
                    );
                }
                // include the rename icon on files
                if (!record.isDir && record.name !== ".." && maxSelectedRows === 0) {
                    actions.push(
                        <Tooltip key={`action-rename-${record.name}`} title={t("fileBrowser.rename")}>
                            <FormOutlined
                                onClick={() => showRenameDialog(record.name)}
                                style={{ margin: "0 8px 0 0" }}
                            />
                        </Tooltip>,
                    );
                }
                // include the move icon on files
                if (!record.isDir && record.name !== ".." && maxSelectedRows === 0) {
                    actions.push(
                        <Tooltip key={`action-move-${record.name}`} title={t("fileBrowser.move")}>
                            <NodeExpandOutlined
                                onClick={() => showMoveDialog(record.name)}
                                style={{ margin: "0 8px 0 0" }}
                            />
                        </Tooltip>,
                    );
                }
                // include the delete action
                if (record.name !== ".." && maxSelectedRows === 0) {
                    actions.push(
                        <Tooltip key={`action-delete-${record.name}`} title={t("fileBrowser.delete")}>
                            <DeleteOutlined
                                onClick={() =>
                                    showDeleteConfirmDialog(
                                        record.name,
                                        path + "/" + record.name,
                                        "?special=" + special + (overlay ? `&overlay=${overlay}` : ""),
                                    )
                                }
                                style={{ margin: "0 8px 0 0" }}
                            />
                        </Tooltip>,
                    );
                }
                return actions;
            },
            showOnDirOnly: false,
        },
    ];

    columns.forEach((column) => {
        if (!column.hasOwnProperty("sorter")) {
            (column as any).sorter = (a: any, b: any) => defaultSorter(a, b, column.dataIndex);
        }
    });

    if (showDirOnly) columns = columns.filter((column) => column.showOnDirOnly);

    if (showColumns) {
        columns = columns.filter((column) => {
            if (typeof column.key === "string") {
                // Check if the column's dataIndex matches any of the specified dataIndex values
                return showColumns.includes(column.key);
            }
            return false;
        });
    }

    return (
        <>
            {contextHolder}
            <ConfirmationDialog
                title={t("fileBrowser.confirmDeleteModal")}
                open={isConfirmDeleteModalOpen}
                okText={t("fileBrowser.delete")}
                cancelText={t("fileBrowser.cancel")}
                content={t("fileBrowser.confirmDeleteDialog", { fileToDelete: fileToDelete })}
                handleOk={handleConfirmDelete}
                handleCancel={handleCancelDelete}
            />
            <ConfirmationDialog
                title={t("fileBrowser.confirmDeleteModal")}
                open={isConfirmMultipleDeleteModalOpen}
                okText={t("fileBrowser.delete")}
                cancelText={t("fileBrowser.cancel")}
                content={t("fileBrowser.confirmMultipleDeleteDialog")}
                handleOk={handleConfirmMultipleDelete}
                handleCancel={handleCancelDelete}
            />
            {jsonViewerModal}
            {tafHeaderViewerModal}
            {createDirectoryModal}
            {moveFileModal}
            {renameFileModal}
            {currentRecord ? (
                <TonieInformationModal
                    open={isInformationModalOpen}
                    tonieCardOrTAFRecord={currentRecord}
                    onClose={() => setInformationModalOpen(false)}
                    overlay={overlay}
                />
            ) : (
                ""
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "row", marginBottom: 8 }}>
                    <div style={{ lineHeight: 1.5, marginRight: 16 }}>{t("tonies.currentPath")}</div>
                    {generateBreadcrumbs(path, handleBreadcrumbClick)}
                </div>
                {maxSelectedRows === 0 && special === "library" ? (
                    <Button size="small" onClick={openCreateDirectoryModal} style={{ marginBottom: 8 }}>
                        {t("fileBrowser.createDirectory.createDirectory")}
                    </Button>
                ) : (
                    ""
                )}
            </div>
            <Table
                dataSource={files}
                columns={columns}
                rowKey={(record) => record.name}
                pagination={false}
                onRow={(record) => ({
                    onDoubleClick: () => {
                        if (record.isDir) {
                            handleDirClick(record.name);
                        } else if (record.name.includes(".json") || record.name.includes(".tap")) {
                            showJsonViewer(path + "/" + record.name);
                        } else if (record.tafHeader) {
                            showTafHeader(record.name, record.tafHeader);
                        }
                    },
                })}
                rowClassName={rowClassName}
                rowSelection={
                    maxSelectedRows > 0
                        ? {
                              selectedRowKeys,
                              onChange: onSelectChange,
                          }
                        : {
                              selectedRowKeys,
                              onChange: onSelectChange,
                              getCheckboxProps: (record: Record) => ({
                                  disabled: record.name === "..", // Disable checkbox for rows with name '..'
                              }),
                              onSelectAll: (selected: boolean, selectedRows: any[]) => {
                                  const selectedKeys = selected
                                      ? selectedRows.filter((row) => row.name !== "..").map((row) => row.name)
                                      : [];
                                  setSelectedRowKeys(selectedKeys);
                              },
                          }
                }
                components={{
                    // Override the header to include custom search row
                    header: {
                        wrapper: (props: any) => {
                            return <thead {...props} />;
                        },
                        row: (props: any) => {
                            return (
                                <>
                                    <tr {...props} />
                                    <tr>
                                        <th style={{ padding: "10px 8px" }} colSpan={columns.length + 1}>
                                            <Input
                                                placeholder={t("fileBrowser.filter")}
                                                value={filterText}
                                                onChange={handleFilterChange}
                                                onFocus={handleFilterFieldInputFocus}
                                                ref={inputRefFilter} // Assign ref to input element
                                                style={{ width: "100%" }}
                                                autoFocus={filterFieldAutoFocus}
                                                addonAfter={
                                                    <CloseOutlined
                                                        onClick={clearFilterField}
                                                        disabled={filterText.length === 0}
                                                        style={{
                                                            color:
                                                                filterText.length === 0
                                                                    ? token.colorTextDisabled
                                                                    : token.colorText,
                                                            cursor: filterText.length === 0 ? "default" : "pointer",
                                                        }}
                                                    />
                                                }
                                            />
                                        </th>
                                    </tr>
                                </>
                            );
                        },
                        cell: (props: any) => {
                            return <th {...props} />;
                        },
                    },
                }}
            />
            <TonieAudioPlaylistEditor
                open={tapEditorModalOpen}
                key={tapEditorKey}
                initialValuesJson={jsonData ? JSON.stringify(jsonData, null, 2) : undefined}
                onCreate={onTAPCreate}
                onCancel={() => {
                    setTapEditorModalOpen(false);
                }}
            />
        </>
    );
};
