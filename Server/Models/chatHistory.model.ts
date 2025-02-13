import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  chatId: string;
  participants: mongoose.Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  messages: mongoose.Types.ObjectId[];
}

const ChatSchema: Schema = new Schema(
  {
    chatId: { type: String, required: true, unique: true, index: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: null },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
  },
  { timestamps: true }
);

const Chat = mongoose.model<IChat>('Chat', ChatSchema);
export default Chat;
