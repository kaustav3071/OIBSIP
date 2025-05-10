import React, { useState, useEffect } from "react";
import "./update_inventory.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UpdateInventory = () => {
  const [inventory, setInventory] = useState(null); // Store the fetched inventory data
  const [error, setError] = useState(null); // Store error messages
  const [updatedInventory, setUpdatedInventory] = useState({ // Track the updated values
    bases: {},
    sauces: {},
    cheeses: {},
    veggies: {}
  });
  const navigate = useNavigate();

  // Fetch inventory data from the backend
  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:4000/inventory");
      if (response.status === 200) {
        setInventory(response.data);
        // Initialize updatedInventory with the fetched data
        setUpdatedInventory({
          bases: response.data.bases || {},
          sauces: response.data.sauces || {},
          cheeses: response.data.cheeses || {},
          veggies: response.data.veggies || {}
        });
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

  // Handle input changes for quantity and price
  const handleInputChange = (category, itemName, field, value) => {
    setUpdatedInventory((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category][itemName],
          [field]: Number(value) // Convert to number
        }
      }
    }));
  };

  // Submit the updated inventory to the backend
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("http://localhost:4000/inventory", updatedInventory);
      if (response.status === 200) {
        toast.success("Inventory updated successfully!");
        // Refresh the inventory data
        await fetchInventory();
        // Optionally navigate back to the dashboard
        navigate("/admin/inventory");
      } else {
        toast.error("Failed to update inventory.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating inventory.");
    }
  };

  // Helper function to render a category (bases, sauces, cheeses, veggies)
  const renderCategory = (categoryName, items, categoryKey) => {
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
                <td>
                  <input
                    type="number"
                    value={updatedInventory[categoryKey][name]?.qty || details.qty}
                    onChange={(e) => handleInputChange(categoryKey, name, "qty", e.target.value)}
                    className="editable-input"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={updatedInventory[categoryKey][name]?.price || details.price}
                    onChange={(e) => handleInputChange(categoryKey, name, "price", e.target.value)}
                    className="editable-input"
                    min="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="update-inventory-container">
      <div className="dashboard-header">
        <h1>Update Inventory</h1>
        <button className="update-btn" onClick={handleUpdateSubmit}>
          Save Changes
        </button>
      </div>
      <div className="inventory-content">
        {error ? (
          <p className="error-message">Error: {error}</p>
        ) : !inventory ? (
          <p>Loading inventory...</p>
        ) : (
          <>
            {renderCategory("Bases", inventory.bases, "bases")}
            {renderCategory("Sauces", inventory.sauces, "sauces")}
            {renderCategory("Cheeses", inventory.cheeses, "cheeses")}
            {renderCategory("Veggies", inventory.veggies, "veggies")}
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateInventory;