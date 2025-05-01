import PizzaModel from '../models/pizza.model.js';
import fs from 'fs';

// Functuon to add a new pizza
export const addPizza = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const pizzaImage = req.file.filename; // Use req.file for single file upload
        const pizza = new PizzaModel({
            name,
            description,
            price,
            image: pizzaImage, // Save the image filename
        });
        await pizza.save();
        res.status(201).json({ message: 'Pizza added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Function to get all pizzas
export const getAllPizzas = async (req, res) => {
    try {
        const pizzas = await PizzaModel.find();
        res.status(200).json(pizzas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to delete a pizza by ID
export const deletePizza = async (req, res) => {
    try {
        const pizzaId = req.body.id; // Read the id from the request body
        const pizza = await PizzaModel.findById(pizzaId);
        if (!pizza) {
            return res.status(404).json({ message: 'Pizza not found' });
        }
        // Delete the image file from the server
        fs.unlinkSync(`uploads/${pizza.image}`);
        await PizzaModel.findByIdAndDelete(pizzaId);
        res.status(200).json({ message: 'Pizza deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};