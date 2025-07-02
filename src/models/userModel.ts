import mongoose from "mongoose";
import { model } from "mongoose";

export interface User {
  name: string;
  email: string;
  password: string;
  mobileNumber: number;
  isDeleted: boolean;
  token: string;
  profileImage: {
    original: string;
    optimized: string;
  };
}

const User = new mongoose.Schema<User>({
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: null,
    },
    profileImage: {
      original: {
        type: String,
        default: null,
      },
      optimized: {
        type: String,
        default: null,
      }
    },
},
  {
    timestamps: true,
  }
);
const UserModel = model<User>("User", User);
export default UserModel;
