import React from "react";
import "./explore_menu.css";
import { menu_items } from "../../assets/assets";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ExploreMenu = () => {
    const url = "http://localhost:4000/pizza";
    const [getAll, setGetAll] = useState([]);
    const navigate = useNavigate(); // Initialize navigation
    
    const [itemCount , setItemCount] = useState(0);

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


    return (
    <div className="explore-menu" id ="explore-menu">
        <h1>Explore our Menu</h1>
        <p className="explore-menu-text">We have a wide variety of pizzas to choose from. Explore our menu and find your favorite!</p>        
        <div className="menu-items">
            {getAll.length > 0 ? (
                getAll.map((pizza) => (
                    <div className="menu-item" key={pizza._id}>
                        <img src={`http://localhost:4000/images/${pizza.image}`} alt={pizza.name} />
                        <h2 className="menu-name">{pizza.name}</h2>
                    </div>
                ))
            ) : (
                <p>No pizzas available</p>
            )
            }
        </div>
    </div>
    );
};
export default ExploreMenu;