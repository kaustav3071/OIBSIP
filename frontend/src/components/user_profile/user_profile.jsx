import React from "react";
import "./user_profile.css";
import axios from "axios";
import { useState, useEffect } from "react";

const UserProfile = () => {
    const url =  import.meta.env.VITE_API_URL; // Base URL for API requests
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        role: "",
        verified: "",
    });
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token"); // Get the token from localStorage
                if (!token) {
                    console.error("No token found");
                    return;
                }
                const response = await axios.get(`${url}/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const { name, email, role, address, isVerified } = response.data.user;
                setUserData((prevData) => ({
                    ...prevData,
                    name: name || "", 
                    email: email || "", 
                    role: role || "",
                    address: address || "",
                    verified: isVerified ? "Verified" : "Not Verified",
                }));
            
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to fetch user data.");
            }
        };

        fetchUserData();
    }, []);


    return (
        <div className="user-profile-container">
          <h1>{userData.name}'s Profile</h1>
          <form>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={userData.name}
              readOnly
            />
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={userData.email}
              readOnly
            />
            <label htmlFor="role">Role:</label>
            <input
              type="text"
              id="role"
              name="role"
              required
              value={userData.role}
              readOnly
            />
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              required
              value={userData.address}
              readOnly
            />
            <label htmlFor="verified">Verified Status:</label>
            <input
              type="text"
              id="verified"
              name="verified"
              required
              value={userData.verified}
              readOnly
            />
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default UserProfile;
