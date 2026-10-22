
export default function TypingIndicator() {
    return (
        <div
            className="typing-indicator"
            role="status"
            aria-label="AI is generating a response"
        >
            <span />
            <span />
            <span />
            <span className="typing-label">ResearchAI is thinking...</span>
        </div>
    );
}
