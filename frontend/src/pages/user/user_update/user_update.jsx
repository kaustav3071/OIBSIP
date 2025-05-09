import React from "react";
import { useState, useEffect } from "react";
import "./user_update.css"; // Import the CSS file for styling
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const UserUpdate = () => {
    const { id } = useParams(); // Get the user ID from the URL
    const navigate = useNavigate(); // For navigation after update

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const url = "http://localhost:4000/user";

    // Fetch user details by ID
    const fetchUserDetails = async () => {
        try {
          const response = await axios.get(`${url}/user/${id}`); // Fetch user by ID
          if (response.status === 200 && response.data) {
            setData({
              name: response.data.name,
              email: response.data.email,
              password: response.data.password,
              role: response.data.role,
              verified: response.data.isVerified,
            });
          } else {
            toast.error("User not found!");
            navigate("/admin/users");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          toast.error("Error fetching user details");
          navigate("/admin/users");
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${url}/updateUser/${id}`, data);
            toast.success("User updated successfully!");
            navigate("/admin/users");
        } catch (error) {
            console.error(error);
            toast.error("Error updating user");
        }
    };

    return (
        <div className="update-user-container">
            <h2>Update User</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <input name="role" value={data.role} onChange={handleChange} required readOnly
                    />
                </div>
                <div className="form-group">
                    <label>Verified:</label>
                    <input name="verified" value={data.verified} onChange={handleChange} required readOnly
                    />
                </div>              
                <button type="submit" className="btn-submit">Update</button>
            </form>
        </div>
    );
}

export default UserUpdate;