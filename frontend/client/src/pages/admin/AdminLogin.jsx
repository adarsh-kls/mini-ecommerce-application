import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/authApi";
import { useAuth } from "../../context/auth";
import "../../styles/login.css";

function AdminLogin() {
    const navigate = useNavigate();
    const { login, logout } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await API.post("/auth/login", formData);
            const loggedInUser = response.data.user;

            if (loggedInUser.role !== "admin") {
                alert("Unauthorized Entry. Admin credentials required.");
                logout();
                return;
            }

            login(response.data.token, loggedInUser);
            alert("Admin Login Successful");
            navigate("/admin");

        } catch (error) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Admin Portal Access</h1>
                    <p>Enter administrative credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="email">Admin Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="admin@example.com"
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
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-auth">Access Dashboard</button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
