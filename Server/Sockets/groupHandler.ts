import { Server, Socket } from 'socket.io';

export const groupHandler = (io:Server,socket:Socket) => {
    socket.on('join_group',({groupId}) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}`);
    })

    socket.on('send_group_message', ({groupId, senderId, message}) => {
        console.log(`Group message in ${groupId} from ${senderId}: ${message}`);
        socket.to(groupId).emit('receive_group_message', {senderId, message});
    })
}