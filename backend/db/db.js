import { connect } from 'mongoose';


async function connectDB() {
    try {
        await connect(process.env.MONGO_CONNECTION_URL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        ),
        console.log("✅ Database connected successfully 🚀🚀🚀");
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1); // Exit process if connection fails
    }
}

export default connectDB;