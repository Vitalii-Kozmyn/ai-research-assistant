import { useAuth } from "../context/AuthContext";

type NavProps = {
    onToggleFiles: () => void;
    onToggleChats: () => void;
};

export default function Navbar({onToggleFiles, onToggleChats}: NavProps) {
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
                            className="options-files"
                            onClick={onToggleFiles}
                            type="button"
                        >
                            <img src="/file-icon.png" alt="" />
                            <p>Files</p>
                        </button>

                        <button
                            className="options-chats"
                            onClick={onToggleChats}
                            type="button"
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