
import { useRef, useState } from "react";

import Nav from "../components/Nav";
import FilesSidebar from "../components/FilesSidebar";
import ChatsSidebar from "../components/chats/ChatsSidebar";
import ChatWindow from "../components/chats/ChatWindow";

import {
    addDocumentToChat,
    getChatDocuments,
    removeDocumentFromChat,
    type Chat,
} from "../services/chatsService";

const MAX_SELECTED_FILES = 5;

export default function Home() {
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [selectedDocumentIds, setSelectedDocumentIds] = useState<number[]>([]);
    const [chatsRefreshKey, setChatsRefreshKey] = useState(0);
    const [selectionError, setSelectionError] = useState("");
    const [loadingChatDocuments, setLoadingChatDocuments] = useState(false);
    const [isFilesSidebarVisible, setIsFilesSidebarVisible] = useState(true);
    const [isChatsSidebarVisible, setIsChatsSidebarVisible] = useState(true);

    const selectionRequestRef = useRef(0);
    const documentActionRef = useRef(false);

    function handleToggleFilesSidebar() {
        setIsFilesSidebarVisible((visible) => !visible);
    }

    function handleToggleChatsSidebar() {
        setIsChatsSidebarVisible((visible) => !visible);
    }

    async function handleSelectChat(chat: Chat) {
        const requestId = ++selectionRequestRef.current;

        setActiveChat(chat);
        setSelectedDocumentIds([]);
        setSelectionError("");
        setLoadingChatDocuments(true);

        try {
            const documents = await getChatDocuments(chat.id);

            if (selectionRequestRef.current !== requestId) return;

            setSelectedDocumentIds(
                documents.map((document) => document.id)
            );
        } catch {
            if (selectionRequestRef.current !== requestId) return;

            setSelectionError(
                "Could not load documents for this chat."
            );
        } finally {
            if (selectionRequestRef.current === requestId) {
                setLoadingChatDocuments(false);
            }
        }
    }

    async function handleToggleDocument(documentId: number) {
        if (documentActionRef.current || loadingChatDocuments) return;

        setSelectionError("");

        const isSelected = selectedDocumentIds.includes(documentId);

        if (
            !isSelected &&
            selectedDocumentIds.length >= MAX_SELECTED_FILES
        ) {
            setSelectionError(
                `You can select up to ${MAX_SELECTED_FILES} files.`
            );
            return;
        }

        documentActionRef.current = true;

        try {
            if (activeChat) {
                if (isSelected) {
                    await removeDocumentFromChat(
                        activeChat.id,
                        documentId
                    );
                } else {
                    await addDocumentToChat(
                        activeChat.id,
                        documentId
                    );
                }
            }

            setSelectedDocumentIds((current) => {
                if (isSelected) {
                    return current.filter((id) => id !== documentId);
                }

                return current.includes(documentId)
                    ? current
                    : [...current, documentId];
            });
        } catch {
            setSelectionError(
                "Could not update this chat's documents. Please try again."
            );
        } finally {
            documentActionRef.current = false;
        }
    }

    function handleChatCreated(chat: Chat) {
        void handleSelectChat(chat);
        setChatsRefreshKey((key) => key + 1);
    }

    function handleChatDeleted(chatId: number) {
        if (activeChat?.id === chatId) {
            selectionRequestRef.current++;
            setActiveChat(null);
            setSelectedDocumentIds([]);
            setLoadingChatDocuments(false);
        }

        setChatsRefreshKey((key) => key + 1);
    }

    function handleChatUpdated(chat: Chat) {
        setActiveChat((current) =>
            current?.id === chat.id ? chat : current
        );

        setChatsRefreshKey((key) => key + 1);
    }

    return (
        <div className="home-page">
            <Nav onToggleFiles={handleToggleFilesSidebar} onToggleChats={handleToggleChatsSidebar}/>
            
            <main className="home-workspace">
                {isFilesSidebarVisible && (
                    <FilesSidebar
                        selectedIds={selectedDocumentIds}
                        onToggleDocument={handleToggleDocument}
                        selectionError={selectionError}
                        onClearSelectionError={() => setSelectionError("")}
                        selectionDisabled={loadingChatDocuments}
                    />
                )}

                {isChatsSidebarVisible && (
                    <ChatsSidebar
                        activeChatId={activeChat?.id ?? null}
                        refreshKey={chatsRefreshKey}
                        documentIds={selectedDocumentIds}
                        onSelectChat={handleSelectChat}
                        onChatCreated={handleChatCreated}
                        onChatDeleted={handleChatDeleted}
                        onChatUpdated={handleChatUpdated}
                    />
                )}

                <ChatWindow
                    chat={activeChat}
                    activeFilesCount={selectedDocumentIds.length}
                    onChatUpdated={handleChatUpdated}
                />
            </main>
        </div>
    );
}
