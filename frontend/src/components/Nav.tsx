import { useAuth } from "../context/AuthContext";

type NavProps = {
    onToggleFiles: () => void;
    onToggleChats: () => void;
    mobilePanel: "files" | "chats" | null;
};

export default function Navbar({onToggleFiles, onToggleChats, mobilePanel,}: NavProps) {
    const { user, logout } = useAuth();

    return (
        <nav>
            <div className="nav__container">
                <div className="nav__container__main">
                    <div className="nav__container__title">
                        <img src="/rai-logo.png" alt="" />
                        <h3>ResearchAI</h3>
                    </div>

                    <div className="nav__container__options">
                        <button
                            className={`options-files${mobilePanel === "files" ? " is-active" : ""}`}
                            onClick={onToggleFiles}
                            type="button"
                            aria-label={mobilePanel === "files" ? "Close files panel" : "Show files panel"}
                        >
                            <img src="/file-icon.png" alt="" />
                            <p>Files</p>
                        </button>

                        <button
                            className={`options-chats${mobilePanel === "chats" ? " is-active" : ""}`}
                            onClick={onToggleChats}
                            type="button"
                            aria-label={mobilePanel === "chats" ? "Close chats panel" : "Show chats panel"}
                        >
                            <img src="/chat-icon.png" alt="" />
                            <p>Chats</p>
                        </button>
                    </div>
                </div>

                <div className="nav__container__user">
                    <div className="nav__container__info">
                        <div className="info-email">
                            <p>{user?.email}</p>
                        </div>

                        <button
                            className="logout-btn"
                            onClick={logout}
                            type="button"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}