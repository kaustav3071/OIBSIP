import mongoose from "mongoose";
import jwt from "jsonwebtoken";


const pizzaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }
});


pizzaSchema.methods.generateAuthToken = async function () {
    const pizza = this;
    const token = jwt.sign({ _id: pizza._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return token;
}

const Pizza = mongoose.models.Pizza || mongoose.model("Pizza", pizzaSchema);

export default Pizza;
