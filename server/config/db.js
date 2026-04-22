const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("MongoDB Connected");

        // Connection lost hone par auto-reconnect
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected! Trying to reconnect...');
            connectDB();
        });

    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1); // optional, agar server crash nahi chahiye to comment
    }
};

module.exports = { connectDB };