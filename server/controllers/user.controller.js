const User = require('../models/user.model');

// GET /api/users/me - Get current authenticated user's profile
const getCurrentUser = async (req, res) => {
    try {
        // req.user is set by the authenticate middleware
        const user = await User.findById(req.user.id).select('-emailVerificationToken -emailVerificationExpires');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            profilePicture: user.profilePicture,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCurrentUser,
};
