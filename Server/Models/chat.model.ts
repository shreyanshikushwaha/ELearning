import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  chatId: string;
  participants: mongoose.Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  messages: mongoose.Types.ObjectId[];
}

const generateChatId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let chatId = '';
  for (let i = 0; i < 5; i++) {
    chatId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return chatId;
};

const ChatSchema: Schema = new Schema(
  {
    chatId: { type: String, unique: true, index: true, generateChatId},
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: null },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
  },
  { timestamps: true }
);

ChatSchema.pre('save', async function(next) {
  if (!this.chatId) {
    this.chatId = generateChatId();
  }
  next(); 
})

const Chat = mongoose.model<IChat>('Chat', ChatSchema);
export default Chat;
