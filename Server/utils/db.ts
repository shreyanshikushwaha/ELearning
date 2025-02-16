import mongoose from "mongoose";
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        await mongoose.connect(uri);
        console.log('MongoDB connection string:', uri.replace(/:[^:]*@/, ':****@')); // Logs URI with hidden password
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error; // Re-throw the error to be caught by the server
    }
};

export default connectDB;