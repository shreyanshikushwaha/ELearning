import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
    Id: string;
    userId: mongoose.Types.ObjectId[];
    chats: mongoose.Types.ObjectId[];
}

const generateChatId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let chatId = '';
    for (let i = 0; i < 5; i++) {
        chatId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return chatId;
};

const ChatHistorySchema: Schema = new Schema(
    {
        Id: { type: String, unique: true, index: true, generateChatId},
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }]
    },
    { timestamps: true }
);

ChatHistorySchema.pre('save', async function (next) {
    if (!this.chatId) {
        this.chatId = generateChatId();
    }
    next();
})

const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
export default ChatHistory;
