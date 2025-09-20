import { generateToken } from "../config/jwt.config.js";
import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

// Sign Up
export const signUp = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        res.status(400);
        throw new Error("User with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = generateToken(user._id);

    // Set token as HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Also return the token for mobile apps
    res.status(201).json({ 
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token 
    });
});

// Sign In
export const signIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    const token = generateToken(user._id);

    // Set token as HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Also return the token for mobile apps
    res.status(200).json({ 
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token 
    });
});

// Sign Out
export const signOut = asyncHandler(async (req, res) => {
    // Clear the token cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    
    res.status(200).json({ message: "Signed out successfully" });
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req, res) => {
    if (!res.locals.user) {
        res.status(401)
        throw new Error("Unauthorized");
    }
    res.status(200).json({ user: res.locals.user });
});
