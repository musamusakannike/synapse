const { lucia } = require("../config/lucia.config");
const User = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

// Sign Up
const signUp = asyncHandler(async (req, res) => {
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

    const session = await lucia.createSession(user._id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res.setHeader("Set-Cookie", sessionCookie.serialize());
    res.status(201).json({ user });
});

// Sign In
const signIn = asyncHandler(async (req, res) => {
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

    const session = await lucia.createSession(user._id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res.setHeader("Set-Cookie", sessionCookie.serialize());
    res.status(200).json({ user });
});

// Sign Out
const signOut = asyncHandler(async (req, res) => {
    if (!res.locals.session) {
		res.status(401)
        throw new Error("Unauthorized");
	}
	await lucia.invalidateSession(res.locals.session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	res.setHeader("Set-Cookie", sessionCookie.serialize());
    res.status(200).json({ message: "Signed out successfully" });
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    if (!res.locals.user) {
        res.status(401)
        throw new Error("Unauthorized");
    }
    res.status(200).json({ user: res.locals.user });
});

module.exports = {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
};
