import React from "react";
import "./user_navbar.css";
import logo from "../../assets/logo.png"; // Temporary logo (replace with your actual logo)
import { assets } from "../../assets/assets";


const UserNavbar = () => {
  return (
    <nav className="user-navbar">
      <div className="user-navbar__container">
        {/* Logo Section */}
        <div className="user-navbar__logo">
          <img src={logo} alt="Website Logo" />
          <span>PizzaCraft</span>
        </div>

        {/* Navigation Links */}
        <div className="user-navbar__links">
          <a href="/">Home</a>
          <a href="/contact">Contact</a>
          <a href="/order">Orders</a>
          <a href="/menu">Menu</a>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
          <div className="user-navbar__cart-icon">
            <a href="/cart">
            <img src={assets.shopping_cart} alt="Shopping Cart" className="shopping-cart-icon" />
            <div className="dot"></div>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;