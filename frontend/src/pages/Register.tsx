import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { Link } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        try {
            await registerUser({email, password});
            setSuccess("Registration successful. You can now log in.");
            setTimeout(() => {navigate("/login");}, 1000);
        } catch (error: any) {
            setError(error.response?.data?.detail || "Registration failed");
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
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>
                    {error && (<p>{error}</p>)}
                    {success && (<p>{success}</p>)}
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