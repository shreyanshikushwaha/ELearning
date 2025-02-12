import { Server, Socket } from 'socket.io';
import { chatHandler } from './chatHandler';
import { groupHandler } from './groupHandler';

export const initializeSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        chatHandler(io, socket);

        groupHandler(io, socket);

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};


