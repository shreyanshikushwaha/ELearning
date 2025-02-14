import mongoose, { Schema, Document } from 'mongoose';

export interface IUsers extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  chatHistory: mongoose.Types.ObjectId;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true},
    password: { type: String, required: true },
    chatHistory: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatHistory' }
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model<IUsers>('User', UserSchema);

export default Users;
