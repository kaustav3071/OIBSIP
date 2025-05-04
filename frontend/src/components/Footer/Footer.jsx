import React from "react";
import "./Footer.css";


const Footer = () => {
    return (
    <div className="footer">
        <div className="footer-contents">
            {/* Contact Info */}
            <div className="footer-section">
            <h2>Contact Us</h2>
            <p><a href="mailto:pizzaCraft17@gmail.com">pizzaCraft17@gmail.com</a></p>
            <p><a href="tel:+1234567890">+1 234 567 890</a></p>
            <p>123 Pizza St, Food City, USA</p>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
            <h2>Quick Links</h2>
            <p><a href="/">Home</a></p>
            <p><a href="/menu">Menu</a></p>
            <p><a href="/contact">Contact</a></p>
            </div>

            {/* Social Media */}
            <div className="footer-section">
            <h2>Follow Us</h2>
            <ul className="social-media-links">
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">Facebook</a></li>
            </ul>
            <p>&copy; 2025 PizzaCraft. All rights reserved.</p>
            </div>
        </div>
    </div>

    );
}

export default Footer;