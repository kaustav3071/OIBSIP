import React, { useState } from "react";
import "./admin_login.css"; // Import the CSS file for styling
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/user/login", credentials);
      if (response.status === 200 && response.data.user.role === "admin") {
        toast.success("Login successful!");
        localStorage.setItem("token", response.data.token); // Save token in localStorage
        navigate("/admin"); // Redirect to Pizza Dashboard
      } else {
        toast.error("Access denied! Only admins can log in.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-login">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;