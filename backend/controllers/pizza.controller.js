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
        const { id } = req.params;
        const pizza = await PizzaModel.findById(id);

        if (!pizza) {
            return res.status(404).json({ message: "Pizza not found" });
        }

        // Check if the file exists before deleting
        const filePath = `uploads/${pizza.image}`;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete the pizza from the database
        await PizzaModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Pizza deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Function to update a pizza by ID
export const updatePizza = async (req, res) => {
    try {
        const pizzaId = req.params.id; 
        const { name, description, price } = req.body;
        const pizzaImage = req.file ? req.file.filename : null; 

        const pizza = await PizzaModel.findById(pizzaId);
        if (!pizza) {
            return res.status(404).json({ message: 'Pizza not found' });
        }

        // Update the pizza details
        pizza.name = name || pizza.name;
        pizza.description = description || pizza.description;
        pizza.price = price || pizza.price;
        if (pizzaImage) {
            // Delete the old image file if a new one is provided
            fs.unlinkSync(`uploads/${pizza.image}`);
            pizza.image = pizzaImage; // Save the new image filename
        }

        await pizza.save();
        res.status(200).json({ message: 'Pizza updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};