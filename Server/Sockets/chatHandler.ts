import { Server, Socket } from 'socket.io';
import fs from 'fs';
import path from 'path';

export const chatHandler = (io: Server, socket: Socket) => {
    socket.on('send_message', (data) => {
        const { senderId, receiverId, message } = data;
        const timestamp = new Date().toISOString;

        console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

        const filePath = path.join(__dirname, "..", 'data', 'chats,json');
        fs.readFile(filePath, 'utf8', (err, fileData) => {
            if (err) return console.error('Error reading chats:', err);

            let chats = fileData ? JSON.parse(fileData) : [];
            const chatId = [senderId, receiverId].sort().join('_');
            let chat = chats.find((c: { chatId: string; }) => c.chatId === chatId);

            if (!chat) {
                chat = { chatId, participants: [senderId, receiverId], messages: [] };
                chats.push(chat);
            }

            chat.messages.push({ senderId, message, timestamp });

            fs.writeFile(filePath, JSON.stringify(chats, null, 2), (err) => {
                if (err) return console.error('Error saving chat:', err);
            });
        });

        io.to(receiverId).emit('receive_message',{senderId,message,timestamp});
    });
};