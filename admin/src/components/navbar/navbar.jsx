import React, { useState } from "react";
import "./navbar.css"; // Assuming you have a CSS file for styling
import { assets } from "../../assets/assets"; // Adjust the path as necessary  

const Navbar = () => {
    const [activeLink, setActiveLink] = useState("#dashboard"); // Default active link

    const handleLinkClick = (link) => {
        setActiveLink(link); // Update the active link
    };

    return (
        <nav className="navbar">
            <img src={assets.logo} alt="Logo" className="logo" />
            <img src={assets.profile} alt="Profile" className="profile" />
            <h1>Kaustav Das</h1>
            <ul className="nav-links">
                <li>
                    <a
                        href="#dashboard"
                        className={`nav-link ${activeLink === "#dashboard" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#dashboard")}
                    >
                        Dashboard
                    </a>
                </li>
                <li>
                    <a
                        href="#users"
                        className={`nav-link ${activeLink === "#users" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#users")}
                    >
                        Users
                    </a>
                </li>
                <li>
                    <a
                        href="#settings"
                        className={`nav-link ${activeLink === "#settings" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#settings")}
                    >
                        Settings
                    </a>
                </li>
                <li>
                    <a
                        href="#notifications"
                        className={`nav-link ${activeLink === "#notifications" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#notifications")}
                    >
                        Notifications
                    </a>
                </li>
                <li>
                    <a
                        href="#orders"
                        className={`nav-link ${activeLink === "#orders" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#orders")}
                    >
                        Orders
                    </a>
                </li>
                <li>
                    <a
                        href="#inventory"
                        className={`nav-link ${activeLink === "#inventory" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#inventory")}
                    >
                        Inventory
                    </a>
                </li>
                <li>
                    <a
                        href="#pizzas"
                        className={`nav-link ${activeLink === "#pizzas" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#pizzas")}
                    >
                        Pizzas
                    </a>
                </li>
                <li>
                    <a
                        href="#logout"
                        className={`nav-link ${activeLink === "#logout" ? "active" : ""}`}
                        onClick={() => handleLinkClick("#logout")}
                    >
                        Logout
                    </a>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;