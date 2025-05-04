import mongoose from 'mongoose';

// Define the subschema for the nested objects (qty and price)
const ingredientSchema = new mongoose.Schema({
  qty: {
    type: Number,
    required: true,
    min: 0 // Ensure quantity is non-negative
  },
  price: {
    type: Number,
    required: true,
    min: 0 // Ensure price is non-negative
  }
}, { _id: false }); // Disable _id for subdocuments

// Define the main inventory schema
const inventorySchema = new mongoose.Schema({
  bases: {
    type: Map,
    of: ingredientSchema,
    default: {}
  },
  sauces: {
    type: Map,
    of: ingredientSchema,
    default: {}
  },
  cheeses: {
    type: Map,
    of: ingredientSchema,
    default: {}
  },
  veggies: {
    type: Map,
    of: ingredientSchema,
    default: {}
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create and export the Inventory model
const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;