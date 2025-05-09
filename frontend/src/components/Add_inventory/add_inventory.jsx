import React, { useState, useEffect } from "react";
import "./add_inventory.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddInventory = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCheeses, setSelectedCheeses] = useState([]); // New state for cheese selections

    const api = axios.create({
        baseURL: 'http://localhost:4000',
        timeout: 10000,
    });

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please log in to view your cart.");
                navigate("/login");
                return;
            }

            const response = await api.get("/user/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userCart = response.data.user.cartData || [];
            console.log("Fetched cart from backend:", userCart);
            const updatedCart = userCart.map(item => ({
                ...item,
                originalPrice: item.originalPrice || item.price,
            }));
            console.log("Updated cart with originalPrice:", updatedCart);
            setCart(updatedCart);
            // Initialize selectedCheeses with empty strings for each pizza
            setSelectedCheeses(updatedCart.map(() => ""));
        } catch (error) {
            console.error("Error fetching cart:", error.message, error.response?.data);
            setError("Failed to load cart. Please try again.");
            toast.error("Failed to load cart.");
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await api.get("/inventory");
            setInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error.message, error.response?.data);
            setError("Failed to load inventory. Please try again.");
            toast.error("Failed to load inventory.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchCart(), fetchInventory()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    const updateCartInBackend = async (updatedCart) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please log in to update your cart.");
                navigate("/login");
                return;
            }

            const response = await api.put(
                "/user/update_cart",
                { cartData: updatedCart },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setCart(response.data.cartData);
            toast.success("Cart updated successfully!");
        } catch (error) {
            console.error("Error updating cart:", error.message, error.response?.data);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
                navigate("/login");
            } else {
                toast.error("Failed to update cart.");
            }
        }
    };

    const handleInventoryChange = (index, field, value, isVeggie = false) => {
        const updatedCart = [...cart];
        console.log("Cart before update:", updatedCart);

        if (isVeggie) {
            const currentVeggies = updatedCart[index].veggies || [];
            updatedCart[index].veggies = value
                ? [...currentVeggies, field]
                : currentVeggies.filter((v) => v !== field);
            updatedCart[index].veggiesPrice = updatedCart[index].veggies.reduce((total, veggie) => {
                return total + (inventory?.veggies[veggie]?.price || 0);
            }, 0);
        } else {
            updatedCart[index][field] = value;
            if (field === "base") {
                updatedCart[index].basePrice = inventory?.bases[value]?.price || 0;
            } else if (field === "sauce") {
                updatedCart[index].saucePrice = inventory?.sauces[value]?.price || 0;
            } else if (field === "cheese") {
                // Normalize the cheese name (e.g., trim and convert to lowercase for comparison)
                const cheeseName = value.trim();
                const cheeseEntry = Object.keys(inventory?.cheeses || {}).find(
                    key => key.trim().toLowerCase() === cheeseName.toLowerCase()
                );
                if (cheeseEntry) {
                    updatedCart[index].cheesePrice = inventory.cheeses[cheeseEntry].price || 0;
                    updatedCart[index].cheese = cheeseEntry; // Ensure the cheese name matches the inventory key
                } else {
                    console.warn(`Cheese "${cheeseName}" not found in inventory. Setting price to 0.`);
                    updatedCart[index].cheesePrice = 0;
                }
            }
        }

        if (field === "cheese") {
            const updatedSelectedCheeses = [...selectedCheeses];
            updatedSelectedCheeses[index] = value;
            setSelectedCheeses(updatedSelectedCheeses);
        }

        const basePrice = updatedCart[index].basePrice || 0;
        const saucePrice = updatedCart[index].saucePrice || 0;
        const cheesePrice = updatedCart[index].cheesePrice || 0;
        const veggiesPrice = updatedCart[index].veggiesPrice || 0;

        const defaultBasePrice = 40;
        const defaultSaucePrice = 0;
        const defaultCheesePrice = 30;
        const defaultInventoryCost = defaultBasePrice + defaultSaucePrice + defaultCheesePrice;

        console.log("Inventory prices:", { basePrice, saucePrice, cheesePrice, veggiesPrice });
        console.log("Default inventory cost:", { defaultBasePrice, defaultSaucePrice, defaultCheesePrice, total: defaultInventoryCost });

        const basePizzaPrice = Number(updatedCart[index].originalPrice) || Number(updatedCart[index].price) || 0;
        console.log("Base pizza price:", basePizzaPrice);

        let adjustedPrice = basePizzaPrice - defaultInventoryCost;
        adjustedPrice += basePrice + saucePrice + cheesePrice + veggiesPrice;

        console.log("Price calculation:", {
            basePizzaPrice,
            defaultInventoryCost,
            adjustedBasePrice: basePizzaPrice - defaultInventoryCost,
            basePrice,
            saucePrice,
            cheesePrice,
            veggiesPrice,
            total: adjustedPrice,
        });

        updatedCart[index].price = updatedCart[index].price; // Use the price from the backend
        console.log("Updated cart after price calculation:", updatedCart);

        const isValidCart = updatedCart.every(item => typeof item.price === 'number' && !isNaN(item.price));
        if (!isValidCart) {
            console.error("Invalid cart data:", updatedCart);
            toast.error("Failed to update cart: Invalid price data.");
            return;
        }

        setCart(updatedCart);
        updateCartInBackend(updatedCart);
        toast.success("Inventory updated for " + updatedCart[index].pizzaName);
    };

    const handleRemovePizza = (index) => {
        const updatedCart = cart.filter((_, i) => i !== index);
        const updatedSelectedCheeses = selectedCheeses.filter((_, i) => i !== index);
        setCart(updatedCart);
        setSelectedCheeses(updatedSelectedCheeses);
        updateCartInBackend(updatedCart);
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

            {loading ? (
                <div className="customize-pizzas">
                    <h1>Loading...</h1>
                </div>
            ) : error ? (
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
            ) : cart.length > 0 ? (
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
                                <div className="inventory-field">
                                    <label>Base:</label>
                                    <select
                                        value={pizza.base}
                                        onChange={(e) =>
                                            handleInventoryChange(index, "base", e.target.value)
                                        }
                                        className="inventory-select"
                                        disabled={loading}
                                    >
                                        <option value="">Select Base</option>
                                        {Object.entries(inventory?.bases || {}).map(([name, details]) => (
                                            <option key={name} value={name}>
                                                {name} (Rs {details.price})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="inventory-field">
                                    <label>Sauce:</label>
                                    <select
                                        value={pizza.sauce}
                                        onChange={(e) =>
                                            handleInventoryChange(index, "sauce", e.target.value)
                                        }
                                        className="inventory-select"
                                        disabled={loading}
                                    >
                                        <option value="">Select Sauce</option>
                                        {Object.entries(inventory?.sauces || {}).map(([name, details]) => (
                                            <option key={name} value={name}>
                                                {name} (Rs {details.price})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="inventory-field">
                                    <label>Cheese:</label>
                                    <select
                                        value={selectedCheeses[index] || ""}
                                        onChange={(e) =>
                                            handleInventoryChange(index, "cheese", e.target.value)
                                        }
                                        className="inventory-select"
                                        disabled={loading}
                                    >
                                        <option value="">Select Cheese</option>
                                        {Object.entries(inventory?.cheeses || {}).map(([name, details]) => (
                                            <option key={name} value={name}>
                                                {name} (Rs {details.price})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="inventory-field">
                                    <label>Veggies:</label>
                                    <div className="veggies-list">
                                        {Object.entries(inventory?.veggies || {}).map(([name, details]) => (
                                            <label key={name} className="veggie-option">
                                                <input
                                                    type="checkbox"
                                                    value={name}
                                                    checked={pizza.veggies.includes(name)}
                                                    onChange={(e) =>
                                                        handleInventoryChange(index, name, e.target.checked, true)
                                                    }
                                                    disabled={loading}
                                                />
                                                {name} (Rs {details.price})
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pizza-meta">
                                    <p>Price: Rs {pizza.price}</p>
                                    <p>Quantity: {pizza.quantity}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            className="remove-pizza-button"
                            onClick={() => handleRemovePizza(index)}
                            disabled={loading}
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
                    disabled={loading}
                >
                    Back to Cart
                </button>
                <button
                    className="customize-pizzas-button"
                    onClick={() => navigate("/menu")}
                    disabled={loading}
                >
                    Add More Pizzas
                </button>
            </div>
        </div>
    );

    // Add any additional error handling or loading states as needed
}

export default AddInventory;