import { verifyToken, extractToken } from "../config/jwt.config.js";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            res.locals.user = null;
            return next();
        }

        const decoded = verifyToken(token);
        
        if (!decoded) {
            res.locals.user = null;
            return next();
        }

        // Get user from database
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            res.locals.user = null;
            return next();
        }

        res.locals.user = user;
        return next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.locals.user = null;
        return next();
    }
};
