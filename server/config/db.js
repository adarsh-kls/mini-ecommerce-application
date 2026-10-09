const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is required");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);

        console.log("MongoDB database:", mongoose.connection.name);

    } catch (error) {
        console.error("Database connection failed");
        console.error(error.message);
        process.exit(1);

    }
}

module.exports = connectDB;
