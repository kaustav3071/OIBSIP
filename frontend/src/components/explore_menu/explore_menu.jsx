// explore_menu.jsx (Final Fix with Add/Remove and Price Sync)
import React, { useState, useEffect } from "react";
import "./explore_menu.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ExploreMenu = () => {
    const url = "https://pizzacraft-backend.vercel.app/pizza";
    const [getAll, setGetAll] = useState([]);
    const navigate = useNavigate();
    const [itemCounts, setItemCounts] = useState({});
    const [inventory, setInventory] = useState(null);
    const [cart, setCart] = useState([]);

    const api = axios.create({
        baseURL: 'https://pizzacraft-backend.vercel.app',
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
            toast.error("An error occurred while fetching pizzas");
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await api.get("/inventory");
            setInventory(response.data);
        } catch (error) {
            toast.error("Failed to load inventory.");
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/user/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userCart = response.data.user.cartData || [];
            setCart(userCart);
            const counts = {};
            userCart.forEach(item => {
                counts[item.pizzaId] = item.quantity;
            });
            setItemCounts(counts);
        } catch (error) {
            toast.error("Failed to fetch cart.");
        }
    };

    const updateCartInBackend = async (updatedCart) => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.put("/user/update_cart", { cartData: updatedCart }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCart(response.data.cartData);
        } catch (error) {
            toast.error("Failed to update cart.");
        }
    };

    const handleAddItem = (pizzaId) => {
        const pizza = getAll.find(p => p._id === pizzaId);
        if (!pizza || !inventory) return;

        const defaultBase = "Regular";
        const defaultSauce = "Tomato";
        const defaultCheese = Object.keys(inventory.cheeses).find(c => c.toLowerCase() === "mozzarella") || "Mozzarella";

        const quantity = (itemCounts[pizzaId] || 0) + 1;

        const updatedCartItem = {
            pizzaId: pizza._id,
            pizzaName: pizza.name,
            pizzaImage: pizza.image,
            originalPrice: pizza.price,
            price: pizza.price,
            quantity,
            base: defaultBase,
            sauce: defaultSauce,
            cheese: defaultCheese,
            veggies: [],
            basePrice: inventory.bases[defaultBase]?.price || 0,
            saucePrice: inventory.sauces[defaultSauce]?.price || 0,
            cheesePrice: inventory.cheeses[defaultCheese]?.price || 0,
            veggiesPrice: 0,
        };

        const newCart = [...cart.filter(item => item.pizzaId !== pizzaId), updatedCartItem];
        setItemCounts(prev => ({ ...prev, [pizzaId]: quantity }));
        updateCartInBackend(newCart);
    };

    const handleRemoveItem = (pizzaId) => {
        const currentQty = itemCounts[pizzaId] || 0;
        const quantity = Math.max(currentQty - 1, 0);

        if (quantity === 0) {
            const newCart = cart.filter(item => item.pizzaId !== pizzaId);
            setItemCounts(prev => {
                const updated = { ...prev };
                delete updated[pizzaId];
                return updated;
            });
            updateCartInBackend(newCart);
            return;
        }

        const item = cart.find(p => p.pizzaId === pizzaId);
        if (!item) return;

        const updatedCartItem = {
            ...item,
            quantity,
        };

        const newCart = [...cart.filter(p => p.pizzaId !== pizzaId), updatedCartItem];
        setItemCounts(prev => ({ ...prev, [pizzaId]: quantity }));
        updateCartInBackend(newCart);
    };

    useEffect(() => {
        Promise.all([fetchAllPizzas(), fetchInventory(), fetchCart()]);
    }, []);

    return (
        <div className="explore-menu" id="explore-menu">
            <h1>Explore our Menu</h1>
            <p className="explore-menu-text">
                We have a wide variety of pizzas to choose from. Explore our menu and find your favorite!
            </p>
            <div className="explore-menu-buttons">
                <button className="explore-menu-button" onClick={() => navigate("/cart")}>View Cart</button>
                <button className="explore-menu-button" onClick={() => navigate("/add-inventory")}>Add Inventory</button>
            </div>
            <div className="menu-items">
                {getAll.length > 0 ? (
                    getAll.map((pizza) => (
                        <div className="menu-item" key={pizza._id}>
                            <img src={`https://pizzacraft-backend.vercel.app/images/${pizza.image}`} alt={pizza.name} />
                            <h2 className="menu-name">{pizza.name}</h2>
                            <p className="menu-description">{pizza.description}</p>
                            <p className="menu-price">Price: Rs {pizza.price}</p>
                            {!itemCounts[pizza._id] ? (
                                <button className="add" onClick={() => handleAddItem(pizza._id)}>Add</button>
                            ) : (
                                <div className="pizza-item-counter">
                                    <button className="remove" onClick={() => handleRemoveItem(pizza._id)}>Remove</button>
                                    <p className="item-count">{itemCounts[pizza._id]}</p>
                                    <button className="add" onClick={() => handleAddItem(pizza._id)}>Add</button>
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
