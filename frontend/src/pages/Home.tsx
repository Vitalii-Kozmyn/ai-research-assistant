import { useAuth } from "../context/AuthContext";

export default function Home() {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>AI Research Assistant</h1>

            <p>
                Logged in as: {user?.email}
            </p>

            <button onClick={logout}>
                Logout
            </button>
        </div>
    );
}