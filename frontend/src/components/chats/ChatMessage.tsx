import type {
    Message,
    MessageSource,
} from "../../services/chatsService";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
    message: Message;
    sources?: MessageSource[];
}

function formatTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ChatMessage({message, sources = [], }: ChatMessageProps) {
    const isUser = message.role.toLowerCase() === "user";

    return (
        <article
            className={`message-row ${
                isUser
                    ? "message-row--user"
                    : "message-row--assistant"
            }`}
        >
            {!isUser && (
                <div className="assistant-label">
                    <span className="assistant-status-dot" />
                    ResearchAI
                </div>
            )}

            <div className="message-bubble">
                <div className="message-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>
            </div>

            {!isUser && sources.length > 0 && (
                <div className="message-sources">
                    <div className="message-sources-heading">
                        SOURCES ({sources.length})
                    </div>

                    <div className="message-sources-list">
                        {sources.map((source, index) => (
                            <div
                                className="message-source"
                                key={`${source.document}-${source.page}-${index}`}
                                title={source.document}
                            >
                                <span aria-hidden="true">▤</span>

                                <div className="message-source-info">
                                    <span className="message-source-name">
                                        {source.document}
                                    </span>

                                    <span className="message-source-page">
                                        Page {source.page}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <time className="message-time">
                {formatTime(message.created_at)}
            </time>
        </article>
    );
}