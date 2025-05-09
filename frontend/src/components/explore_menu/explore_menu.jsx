import React from "react";
import "./explore_menu.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const ExploreMenu = () => {
    const url = "http://localhost:4000/pizza";
    const [getAll, setGetAll] = useState([]);
    const navigate = useNavigate();
    const [itemCounts, setItemCounts] = useState({}); // State to track counts for each pizza

    const fetchAllPizzas = async () => {
        try {
            const response = await axios.get(`${url}/getallpizzas`);
            if (response.status === 200) {
                setGetAll(response.data);
            } else {
                toast.error("Error fetching pizzas");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while fetching pizzas");
        }
    };

    useEffect(() => {
        fetchAllPizzas();
    }, []);

    // UseEffect to handle cart updates and toasts after itemCounts changes
    useEffect(() => {
        if (Object.keys(itemCounts).length === 0) return; // Skip initial render

        const cart = [];
        getAll.forEach((pizza) => {
            const count = itemCounts[pizza._id];
            if (count && count > 0) {
                cart.push({
                    pizzaId: pizza._id,
                    pizzaName: pizza.name,
                    pizzaImage: pizza.image,
                    price: pizza.price,
                    quantity: count,
                    base: "Regular",
                    sauce: "Tomato",
                    cheese: "Mozzarella",
                    veggies: [],
                });
            }
        });
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [itemCounts, getAll]);

    // Function to handle adding an item
    const handleAddItem = (pizzaId) => {
        setItemCounts((prev) => {
            const newCounts = {
                ...prev,
                [pizzaId]: (prev[pizzaId] || 0) + 1,
            };
            console.log("Current counts after adding:", newCounts);
            toast.success("Item added to cart!");
            return newCounts;
        });
    };

    // Function to handle removing an item
    const handleRemoveItem = (pizzaId) => {
        setItemCounts((prev) => {
            const newCounts = {
                ...prev,
                [pizzaId]: Math.max((prev[pizzaId] || 0) - 1, 0),
            };
            console.log("Current counts after removing:", newCounts);
            if (newCounts[pizzaId] === 0) {
                toast.success("Item removed from cart!");
            } else {
                toast.success("Item quantity updated!");
            }
            return newCounts;
        });
    };

    return (
        <div className="explore-menu" id="explore-menu">
            <h1>Explore our Menu</h1>
            <p className="explore-menu-text">
                We have a wide variety of pizzas to choose from. Explore our menu and find your favorite!
            </p>
            <button className="explore-menu-button" onClick={() => navigate("/cart")}>
                View Cart Inventory By Default
            </button>
            <button className="explore-menu-button" onClick={() => navigate("/add-inventory")}>
                Add Inventory
            </button>
            <div className="menu-items">
                {getAll.length > 0 ? (
                    getAll.map((pizza) => (
                        <div className="menu-item" key={pizza._id}>
                            <img
                                src={`http://localhost:4000/images/${pizza.image}`}
                                alt={pizza.name}
                            />
                            <h2 className="menu-name">{pizza.name}</h2>
                            <p className="menu-description">{pizza.description}</p>
                            <p className="menu-price">Price: Rs {pizza.price}</p>
                            {!itemCounts[pizza._id] ? (
                                <button
                                    className="add"
                                    onClick={() => handleAddItem(pizza._id)}
                                    alt="Add to cart"
                                >
                                    Add
                                </button>
                            ) : (
                                <div className="pizza-item-counter">
                                    <button
                                        className="remove"
                                        onClick={() => handleRemoveItem(pizza._id)}
                                        src={assets.remove}
                                        alt="Remove from cart"
                                    >
                                        Remove
                                    </button>
                                    <p className="item-count">{itemCounts[pizza._id]}</p>
                                    <button
                                        className="add"
                                        onClick={() => handleAddItem(pizza._id)}
                                        alt="Add to cart"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No pizzas available</p>
                )}
            </div>
        </div>
    );
};

export default ExploreMenu;