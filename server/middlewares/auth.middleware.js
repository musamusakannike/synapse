const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


const authenticate = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Invalid token: user not found" });
        }
        if (!user.isEmailVerified) {
            return res.status(403).json({ message: "Email not verified" });
        }
        req.user = { _id: user._id, id: user._id.toString(), email: user.email };
        return next();
    } catch (error) {
        if (error && error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        if (error && error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { authenticate };