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
        <div>
            <h1>Register</h1>
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
                {success && (<p>{success}</p>)}
                <button type="submit"> Register</button>
            </form>

            <p>
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>
        </div>
    );
}