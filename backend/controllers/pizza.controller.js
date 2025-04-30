import PizzaModel from '../models/pizza.model.js';
import fs from 'fs';

export const addPizza = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const pizzaImage = req.files.pizzaImage[0].filename;
        const pizza = new PizzaModel({
            name : req.body.name,
            description : req.body.description,
            price : req.body.price,
            pizzaImage : pizzaImage
        });
        await pizza.save();
        res.status(201).json({ message: 'Pizza added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

