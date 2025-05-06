import { Request, Response } from "express";
import userModel from "../models/userModel";
import generateToken from "../helpers/token";

export const signUp = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      confirmpassword,
      mobileNumber,
      profileImage,
    } = req.body;

    if (password != confirmpassword) {
      return res.status(400).json({
        status: 400,
        message: "Password and confirm password does not match",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: "User already exists",
      });
    }

    const newUser = new userModel({
      name,
      email,
      password,
      mobileNumber,
      profileImage: profileImage || { original: null, optimized: null },
    });

    const tokenUser = {
      _id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      mobileNumber: newUser.mobileNumber,
    };

    const token = generateToken(tokenUser);
    newUser.token = token;
    await newUser.save();

    return res.status(201).json({
      status: 201,
      message: "User created successfully",
      data: {
        ...tokenUser,
        profileImage: newUser.profileImage,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "User not found",
      });
    }
    if (password !== user.password) {
      return res.status(400).json({
        status: 400,
        message: "Password doesn't match",
      });
    }
    const tokenUser = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      mobileNumber: user.mobileNumber,
    };

    const token = generateToken(tokenUser);
    user.token = token;
    await user.save();
    return res.status(200).json({
      status: 200,
      message: "Login successful",
      data: user,
    });
  } catch (err: any) {
    console.log(err.message);
    return res.status(400).json({
      message: err.message,
    });
  }
};
