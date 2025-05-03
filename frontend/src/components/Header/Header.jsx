import React from "react";
import "./Header.css";
import logo from "../../assets/logo.png"; // Temporary logo (replace with your actual logo)

const Header = () => {
    return (
        <div className="header">
            <div className="header-contents">
                <h2>Order Your Favourite Pizza Here</h2>
                <p>Welcome to PizzaCraft, where we serve the best pizzas in town!</p>
                <button>View Menu</button>
            </div>
        </div>
    );

};

export default Header;