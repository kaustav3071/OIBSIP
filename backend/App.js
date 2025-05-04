import { config } from 'dotenv';
config();
import express, { json, urlencoded } from 'express';
import cors from 'cors';
const app = express();
import connectDB from './db/db.js';
import cookieParser from 'cookie-parser';
import PizzaRouter from './routes/pizza.route.js';
import UserRouter from './routes/user.route.js';
import InventoryRouter from './routes/inventories.route.js';

app.use(cookieParser());
connectDB();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));


app.use('/pizza', PizzaRouter)
app.use('/images', express.static('uploads'));

app.use('/user', UserRouter)

app.use('/inventory', InventoryRouter)

export default app;



