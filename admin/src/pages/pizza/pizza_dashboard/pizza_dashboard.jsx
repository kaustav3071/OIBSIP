import React from "react";
import "./pizza_dashboard.css"; // Import the CSS file

const PizzaDashboard = () => {
    return (
        <div className="pizza-dashboard">
            {/* Left Section: Pizza Image */}
            <div className="pizza-image">
                <img
                    src="https://via.placeholder.com/300" // Replace with your pizza image URL
                    alt="Pizza"
                />
            </div>

            {/* Right Section: Options */}
            <div className="pizza-options">
                <h2 className="options-title">Pizza Options</h2>
                <div className="options-list">
                    <button className="option-button">Add Pizza</button>
                    <button className="option-button">Get All Pizzas</button>
                    <button className="option-button">Delete Pizza</button>
                    <button className="option-button">Update Pizza</button>
                </div>
            </div>
        </div>
    );
};

export default PizzaDashboard;