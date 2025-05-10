import React, { useEffect, useState } from "react";
import "./user_dashboard.css"; // Import the CSS file
import axios from "axios";
import { toast } from "react-toastify"; // Import toast for notifications 
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://pizzacraft-backend.onrender.com/user/allUsers");
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return; // Exit if the user cancels the confirmation
    }
  
    try {
      const response = await axios.delete(`https://pizzacraft-backend.onrender.com/user/delete/${id}`);
  
      if (response.status === 200) {
        toast.success("User deleted successfully");
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id)); // Remove from frontend
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "An error occurred while deleting the user");
    }
  };

  const handleUpdate = (id) => {
    navigate(`/admin/user/update/${id}`); // Navigate to update page
  }
  
  return (
    <div className="user-dashboard">
      <h1>Manage User Dashboard</h1>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="edit-btn"
                    onClick={() => navigate(`/admin/user/user/${user._id}`)} // Navigate to update page
                    >
                      Edit</button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
