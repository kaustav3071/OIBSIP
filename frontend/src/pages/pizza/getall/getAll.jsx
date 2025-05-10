import React, { useState, useEffect } from "react";
import "./getAll.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const GetAll = () => {
    const url = "http://localhost:4000/pizza";
    const [getAll, setGetAll] = useState([]);
    const navigate = useNavigate(); // Initialize navigation

    // Fetch all pizzas
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

    // Delete a pizza
    const deletePizza = async (id) => {
        try {
            console.log("Deleting pizza with ID:", id); // Log the ID being deleted
            const response = await axios.delete(`${url}/deletepizza/${id}`);
            console.log("Delete response:", response); // Log the response from the server
            if (response.status === 200) {
                toast.success("Pizza deleted successfully");
                setGetAll((prevPizzas) => prevPizzas.filter((pizza) => pizza._id !== id)); // Remove from frontend
            } else {
                toast.error("Failed to delete pizza");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while deleting the pizza");
        }
    };

    const handleUpdate = (id) => {
        navigate(`/admin/pizza_dashboard/update/${id}`); // Navigate to update page
    }

    useEffect(() => {
        fetchAllPizzas();
    }, []);

    return (
        <div className="getAll">
            <h1>All Pizzas</h1>
            <div className="pizza-list">
                {getAll.length > 0 ? (
                    getAll.map((pizza) => (
                        <div key={pizza._id} className="pizza-card">
                            <img src={`http://localhost:4000/images/${pizza.image}`} alt={pizza.name} />
                            <h2>{pizza.name}</h2>
                            <p>{pizza.description}</p>
                            <p>Price: ₹{pizza.price}</p>
                            <div className="pizza-actions">
                                <button
                                    className="update-btn"
                                    onClick={() => navigate(`/admin/pizza_dashboard/update/${pizza._id}`)} // Navigate to update page
                                >
                                    Update
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deletePizza(pizza._id)} // Call delete function
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No pizzas available</p>
                )}
            </div>
        </div>
    );
};

export default GetAll;