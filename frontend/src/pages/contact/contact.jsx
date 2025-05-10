import React, { useState, useEffect } from "react";
import "./contact.css"; // Add a CSS file for styling
import axios from "axios";

const Contact = () => {
  const url = import.meta.env.VITE_API_URL; // Base URL for API requests
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        if (!token) {
          console.error("No token found");
          return;
        }
        const response = await axios.get(`${url}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          },
        });
        const { name, email } = response.data.user; // Assuming the backend returns `name` and `email`
        setFormData((prevData) => ({
          ...prevData,
          name: name || "", // Ensure name is not undefined
          email: email || "", // Ensure email is not undefined
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required.";
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.message?.trim()) newErrors.message = "Message is required.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      console.log("Form submitted:", formData);
      const response = await axios.post(`${url}/contact`, formData);
  
      if (response.status === 200) {
        console.log("Email sent successfully");
        setSuccessMessage("Thank you for contacting us! We will get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
      } else {
        console.error("Error sending email:", response.data?.error || "Unknown error");
        setSuccessMessage("Failed to send email. Please try again later.");
      }
    } catch (error) {
      console.error("Error sending email:", error.response?.data?.message || error.message || "Unknown error");
      setSuccessMessage("Failed to send email. Please try again later.");
    }
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error" : ""}
            readOnly // Make the field read-only since it's prefilled
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "error" : ""}
            readOnly // Make the field read-only since it's prefilled
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={errors.message ? "error" : ""}
          ></textarea>
          {errors.message && <p className="error-message">{errors.message}</p>}
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Contact;