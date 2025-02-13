import mongoose, { Schema, Document } from 'mongoose';

export interface IUsers extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true},
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model<IUsers>('User', UserSchema);

export default Users;
