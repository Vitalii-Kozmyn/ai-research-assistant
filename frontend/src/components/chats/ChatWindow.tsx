
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
} from "react";

import {
    getChatMessages,
    sendChatMessage,
    type Chat,
    type Message,
    type MessageSource,
} from "../../services/chatsService";

import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

interface ChatWindowProps {
    chat: Chat | null;
    activeFilesCount: number;
    onChatUpdated: (chat: Chat) => void;
}


interface MessageWithSources {
    message: Message;
    sources: MessageSource[];
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

        if (response?.data?.detail) {
            return response.data.detail;
        }
    }

    return "Unable to complete the request. Please try again.";
}

export default function ChatWindow({
    chat,
    activeFilesCount,
    onChatUpdated,
}: ChatWindowProps) {
    const [messages, setMessages] = useState<MessageWithSources[]>([]);
    const [input, setInput] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const shouldScrollToBottomRef = useRef(true);
    const activeRequestRef = useRef(0);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
        messagesEndRef.current?.scrollIntoView({
            behavior,
            block: "end",
        });
    }, []);

    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;

        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        shouldScrollToBottomRef.current = distanceFromBottom < 120;
    }, []);

    useEffect(() => {
        const requestId = ++activeRequestRef.current;

        setMessages([]);
        setInput("");
        setError("");
        setSending(false);
        shouldScrollToBottomRef.current = true;

        if (!chat) {
            setLoadingMessages(false);
            return;
        }

        setLoadingMessages(true);

        getChatMessages(chat.id)
            .then((result) => {
                if (activeRequestRef.current !== requestId) return;

                setMessages(
                    Array.isArray(result)
                        ? result
                            .filter(
                                (message): message is Message =>
                                    message != null &&
                                    message.id != null &&
                                    typeof message.content === "string"
                            )
                            .map((message) => ({
                                message,
                                sources: [],
                            }))
                        : []
                );

                shouldScrollToBottomRef.current = true;
            })
            .catch((err: unknown) => {
                if (activeRequestRef.current !== requestId) return;
                setError(getErrorMessage(err));
            })
            .finally(() => {
                if (activeRequestRef.current !== requestId) return;
                setLoadingMessages(false);
            });

        return () => {
            if (activeRequestRef.current === requestId) {
                activeRequestRef.current++;
            }
        };
    }, [chat?.id]);

    useEffect(() => {
        if (shouldScrollToBottomRef.current) {
            scrollToBottom("auto");
        }
    }, [messages, sending, loadingMessages, scrollToBottom]);

    async function handleSend(event?: FormEvent) {
        event?.preventDefault();

        const content = input.trim();

        if (!chat || !content || sending) return;

        setError("");
        setSending(true);
        shouldScrollToBottomRef.current = true;
        setInput("");

        const optimisticMessage: Message = {
            id: -Date.now(),
            chat_id: chat.id,
            role: "user",
            content,
            created_at: new Date().toISOString(),
        };

        setMessages((current) => [
            ...current,
            { message: optimisticMessage, sources: [] },
        ]);

        try {
           const result = await sendChatMessage(chat.id, content);

            if (typeof result.answer !== "string") {
                throw new Error("The server did not return an answer.");
            }

            const assistantMessage: Message = {
                id: Date.now(),
                chat_id: chat.id,
                role: "assistant",
                content: result.answer,
                created_at: new Date().toISOString(),
            };

            const sources: MessageSource[] = (result.sources ?? []).map(
                (source) => ({
                    ...source,
                    filename: source.document,
                })
            );

            setMessages((current) => [
                ...current,
                {
                    message: assistantMessage,
                    sources,
                },
            ]);

            onChatUpdated({
                ...chat,
                updated_at: assistantMessage.created_at,
                title: chat.title || content.slice(0, 60),
            });
        } catch (err) {
            setError(getErrorMessage(err));

            // Keep the user's text visible and allow retrying it.
            setInput(content);
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    }

    if (!chat) {
        return (
            <section className="chat-window chat-window--empty">
                <div className="chat-welcome">
                    <div className="chat-welcome-icon">✳</div>
                    <h2>Your research workspace</h2>
                    <p>
                        Select a chat or create a new one to start asking
                        questions about your documents.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="chat-window">
            <header className="chat-window-header">
                <div className="chat-window-heading">
                    <h1>{chat.title || "New chat"}</h1>
                    <p>
                        {messages.length}{" "}
                        {messages.length === 1 ? "message" : "messages"}
                    </p>
                </div>

                <div className="chat-active-badge">
                    <span />
                    {activeFilesCount}{" "}
                    {activeFilesCount === 1 ? "file active" : "files active"}
                </div>
            </header>

            <div
                className="chat-messages"
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                {loadingMessages ? (
                    <div className="chat-loading-state">
                        Loading conversation...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty-conversation">
                        <h2>What would you like to research?</h2>
                        <p>
                            Ask a question about the documents connected to
                            this chat.
                        </p>
                    </div>
                ) : (
                    messages.map(({ message, sources }) => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                            sources={sources}
                        />
                    ))
                )}

                {sending && <TypingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-composer-area">
                {error && (
                    <div className="chat-error" role="alert">
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

                <form
                    className="chat-composer"
                    onSubmit={handleSend}
                >
                    <textarea
                        ref={textareaRef}
                        className="chat-input"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your documents..."
                        rows={1}
                        disabled={sending || loadingMessages}
                        aria-label="Message"
                    />

                    <button
                        type="submit"
                        className="chat-send-button"
                        disabled={
                            !input.trim() ||
                            sending ||
                            loadingMessages
                        }
                        aria-label="Send message"
                        title="Send message"
                    >
                        ➤
                    </button>
                </form>

                <p className="chat-composer-hint">
                    Enter · send　·　Shift+Enter · new line
                </p>
            </div>
        </section>
    );
}
