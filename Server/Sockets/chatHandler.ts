import { Server, Socket } from 'socket.io';

export const chatHandler = (io: Server, socket: Socket) => {

    socket.on('join_room', (chatId: string) => {
        socket.join(chatId);
        console.log(`User joined room: ${chatId}`);
    });

    socket.on('send_message', (data) => {
        const { senderId, chatId, message } = data;
        const timestamp = new Date().toISOString();

        console.log(`Message received from ${senderId} in room ${chatId}: ${message} at ${timestamp}`);

        io.to(chatId).emit('receive_message', { senderId, message, timestamp });
    });

};
