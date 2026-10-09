import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/authApi";
import { useAuth } from "../context/auth";
import "../styles/login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await API.post("/auth/login", formData);
            login(response.data.token, response.data.user);
            alert(response.data.message);
            navigate("/home");

        } catch (error) {
            alert(error.response?.data?.message || "login failed");
        }
    };


    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Enter your details to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-auth">Sign In</button>
                    
                    <div className="auth-footer">
                        <p>Don't have an account? <span onClick={() => navigate('/register')} className="auth-link">Sign up</span></p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
