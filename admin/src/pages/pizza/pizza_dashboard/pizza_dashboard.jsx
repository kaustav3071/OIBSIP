import React from "react";
import "./pizza_dashboard.css"; // Import the CSS file
import { assets } from "../../../assets/assets"; // Import assets
import { Link } from "react-router-dom"; // Import Link for navigation

const PizzaDashboard = () => {
    return (
        <div className="pizza-dashboard">
            {/* Left Section: Pizza Image */}
            <div className="pizza-image">
                <img
                    src={assets.pizza_image || "https://via.placeholder.com/350"} // Replace with your pizza image URL
                    alt="Pizza"
                />
            </div>

            {/* Right Section: Options */}
            <div className="pizza-options">
                <h2 className="options-title">Manage Your Pizzas</h2>
                <div className="options-list">
                    <Link to="/pizza_dashboard/add" className="option-item">
                        Add Pizza
                    </Link>
                    <Link to="/pizza_dashboard/get" className="option-item">
                        View Pizzas
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PizzaDashboard;