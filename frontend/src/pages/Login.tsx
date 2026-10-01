import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { loginUser, getCurrentUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        try {
            const tokens = await loginUser({email, password});

            localStorage.setItem("accessToken", tokens.access_token);
            localStorage.setItem("refreshToken", tokens.refresh_token);

            const user = await getCurrentUser();

            login(user, tokens.access_token, tokens.refresh_token);

            navigate("/");
        } catch (error: any) {
            setError(error.response?.data?.detail || "Login failed");
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>
                {error && (<p>{error}</p>)}
                <button type="submit">Login</button>
            </form>

            <p>
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
            </p>
        </div>
    );
}