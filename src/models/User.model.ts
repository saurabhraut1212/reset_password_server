import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date,
});

export const User = mongoose.model<IUser>("User", userSchema);
