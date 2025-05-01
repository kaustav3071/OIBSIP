import React, { useState, useEffect } from "react";
import "./update_pizza.css"; // Import the CSS file for styling
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const UpdatePizza = () => {
    const { id } = useParams(); // Get the pizza ID from the URL
    const navigate = useNavigate(); // For navigation after update

    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
    });
    const [image, setImage] = useState(null); // State for the new image
    const [currentImage, setCurrentImage] = useState(""); // State for the current image

    const url = "http://localhost:4000/pizza";

    // Fetch pizza details by ID
    const fetchPizzaDetails = async () => {
        try {
            const response = await axios.get(`${url}/getallpizzas`);
            const pizza = response.data.find((p) => p._id === id);
            if (pizza) {
                setData({
                    name: pizza.name,
                    description: pizza.description,
                    price: pizza.price,
                });
                setCurrentImage(pizza.image);
            } else {
                toast.error("Pizza not found!");
                navigate("/pizza_dashboard/get");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching pizza details");
        }
    };

    useEffect(() => {
        fetchPizzaDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("pizzaimage", image);
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));

        try {
            const response = await axios.put(`${url}/updatepizza/${id}`, formData);
            if (response.status === 200) {
                toast.success("Pizza updated successfully!");
                navigate("/pizza_dashboard/get");
            } else {
                toast.error("Failed to update pizza");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while updating the pizza");
        }
    };

    return (
        <div className="update-pizza">
            <h1>Update Pizza</h1>
            <form onSubmit={handleSubmit}>
                <div className="update-img-upload">
                    <p>Upload Pizza Image</p>
                    <label htmlFor="image">
                        <img
                            src={
                                image
                                    ? URL.createObjectURL(image)
                                    : `http://localhost:4000/images/${currentImage}`
                            }
                            alt="Pizza Preview"
                        />
                    </label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <div className="update-product-name">
                    <p>Pizza Name</p>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter Pizza Name"
                        value={data.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="update-product-description">
                    <p>Pizza Description</p>
                    <textarea
                        name="description"
                        placeholder="Enter Pizza Description"
                        value={data.description}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="update-product-price">
                    <p>Pizza Price</p>
                    <input
                        type="number"
                        name="price"
                        placeholder="Enter Pizza Price"
                        value={data.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="update-product-btn">
                    Update Pizza
                </button>
            </form>
        </div>
    );
};

export default UpdatePizza;