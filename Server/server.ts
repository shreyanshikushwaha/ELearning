import { app } from './app';
import { v2 as cloudinary } from 'cloudinary';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './utils/db'
import { initializeSocket } from './Sockets/connection';
require("dotenv").config();

//configure cloudinary 
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});

// Create HTTP server from the Express app
const httpServer = http.createServer(app);

// Creating socket server
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: '*',  // Allow all origins for testing
        methods: ['GET', 'POST']
    },
    transports: ['websocket'],  // Force the server to use WebSocket only
});


// handling socket server
initializeSocket(io);

//create server
console.log(`Attempting to start server on port: ${process.env.PORT}`);
httpServer.listen(process.env.PORT, async () => {
    try {
        console.log(`Server is listening on port ${process.env.PORT}`);
        await connectDB(); // Making the connection async
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process if DB connection fails
    }
});

export { io };
