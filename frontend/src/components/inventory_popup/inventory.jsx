import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./inventory.css";

const Inventory = () => {
  const url = "https://pizzacraft-backend.vercel.app";
  const [inventory, setInventory] = useState({
    bases: new Map(),
    sauces: new Map(),
    cheeses: new Map(),
    veggies: new Map(),
  });

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${url}/inventory`);
      if (response.status === 200) {
        setInventory({
          bases: new Map(Object.entries(response.data.bases)),
          sauces: new Map(Object.entries(response.data.sauces)),
          cheeses: new Map(Object.entries(response.data.cheeses)),
          veggies: new Map(Object.entries(response.data.veggies)),
        });
      } else {
        toast.error("Error fetching inventory");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching inventory");
    }
  };

  // Update inventory
  const updateInventory = async () => {
    try {
      const response = await axios.put(`${url}/inventory`, {
        bases: Object.fromEntries(inventory.bases),
        sauces: Object.fromEntries(inventory.sauces),
        cheeses: Object.fromEntries(inventory.cheeses),
        veggies: Object.fromEntries(inventory.veggies),
      });
      if (response.status === 200) {
        toast.success("Inventory updated successfully!");
      } else {
        toast.error("Error updating inventory");
      }
    } catch (error) {
      toast.error("An error occurred while updating inventory");
    }
  };

  // Handle input change
  const handleInputChange = (category, name, field, value) => {
    setInventory((prev) => {
      const updatedCategory = new Map(prev[category]);
      const item = updatedCategory.get(name) || { qty: 0, price: 0 };
      updatedCategory.set(name, { ...item, [field]: parseFloat(value) || 0 });
      return { ...prev, [category]: updatedCategory };
    });
  };

  // Add new item
  const addNewItem = (category) => {
    const name = prompt(`Enter new ${category.slice(0, -1)} name:`);
    if (name) {
      setInventory((prev) => {
        const updatedCategory = new Map(prev[category]);
        updatedCategory.set(name, { qty: 0, price: 0 });
        return { ...prev, [category]: updatedCategory };
      });
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="inventory">
      <h1>Manage Inventory</h1>
      {["bases", "sauces", "cheeses", "veggies"].map((category) => (
        <div key={category} className="inventory-category">
          <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
          <button onClick={() => addNewItem(category)}>Add New</button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {[...inventory[category].entries()].map(([name, details]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>
                    <input
                      type="number"
                      value={details.qty}
                      onChange={(e) =>
                        handleInputChange(category, name, "qty", e.target.value)
                      }
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={details.price}
                      onChange={(e) =>
                        handleInputChange(category, name, "price", e.target.value)
                      }
                      min="0"
                      step="0.01"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button className="update-btn" onClick={updateInventory}>
        Update Inventory
      </button>
    </div>
  );
};

export default Inventory;