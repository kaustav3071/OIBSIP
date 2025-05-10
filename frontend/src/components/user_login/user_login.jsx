import "./user_login.css";
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://pizzacraft-backend.vercel.app/login", loginData);
            if (response.status === 200) {
                toast.success("Login successful!");
                localStorage.setItem("token", response.data.token); // Save token in localStorage
                navigate("/"); // Redirect to homepage
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Login failed! Please try again.");
        }
    };

    return (
        <div className="user_login">
            <h1>User Login</h1>
            <form className="user_login_form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={loginData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={loginData.password}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Login</button>
                <p>
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </form>
        </div>
    );
};

export default UserLogin;