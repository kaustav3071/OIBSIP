import React, { useState, useEffect } from "react";
import "./explore_menu.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ExploreMenu = () => {
    const url = "http://localhost:4000/pizza";
    const [getAll, setGetAll] = useState([]);
    const navigate = useNavigate();
    const [itemCounts, setItemCounts] = useState({});
    const [cart, setCart] = useState([]);
    const [inventory, setInventory] = useState(null); // Add inventory state

    const api = axios.create({
        baseURL: 'http://localhost:4000',
        timeout: 10000,
    });

    const fetchAllPizzas = async () => {
        try {
            const response = await api.get(`${url}/getallpizzas`);
            if (response.status === 200) {
                setGetAll(response.data);
            } else {
                toast.error("Error fetching pizzas");
            }
        } catch (error) {
            console.error("Error fetching pizzas:", error.message, error.response?.data);
            toast.error("An error occurred while fetching pizzas");
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await api.get("/inventory");
            console.log("Fetched inventory in explore_menu:", response.data);
            setInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error.message, error.response?.data);
            toast.error("Failed to load inventory.");
        }
    };

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

            const validCart = userCart.filter(item => 
                item.pizzaId && 
                item.pizzaName && 
                item.pizzaImage && 
                item.price && 
                item.quantity > 0 && 
                item.base && 
                item.sauce && 
                item.cheese
            );
            setCart(validCart);

            const counts = {};
            validCart.forEach(item => {
                counts[item.pizzaId] = item.quantity;
            });
            setItemCounts(counts);
        } catch (error) {
            console.error("Error fetching cart:", error.message, error.response?.data);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
                navigate("/login");
            } else {
                toast.error("Failed to load cart. Please try again.");
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchAllPizzas(), fetchInventory(), fetchCart()]);
        };
        fetchData();
    }, [navigate]);

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

    useEffect(() => {
        if (Object.keys(itemCounts).length === 0 && cart.length === 0) return;

        const updateCartWithCounts = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get("/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const backendCart = response.data.user.cartData || [];

                const updatedCart = [];
                const pizzaMap = new Map(getAll.map(pizza => [pizza._id, pizza]));

                // Get default cheese name from inventory
                const defaultCheese = Object.keys(inventory?.cheeses || {}).find(
                    key => key.toLowerCase() === "mozzarella"
                ) || "mozzarella";

                for (const pizzaId of Object.keys(itemCounts)) {
                    const count = itemCounts[pizzaId];
                    if (count <= 0) continue;

                    const pizza = pizzaMap.get(pizzaId);
                    if (!pizza) continue;

                    const existingItem = backendCart.find(item => item.pizzaId === pizzaId);

                    if (existingItem) {
                        updatedCart.push({
                            ...existingItem,
                            quantity: count,
                        });
                    } else {
                        const basePrice = inventory?.bases["Regular"]?.price || 40;
                        const saucePrice = inventory?.sauces["Tomato"]?.price || 0;
                        const cheesePrice = inventory?.cheeses[defaultCheese]?.price || 70;

                        updatedCart.push({
                            pizzaId: pizza._id,
                            pizzaName: pizza.name,
                            pizzaImage: pizza.image,
                            price: pizza.price,
                            originalPrice: pizza.price,
                            quantity: count,
                            base: "Regular",
                            sauce: "Tomato",
                            cheese: defaultCheese,
                            veggies: [],
                            basePrice,
                            saucePrice,
                            cheesePrice,
                        });
                    }
                }

                setCart(updatedCart);
                await updateCartInBackend(updatedCart);
            } catch (error) {
                console.error("Error updating cart with counts:", error);
                toast.error("Failed to sync cart.");
            }
        };

        if (inventory) {
            updateCartWithCounts();
        }
    }, [itemCounts, getAll, inventory]);

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