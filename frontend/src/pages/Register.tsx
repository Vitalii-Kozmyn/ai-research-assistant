import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await registerUser({ email, password });

            setSuccess("Registration successful. You can now log in.");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        }  catch (error: any) {
            const detail = error.response?.data?.detail;

            if (Array.isArray(detail)) {
                setError(
                    detail.map((item: any) => item.msg).join(". ")
                );
            } else if (typeof detail === "string") {
                setError(detail);
            } else {
                setError("Registration failed");
            }
        }
    };

    return (
        <section className="register-section">
            <div className="register__container">
                <div className="logo-title">
                    <img src="../public/rai-logo.png" alt="" />
                    <h3>ResearchAI</h3>
                </div>

                <div className="main__title">
                    <h2>Create account</h2>
                    <p>Start your AI research journey</p>
                </div>

                <form onSubmit={handleSubmit} className="auth__form">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    {error && <p>{error}</p>}
                    {success && <p>{success}</p>}

                    <button type="submit">Create account</button>

                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Login</Link>
                    </p>
                </form>
            </div>
        </section>
    );
}
