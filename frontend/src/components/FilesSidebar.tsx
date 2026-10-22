import {useCallback, useEffect, useRef, useState,} from "react";
import type { MouseEvent, FormEvent, ChangeEvent } from "react";
import FileItem from "./FileItem";
import {
    getDocuments,
    getDocumentGroups,
    getGroupDocuments,
    uploadDocument,
    createDocumentGroup,
    renameDocumentGroup,
    deleteDocumentGroup,
    addDocumentToGroup,
    removeDocumentFromGroup,
    deleteDocument,
    type Document,
    type DocumentGroup,
} from "../services/documentsService";

const MAX_SELECTED_FILES = 5;

interface FilesSidebarProps {
    selectedIds: number[];
    onToggleDocument: (documentId: number) => void;
    selectionError: string;
    onClearSelectionError: () => void;
    selectionDisabled: boolean;
}

interface FileGroupData extends DocumentGroup {
    documents: Document[];
}

type ContextMenu =
    | {
          type: "document";
          documentId: number;
          x: number;
          y: number;
      }
    | {
          type: "group";
          groupId: number;
          x: number;
          y: number;
      };

type GroupModal =
    | {
          mode: "create";
          addDocumentId?: number;
      }
    | {
          mode: "rename";
          groupId: number;
      };

function getErrorMessage(error: unknown): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: {
                    data?: { detail?: string };
                };
            }
        ).response;

        if (response?.data?.detail) {
            return response.data.detail;
        }
    }

    return "Something went wrong. Please try again.";
}

export default function FilesSidebar({selectedIds, onToggleDocument, selectionError, onClearSelectionError, selectionDisabled,}: FilesSidebarProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [groups, setGroups] = useState<FileGroupData[]>([]);
    const [collapsedGroups, setCollapsedGroups] = useState<number[]>([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
    const [groupModal, setGroupModal] = useState<GroupModal | null>(null);
    const [groupName, setGroupName] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadFiles = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [allDocuments, allGroups] = await Promise.all([
                getDocuments(),
                getDocumentGroups(),
            ]);

            const groupResults = await Promise.all(
                allGroups.map(async (group) => ({
                    ...group,
                    documents: await getGroupDocuments(group.id),
                }))
            );

            setDocuments(allDocuments);
            setGroups(groupResults);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadFiles();
    }, [loadFiles]);

    const groupedDocumentIds = new Set(
        groups.flatMap((group) =>
            group.documents.map((document) => document.id)
        )
    );

    const ungroupedDocuments = documents.filter(
        (document) => !groupedDocumentIds.has(document.id)
    );

    function toggleGroup(groupId: number) {
        setCollapsedGroups((current) =>
            current.includes(groupId)
                ? current.filter((id) => id !== groupId)
                : [...current, groupId]
        );
    }

    function openDocumentMenu(documentId: number, x: number, y: number) {
        setContextMenu({type: "document", documentId, x, y,});
    }

    function openGroupMenu(event: MouseEvent, groupId: number) {
        event.preventDefault();
        setContextMenu({type: "group", groupId, x: event.clientX, y: event.clientY,});
    }

    function openCreateGroupModal(addDocumentId?: number) {
        setContextMenu(null);
        setGroupName("");
        setGroupModal({
            mode: "create",
            addDocumentId,
        });
    }

    function openRenameGroupModal(group: DocumentGroup) {
        setContextMenu(null);
        setGroupName(group.name);
        setGroupModal({
            mode: "rename",
            groupId: group.id,
        });
    }

    async function handleGroupModalSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const name = groupName.trim();

        if (!name) {
            setError("Group name cannot be empty.");
            return;
        }

        setActionLoading(true);
        setError("");

        try {
            if (groupModal?.mode === "create") {
                const newGroup = await createDocumentGroup(name);

                if (groupModal.addDocumentId !== undefined) {
                    await addDocumentToGroup(
                        newGroup.id,
                        groupModal.addDocumentId
                    );
                }
            } else if (groupModal?.mode === "rename") {
                await renameDocumentGroup(
                    groupModal.groupId,
                    name
                );
            }

            setGroupModal(null);
            setGroupName("");
            await loadFiles();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    }

    async function handleAddToGroup(groupId: number) {
        if (contextMenu?.type !== "document") return;

        const documentId = contextMenu.documentId;
        const targetGroup = groups.find((group) => group.id === groupId);

        if (targetGroup?.documents.some((document) => document.id === documentId)) {
            setContextMenu(null);
            return;
        }

        setActionLoading(true);
        setError("");

        try {
            await addDocumentToGroup(groupId, documentId);
            setContextMenu(null);
            await loadFiles();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    }

    async function handleRemoveFromGroup(groupId: number) {
        if (contextMenu?.type !== "document") return;

        setActionLoading(true);
        setError("");

        try {
            await removeDocumentFromGroup(
                groupId,
                contextMenu.documentId
            );

            setContextMenu(null);
            await loadFiles();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteDocument() {
        if (contextMenu?.type !== "document") return;

        const document = documents.find((item) => item.id === contextMenu.documentId);
        if (!document) return;

        const confirmed = window.confirm(
            `Delete "${document.filename}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        setActionLoading(true);
        setError("");

        try {
            await deleteDocument(document.id);

            setContextMenu(null);

            if (selectedIds.includes(document.id)) {
                onToggleDocument(document.id);
            }

            await loadFiles();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteGroup() {
        if (contextMenu?.type !== "group") return;

        const group = groups.find(
            (item) => item.id === contextMenu.groupId
        );

        if (!group) return;

        const confirmed = window.confirm(
            `Delete group "${group.name}"? The documents themselves will not be deleted.`
        );

        if (!confirmed) return;

        setActionLoading(true);
        setError("");

        try {
            await deleteDocumentGroup(group.id);

            setCollapsedGroups((current) =>
                current.filter((id) => id !== group.id)
            );

            setContextMenu(null);
            await loadFiles();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    }

    async function handleFileChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        if (!/\.(pdf|docx)$/i.test(file.name)) {
            setError("Only PDF and DOCX files are supported.");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const uploadedDocument = await uploadDocument(file);

            await loadFiles();

            if (!selectedIds.includes(uploadedDocument.id)) {
                if (selectedIds.length >= MAX_SELECTED_FILES) {
                    setError(`File uploaded, but you can select only ${MAX_SELECTED_FILES} files.`);
                } else {
                    onToggleDocument(uploadedDocument.id);
                }
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setUploading(false);
        }
    }

    const menuPosition = contextMenu
        ? {
              left: Math.max(
                  8,
                  Math.min(contextMenu.x, window.innerWidth - 228)
              ),
              top: Math.max(
                  8,
                  Math.min(contextMenu.y, window.innerHeight - 380)
              ),
          }
        : undefined;

    const activeDocument =
        contextMenu?.type === "document"
            ? documents.find(
                  (document) => document.id === contextMenu.documentId
              )
            : undefined;

    const documentGroups = activeDocument
        ? groups.filter((group) =>
              group.documents.some(
                  (document) => document.id === activeDocument.id
              )
          )
        : [];

    return (
        <aside className="files-sidebar">
            <div className="files-sidebar-header">
                <h2 className="files-sidebar-title">Files</h2>

                <span className="files-counter">
                    {selectedIds.length}/{MAX_SELECTED_FILES}
                </span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                hidden
                onChange={handleFileChange}
            />

            <button
                type="button"
                className="file-upload-area"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                <div>
                    {uploading ? "Uploading..." : "↑ Upload PDF or DOCX"}
                </div>
                <div>
                    {uploading ? "Please wait" : "Drop files or click"}
                </div>
            </button>

            <button
                type="button"
                className="create-group-button"
                onClick={() => openCreateGroupModal()}
            >
                <span>＋</span> Create group
            </button>

            {selectionError && (
                <div className="files-error" role="alert">
                    <span>{selectionError}</span>
                    <button
                        type="button"
                        onClick={onClearSelectionError}
                        aria-label="Dismiss selection error"
                    >
                        ×
                    </button>
                </div>
            )}

            {error && (
                <div className="files-error" role="alert">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="files-sidebar-content">
                {loading ? (
                    <p className="files-message">Loading files...</p>
                ) : (
                    <>
                        {groups.map((group) => {
                            const collapsed = collapsedGroups.includes(
                                group.id
                            );

                            return (
                                <section
                                    className="file-group"
                                    key={group.id}
                                >
                                    <button
                                        type="button"
                                        className="file-group-header"
                                        onClick={() => toggleGroup(group.id)}
                                        onContextMenu={(event) =>
                                            openGroupMenu(event, group.id)
                                        }
                                        aria-expanded={!collapsed}
                                    >
                                        <span className="file-group-name">
                                            {group.name}
                                        </span>

                                        <span
                                            className={`file-group-chevron ${
                                                collapsed ? "collapsed" : ""
                                            }`}
                                        >
                                            ⌄
                                        </span>
                                    </button>

                                    {!collapsed && (
                                        <div>
                                            {group.documents.map((document) => (
                                                <FileItem
                                                    key={document.id}
                                                    document={document}
                                                    selected={selectedIds.includes(
                                                        document.id
                                                    )}
                                                    disabled={
                                                        selectionDisabled ||
                                                        actionLoading
                                                    }
                                                    onToggle={onToggleDocument}
                                                    onContextMenu={
                                                        openDocumentMenu
                                                    }
                                                />
                                            ))}

                                            {group.documents.length === 0 && (
                                                <p className="file-empty-group">
                                                    No files in this group
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </section>
                            );
                        })}

                        <section className="file-group file-group--ungrouped">
                            <div className="file-group-header file-group-header--static">
                                <span>Ungrouped</span>
                            </div>

                            {ungroupedDocuments.map((document) => (
                                <FileItem
                                    key={document.id}
                                    document={document}
                                    selected={selectedIds.includes(
                                        document.id
                                    )}
                                    disabled={
                                        selectionDisabled || actionLoading
                                    }
                                    onToggle={onToggleDocument}
                                    onContextMenu={openDocumentMenu}
                                />
                            ))}

                            {ungroupedDocuments.length === 0 && (
                                <p className="file-empty-group">
                                    No ungrouped files
                                </p>
                            )}
                        </section>
                    </>
                )}
            </div>

            {contextMenu && (
                <>
                    <button
                        type="button"
                        className="context-menu-backdrop"
                        aria-label="Close context menu"
                        onClick={() => setContextMenu(null)}
                    />

                    <div
                        className="file-context-menu"
                        style={menuPosition}
                        onContextMenu={(event) => event.preventDefault()}
                    >
                        {contextMenu.type === "document" && activeDocument && (
                            <>
                                <div className="context-menu-heading">
                                    {activeDocument.filename}
                                </div>

                                <div className="context-menu-section">
                                    <span className="context-menu-label">
                                        Add to group
                                    </span>

                                    {groups.map((group) => {
                                        const alreadyInGroup =
                                            group.documents.some(
                                                (document) =>
                                                    document.id ===
                                                    activeDocument.id
                                            );

                                        return (
                                            <button
                                                type="button"
                                                className="context-menu-item"
                                                key={group.id}
                                                disabled={
                                                    actionLoading ||
                                                    alreadyInGroup
                                                }
                                                onClick={() =>
                                                    void handleAddToGroup(group.id)
                                                }
                                            >
                                                <span>{group.name}</span>
                                                {alreadyInGroup && (
                                                    <span>Added</span>
                                                )}
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        className="context-menu-item context-menu-create"
                                        disabled={actionLoading}
                                        onClick={() =>
                                            openCreateGroupModal(
                                                activeDocument.id
                                            )
                                        }
                                    >
                                        <span>＋ Create new group</span>
                                    </button>
                                </div>

                                <div className="context-menu-divider" />

                                <div className="context-menu-section">
                                    <span className="context-menu-label">
                                        Remove from group
                                    </span>

                                    {documentGroups.map((group) => (
                                        <button
                                            type="button"
                                            className="context-menu-item"
                                            key={group.id}
                                            disabled={actionLoading}
                                            onClick={() =>
                                                void handleRemoveFromGroup(
                                                    group.id
                                                )
                                            }
                                        >
                                            {group.name}
                                        </button>
                                    ))}

                                    {documentGroups.length === 0 && (
                                        <div className="context-menu-empty">
                                            File is not in a group
                                        </div>
                                    )}
                                </div>

                                <div className="context-menu-divider" />

                                <button
                                    type="button"
                                    className="context-menu-item context-menu-delete"
                                    disabled={actionLoading}
                                    onClick={() => void handleDeleteDocument()}
                                >
                                    {actionLoading
                                        ? "Please wait..."
                                        : "Delete file"}
                                </button>
                            </>
                        )}

                        {contextMenu.type === "group" && (
                            <>
                                <div className="context-menu-heading">
                                    Group actions
                                </div>

                                <button
                                    type="button"
                                    className="context-menu-item"
                                    disabled={actionLoading}
                                    onClick={() => {
                                        const group = groups.find(
                                            (item) =>
                                                item.id === contextMenu.groupId
                                        );

                                        if (group) {
                                            openRenameGroupModal(group);
                                        }
                                    }}
                                >
                                    Rename group
                                </button>

                                <button
                                    type="button"
                                    className="context-menu-item context-menu-delete"
                                    disabled={actionLoading}
                                    onClick={() => void handleDeleteGroup()}
                                >
                                    Delete group
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {groupModal && (
                <div
                    className="group-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setGroupModal(null);
                        }
                    }}
                >
                    <form
                        className="group-modal"
                        onSubmit={handleGroupModalSubmit}
                    >
                        <h3>
                            {groupModal.mode === "create"
                                ? "Create group"
                                : "Rename group"}
                        </h3>

                        <label
                            className="group-modal-label"
                            htmlFor="group-name"
                        >
                            Group name
                        </label>

                        <input
                            id="group-name"
                            className="group-modal-input"
                            value={groupName}
                            onChange={(event) =>
                                setGroupName(event.target.value)
                            }
                            placeholder="Enter group name"
                            maxLength={100}
                            autoFocus
                            disabled={actionLoading}
                        />

                        <div className="group-modal-actions">
                            <button
                                type="button"
                                className="group-modal-cancel"
                                onClick={() => setGroupModal(null)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="group-modal-submit"
                                disabled={
                                    actionLoading || !groupName.trim()
                                }
                            >
                                {actionLoading
                                    ? "Saving..."
                                    : groupModal.mode === "create"
                                      ? "Create"
                                      : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </aside>
    );
}
