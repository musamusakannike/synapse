import jwt from "jsonwebtoken";

// Lazy load JWT config to ensure environment variables are loaded
const getJWTConfig = () => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    
    return { JWT_SECRET, JWT_EXPIRES_IN };
};

// Generate JWT token
export const generateToken = (userId) => {
    const { JWT_SECRET, JWT_EXPIRES_IN } = getJWTConfig();
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token) => {
    try {
        const { JWT_SECRET } = getJWTConfig();
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Extract token from Authorization header or cookie
export const extractToken = (req) => {
    // Check Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }

    // Check cookies as fallback
    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookie = cookies
            .split(";")
            .find(cookie => cookie.trim().startsWith("token="));
        
        if (tokenCookie) {
            return tokenCookie.split("=")[1];
        }
    }

    return null;
};