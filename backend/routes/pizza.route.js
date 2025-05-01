import express from 'express';
import { addPizza, getAllPizzas, deletePizza, updatePizza  } from '../controllers/pizza.controller.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


router.post("/add", upload.single("pizzaimage") ,addPizza);

router.get("/getallpizzas", getAllPizzas);

router.delete("/deletepizza/:id", deletePizza);

router.put("/updatepizza/:id", upload.single("pizzaimage"), updatePizza); // Uncomment if you implement updatePizza

router.put("/updatepizza/:id", updatePizza); // Uncomment if you implement updatePizza

export default router;