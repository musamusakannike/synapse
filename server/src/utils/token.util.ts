import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload: { id: string; role: string }): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
