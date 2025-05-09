import React, { useState, useEffect } from "react";
import "./add_inventory.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddInventory= () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch inventory from the backend
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:4000/inventory");
                setInventory(response.data);
            } catch (error) {
                console.error("Error fetching inventory:", error);
                setError("Failed to load inventory. Please try again.");
                toast.error("Failed to load inventory.");
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // Handle inventory changes for a specific pizza
    const handleInventoryChange = (index, field, value, isVeggie = false) => {
        const updatedCart = [...cart];
        if (isVeggie) {
            const currentVeggies = updatedCart[index].veggies || [];
            updatedCart[index].veggies = value
                ? [...currentVeggies, field]
                : currentVeggies.filter((v) => v !== field);
        } else {
            updatedCart[index][field] = value;
        }

        const bases = inventory.bases || {};
        const sauces = inventory.sauces || {};
        const cheeses = inventory.cheeses || {};
        const veggies = inventory.veggies || {};

        const basePrice = bases[updatedCart[index].base]?.price || 0;
        const saucePrice = sauces[updatedCart[index].sauce]?.price || 0;
        const cheesePrice = cheeses[updatedCart[index].cheese]?.price || 0;
        const veggiesPrice = updatedCart[index].veggies.reduce((total, veggie) => {
            return total + (veggies[veggie]?.price || 0);
        }, 0);

        const defaultInventoryCost = (bases["Regular"]?.price || 0) + (sauces["Tomato"]?.price || 0) + (cheeses["Mozzarella"]?.price || 0);
        const newInventoryCost = basePrice + saucePrice + cheesePrice + veggiesPrice;
        const basePizzaPrice = updatedCart[index].pizzaId ? updatedCart[index].price - defaultInventoryCost : 0;
        updatedCart[index].price = basePizzaPrice + newInventoryCost;

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Inventory updated for " + updatedCart[index].pizzaName);
    };
    
    const handleRemovePizza = (index) => {
        const updatedCart = cart.filter((_, i) => i !== index);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Pizza removed from cart!");
    };

    if (loading) {
        return (
            <div className="customize-pizzas">
                <h1>Loading...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="customize-pizzas">
                <h1>Error</h1>
                <p>{error}</p>
                <button
                    className="customize-pizzas-button"
                    onClick={() => navigate("/menu")}
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="customize-pizzas">
            <h1>Customize Your Pizzas</h1>
            <p className="customize-pizzas-text">
                Modify the inventory for each pizza in your cart.
            </p>

            {cart.length > 0 ? (
                cart.map((pizza, index) => (
                    <div key={index} className="pizza-customization">
                        <h2>{pizza.pizzaName}</h2>
                        <div className="pizza-details">
                            <img
                                src={`http://localhost:4000/images/${pizza.pizzaImage}`}
                                alt={pizza.pizzaName}
                                className="pizza-image"
                            />
                            <div className="inventory-options">
                                {/* Base Selection */}
                                <div className="inventory-field">
                                    <label>Base:</label>
                                    <select
                                        value={pizza.base}
                                        onChange={(e) =>
                                            handleInventoryChange(index, "base", e.target.value)
                                        }
                                        className="inventory-select"
                                    >
                                        <option value="">Select Base</option>
                                        {Object.entries(inventory.bases || {}).map(([name, details]) => (
                                            <option key={name} value={name}>
                                                {name} (Rs {details.price})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sauce Selection */}
                                <div className="inventory-field">
                                    <label>Sauce:</label>
                                    <select
                                        value={pizza.sauce}
                                        onChange={(e) =>
                                            handleInventoryChange(index, "sauce", e.target.value)
                                        }
                                        className="inventory-select"
                                    >
                                        <option value="">Select Sauce</option>
                                        {Object.entries(inventory.sauces || {}).map(([name, details]) => (
                                            <option key={name} value={name}>
                                                {name} (Rs {details.price})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cheese Selection */}
                                <div className="inventory-field">
                                    <label>Cheese:</label>
                                    <select
                                        value={pizza.cheese}
                                        onChange={(e) =>
                                            handleInventoryChange(index, "cheese", e.target.value)
                                        }
                                        className="inventory-select"
                                    >
                                        <option value="">Select Cheese</option>
                                        {Object.entries(inventory.cheeses || {}).map(([name, details]) => (
                                            <option key={name} value={name}>
                                                {name} (Rs {details.price})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Veggies Selection */}
                                <div className="inventory-field">
                                    <label>Veggies:</label>
                                    <div className="veggies-list">
                                        {Object.entries(inventory.veggies || {}).map(([name, details]) => (
                                            <label key={name} className="veggie-option">
                                                <input
                                                    type="checkbox"
                                                    value={name}
                                                    checked={pizza.veggies.includes(name)}
                                                    onChange={(e) =>
                                                        handleInventoryChange(index, name, e.target.checked, true)
                                                    }
                                                />
                                                {name} (Rs {details.price})
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price and Quantity */}
                                <div className="pizza-meta">
                                    <p>Price: Rs {pizza.price}</p>
                                    <p>Quantity: {pizza.quantity}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            className="remove-pizza-button"
                            onClick={() => handleRemovePizza(index)}
                        >
                            Remove Pizza
                        </button>
                    </div>
                ))
            ) : (
                <p>Your cart is empty.</p>
            )}

            <div className="customize-pizzas-actions">
                <button
                    className="customize-pizzas-button"
                    onClick={() => navigate("/cart")}
                >
                    Back to Cart
                </button>
                <button
                    className="customize-pizzas-button"
                    onClick={() => navigate("/menu")}
                >
                    Add More Pizzas
                </button>
            </div>
        </div>
    );
};

export default AddInventory;