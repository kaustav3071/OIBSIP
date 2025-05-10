import React, { useState, useEffect } from "react";
import "./inventory.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState(null); // Changed initial state to null
  const [error, setError] = useState(null); // State to hold error messages
  const navigate = useNavigate();

  // Fetch inventory data and trigger low stock email
  const fetchInventory = async () => {
    try {
      // Trigger low stock email
      const response2 = await axios.post("https://pizzacraft-backend.onrender.com/inventory/send-low-stock-email");
      if (response2.status === 200) {
        const { lowStockItems } = response2.data;
        if (lowStockItems && Object.values(lowStockItems).some(category => category.length > 0)) {
          toast.success("Low stock email sent to admin!");
        } else {
          toast.info("No low stock items detected.");
        }
      } else {
        toast.error("Failed to send low stock email.");
      }

      // Fetch inventory data
      const response = await axios.get("https://pizzacraft-backend.onrender.com/inventory");
      if (response.status === 200) {
        setInventory(response.data);
        toast.success("Inventory data fetched successfully!");
      } else {
        setError("Failed to fetch inventory data.");
        toast.error("Failed to fetch inventory data.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching inventory data.");
      toast.error("An error occurred while fetching inventory data.");
    }
  };

  // Fetch inventory when the component mounts
  useEffect(() => {
    fetchInventory();
  }, []);

  // Navigate to the update inventory page
  const handleUpdateInventory = () => {
    navigate("/admin/inventory/update");
  };

  // Helper function to render a category (bases, sauces, cheeses, veggies)
  const renderCategory = (categoryName, items) => {
    if (!items || Object.keys(items).length === 0) {
      return (
        <div className="category-section">
          <h2>{categoryName}</h2>
          <p>No items available.</p>
        </div>
      );
    }

    return (
      <div className="category-section">
        <h2>{categoryName}</h2>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price (INR)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(items).map(([name, details]) => (
              <tr key={name} className={details.qty < 20 ? "low-stock" : ""}>
                <td>{name}</td>
                <td>{details.qty}</td>
                <td>₹{details.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Inventory Dashboard</h1>
        <button className="update-btn" onClick={handleUpdateInventory}>
          Update Inventory
        </button>
      </div>
      <div className="inventory-content">
        {error ? (
          <p className="error-message">Error: {error}</p>
        ) : !inventory ? (
          <p>Loading inventory...</p>
        ) : (
          <>
            {renderCategory("Bases", inventory.bases)}
            {renderCategory("Sauces", inventory.sauces)}
            {renderCategory("Cheeses", inventory.cheeses)}
            {renderCategory("Veggies", inventory.veggies)}
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;