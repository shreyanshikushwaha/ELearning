import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    message: string;
    messageType: 'text' | 'image' | 'video' | 'file';
    mediaUrl?: string;
    timestamp: Date;
    readBy: mongoose.Types.ObjectId[];
    edited: boolean;
    deletedFor: mongoose.Types.ObjectId[];
}

const MessageSchema: Schema = new Schema(
    {
        chatId: {type: String, ref: 'Chat', required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        messageType: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },
        mediaUrl: { type: String, default: null },
        timestamp: { type: Date, default: Date.now },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Who read the message
        edited: { type: Boolean, default: false },
        deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Soft delete
    },
    { timestamps: true }
);

const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
