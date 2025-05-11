import "./user_register.css";
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserRegister = () => {
    const url = import.meta.env.VITE_API_URL; // Base URL for API requests
    const [userData, setUserData] = useState({ name: "", email: "", password: "", address: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/user/register`, userData);
            if (response.status === 201) {
                toast.success("Registration successful! Please verify your email.");
                localStorage.setItem("token", response.data.token); // Save token in localStorage
                navigate("/login"); // Redirect to Login page
            } else {
                toast.error("Registration failed! Please try again.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.message || "Registration failed! Please try again.");
        }
    };

    return (
        <div className="user_register">
            <h1>User Registration</h1>
            <form className="user_register_form" onSubmit={handleSubmit}>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={userData.name}
                    onChange={handleChange}
                />
                <br />
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={userData.email}
                    onChange={handleChange}
                />
                <br />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength="6"
                    value={userData.password}
                    onChange={handleChange}
                />
                <br />
                <br />
                <label htmlFor="address">Address:</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={userData.address}
                    onChange={handleChange}
                />
                <br />
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
};

export default UserRegister;
