import { Contact } from "../controllers/contact.controller.js";
import express from "express";
import { body } from "express-validator";


const contactRouter = express.Router();


contactRouter.post(
    "/contact",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Invalid email address"),
        body("message").notEmpty().withMessage("Message is required"),
    ],
    Contact
);

// Export the router
export default contactRouter;