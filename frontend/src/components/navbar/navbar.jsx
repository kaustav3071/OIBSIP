import React, { useState } from "react";
import "./navbar.css"; // Assuming you have a CSS file for styling
import { assets } from "../../assets/assets"; // Adjust the path as necessary  
import { Link } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
    const [activeLink, setActiveLink] = useState("#dashboard"); // Default active link

    const handleLinkClick = (link) => {
        setActiveLink(link); // Update the active link
    };

    const handleLogout = () => {
        try{
            const token = localStorage.getItem("token"); // Get the token from local storage
            if (token) {
                axios.post("https://pizzacraft-backend.onrender.com/user/logout", {}, {
                    headers: {
                        Authorization: `Bearer ${token}` // Include the token in the request header
                    }
                });
            }
            localStorage.removeItem("token"); // Remove the token from local storage
            localStorage.removeItem("user"); // Remove the user data from local storage
        }
        catch (error) {
            console.error("Logout failed:", error); // Log any errors that occur during logout
        }  
    }
    return (
        <nav className="navbar">
            <img src={assets.logo} alt="Logo" className="logo" />
            <img src={assets.profile} alt="Profile" className="profile" />
            <h1>Kaustav Das Admin</h1>
            <ul className="nav-links">
                <li>
                    <Link
                        to = "/admin"
                        className={`nav-link ${activeLink === "#dashboard" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#dashboard")}
                    >
                        Admin Dashboard
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/users"
                        className={`nav-link ${activeLink === "#users" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#users")}
                    >
                        Users
                    </Link>
                </li>
                <li>
                    <Link
                        to="/admin/orders"
                        className={`nav-link ${activeLink === "#orders" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#orders")}
                    >
                        Orders
                    </Link>
                </li>
                <li>
                    <Link   
                        to="/admin/inventory"
                        className={`nav-link ${activeLink === "#inventory" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#inventory")}
                    >
                        Inventory
                    </Link>
                </li>
                <li>
                <Link to="/admin/pizza_dashboard" className={`nav-link ${activeLink === "#pizzas" ? "active" : ""}`} onClick={() => handleLinkClick("#pizzas")}>
                    Pizzas
                </Link>
                </li>
                <li>
                    <Link
                        className={`nav-link ${activeLink === "#logout" ? "active" : ""}`}
                        onClick={() => handleLogout()}
                    >
                        Logout
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;