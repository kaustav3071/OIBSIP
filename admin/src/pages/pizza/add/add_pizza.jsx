// filepath: d:\OIBSIP\admin\src\pages\pizza\add\add_pizza.jsx
import React, { useState } from "react"; // Import useState
import "./add_pizza.css"; // Import the CSS file for styling
import { assets } from "../../../assets/assets"; // Import assets
import { Link } from "react-router-dom"; // Import Link for navigation
import axios from "axios"; // Import axios for making HTTP requests
import { toast } from "react-toastify";

const Add = () => {

    const url = "http://localhost:4000"

    const [image, setImage] = useState(null); // State to hold the image file
    const [data, setData] = useState({
        name: "",
        description: "",
        price: ""

    }); // State to hold form data

    const handleChange = (e) => {
        const name = e.target.name; // Get the name of the input field
        const value = e.target.value; // Get the value of the input field
        setData(data=>({...data,[name]:value})); // Update the state with the new value
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission
        const formData = new FormData(); // Create a new FormData object
        formData.append("pizzaimage", image); // Append the image file to the FormData object
        formData.append("name", data.name); // Append the name to the FormData object
        formData.append("description", data.description); // Append the description to the FormData object
        formData.append("price", Number(data.price)); // Append the price to the FormData object

        const response = await axios.post(`${url}/pizza/add`, formData)
        if (response.status === 201) {
            setData({ name: "", description: "", price: "" }); // Reset the form data
            setImage(null); // Reset the image state
            toast.success("Pizza added successfully!"); // Show success message
        }
        if (response.status === 500) {
            toast.error("Pizza already exists!"); // Show error message if pizza already exists
        }      
        
    }
    return (
        <div className="add-pizza">
            <h1>Add Pizza</h1>
            <form className="flex-col" onSubmit={handleSubmit}>
                <div className="add-img-upload flex-col">
                    <p>Upload Pizza Image</p>
                    <label htmlFor="image">
                        <img
                            src={image ? URL.createObjectURL(image) : assets.upload_area}
                            alt="Pizza Preview"
                        />
                    </label>
                    <input
                        type="file"
                        id="image"
                        name="pizzaimage" // Ensure this matches the multer field name
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        required
                    />
                </div>
                <div className="add-product-name flex-col">
                    <p>Pizza Name</p>
                    <input onChange={handleChange} name="name" value={data.name}  // Handle change for name input
                    type="text" placeholder="Enter Pizza Name" required />
                </div>
                <div className="add-product-description flex-col">
                    <p>Pizza Description</p>
                    <textarea onChange={handleChange} name="description" value={data.description} // Handle change for description input
                    rows="5" cols="30" maxLength="200" minLength="10"
                    placeholder="Enter Pizza Description" required></textarea>
                </div>
                <div className="add-product-price flex-col">
                    <p>Pizza Price</p>
                    <input onChange={handleChange} name="price" value={data.price} // Handle change for price input
                    type="number" placeholder="Enter Pizza Price" required />
                </div>
                <button type="submit" className="add-product-btn" 
                >Add Pizza</button>
            </form>
        </div>
    );
};

export default Add;