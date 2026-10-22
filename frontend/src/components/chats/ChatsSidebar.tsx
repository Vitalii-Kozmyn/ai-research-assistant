
import { useCallback, useEffect, useState } from "react";

import {
    createChat,
    deleteChat,
    getChats,
    renameChat,
    type Chat,
} from "../../services/chatsService";

interface ChatsSidebarProps {
    activeChatId: number | null;
    refreshKey: number;
    documentIds: number[];
    onSelectChat: (chat: Chat) => void;
    onChatCreated: (chat: Chat) => void;
    onChatDeleted: (chatId: number) => void;
    onChatUpdated: (chat: Chat) => void;
}

function getErrorMessage(error: unknown): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: { data?: { detail?: string } };
            }
        ).response;

        if (response?.data?.detail) return response.data.detail;
    }

    return "Something went wrong. Please try again.";
}

function formatChatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const elapsed = Date.now() - date.getTime();

    if (elapsed < 60_000) return "Just now";
    if (elapsed < 3_600_000) {
        return `${Math.floor(elapsed / 60_000)}m ago`;
    }
    if (elapsed < 86_400_000) {
        return `${Math.floor(elapsed / 3_600_000)}h ago`;
    }
    if (elapsed < 172_800_000) return "Yesterday";

    return date.toLocaleDateString();
}

export default function ChatsSidebar({
    activeChatId,
    refreshKey,
    documentIds,
    onSelectChat,
    onChatCreated,
    onChatDeleted,
    onChatUpdated,
}: ChatsSidebarProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [editingChatId, setEditingChatId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const loadChats = useCallback(async () => {
        try {
            setError("");

            const result = await getChats();

            setChats(
                [...result].sort(
                    (a, b) =>
                        new Date(b.updated_at ?? b.created_at).getTime() -
                        new Date(a.updated_at ?? a.created_at).getTime()
                )
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadChats();
    }, [loadChats, refreshKey]);

    async function handleCreateChat() {
        setBusy(true);
        setError("");

        try {
            const chat = await createChat(documentIds);

            setChats((current) => [
                chat,
                ...current.filter((item) => item.id !== chat.id),
            ]);

            onChatCreated(chat);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    }

    async function handleRename(chat: Chat) {
        const title = editingTitle.trim();

        if (!title) {
            setError("Chat title cannot be empty.");
            return;
        }

        setBusy(true);
        setError("");

        try {
            const updated = await renameChat(chat.id, title);

            setChats((current) =>
                current.map((item) =>
                    item.id === updated.id ? updated : item
                )
            );

            setEditingChatId(null);
            onChatUpdated(updated);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete(chat: Chat) {
        if (
            !window.confirm(
                `Delete "${chat.title || "Untitled chat"}"? This cannot be undone.`
            )
        ) {
            return;
        }

        setBusy(true);
        setError("");

        try {
            await deleteChat(chat.id);

            setChats((current) =>
                current.filter((item) => item.id !== chat.id)
            );

            setEditingChatId(null);
            onChatDeleted(chat.id);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <aside className="chats-sidebar">
            <header className="chats-sidebar-header">
                <h2>Chats</h2>

                <button
                    type="button"
                    className="new-chat-button"
                    onClick={() => void handleCreateChat()}
                    disabled={busy}
                    aria-label="Create new chat"
                    title="New chat"
                >
                    +
                </button>
            </header>

            {error && (
                <div className="chat-sidebar-error" role="alert">
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

            <div className="chats-list">
                {loading ? (
                    <p className="chats-empty-state">Loading chats...</p>
                ) : chats.length === 0 ? (
                    <div className="chats-empty-state">
                        <p>No chats yet.</p>
                        <button
                            type="button"
                            onClick={() => void handleCreateChat()}
                            disabled={busy}
                        >
                            Start your first chat
                        </button>
                    </div>
                ) : (
                    chats.map((chat) => {
                        const active = chat.id === activeChatId;
                        const editing = chat.id === editingChatId;

                        return (
                            <article
                                key={chat.id}
                                className={`chat-list-item ${
                                    active ? "chat-list-item--active" : ""
                                }`}
                            >
                                {editing ? (
                                    <form
                                        className="chat-rename-form"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            void handleRename(chat);
                                        }}
                                    >
                                        <input
                                            autoFocus
                                            value={editingTitle}
                                            maxLength={200}
                                            disabled={busy}
                                            onChange={(event) =>
                                                setEditingTitle(event.target.value)
                                            }
                                        />

                                        <div className="chat-rename-actions">
                                            <button
                                                type="submit"
                                                disabled={busy || !editingTitle.trim()}
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingChatId(null)}
                                                disabled={busy}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className="chat-list-select"
                                            onClick={() => onSelectChat(chat)}
                                            title={chat.title ?? "Untitled chat"}
                                        >
                                            <span className="chat-list-title">
                                                {chat.title || "Untitled chat"}
                                            </span>

                                            <span className="chat-list-date">
                                                {formatChatDate(
                                                    chat.updated_at ?? chat.created_at
                                                )}
                                            </span>
                                        </button>

                                        <details className="chat-actions">
                                            <summary aria-label="Chat actions">
                                                ⋯
                                            </summary>

                                            <div className="chat-actions-menu">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingChatId(chat.id);
                                                        setEditingTitle(chat.title ?? "");
                                                    }}
                                                >
                                                    Rename
                                                </button>

                                                <button
                                                    type="button"
                                                    className="chat-action-delete"
                                                    disabled={busy}
                                                    onClick={() => void handleDelete(chat)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </details>
                                    </>
                                )}
                            </article>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
