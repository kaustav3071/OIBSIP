import React, { useState, useEffect } from "react";
import "./user_navbar.css";
import logo from "../../assets/logo.png";
import { assets } from "../../assets/assets";

const UserNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("name");
      const email = localStorage.getItem("email");
      const userId = localStorage.getItem("user._id"); // Get userId from localStorage
      const cart = localStorage.getItem("cart"); // Get cart from localStorage
      console.log("Token:", token); // Debugging
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name"); // Remove name from localStorage
    localStorage.removeItem("email"); // Remove email from localStorage
    localStorage.removeItem("cart"); // Clear cart from localStorage
    localStorage.removeItem("user._id"); // Remove userId from localStorage
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <nav className="user-navbar">
      <div className="user-navbar__container">
        <div className="user-navbar__logo">
          <img src={logo} alt="Website Logo" />
          <span>PizzaCraft</span>
        </div>
        <div className="user-navbar__links">
          <a href="/">Home</a>
          <a href="/contact">Contact</a>
          <a href="/order">Orders</a>
          <a href="/menu">Menu</a>
          <a href="#app-download-container">Download App</a>
          <p></p>
          {isLoggedIn ? (
            <><a href="#" onClick={handleLogout}>
              Logout
            </a><a href="/profile">
                <img
                  src={assets.profile}
                  alt="User Icon"
                  className="user-icon" 
                  style ={{ width: "30px", height: "30px" }}
                  />
              </a></>
  
          ) : (
            <>
              <a href="/register">Register</a>
              <a href="/login">Login</a>
            </>
          )}
          <div className="user-navbar__cart-icon">
            <a href="/cart">
              <img
                src={assets.shopping_cart}
                alt="Shopping Cart"
                className="shopping-cart-icon"
              />
              <div className="dot"></div>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;