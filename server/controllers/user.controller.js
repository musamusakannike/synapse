const User = require('../models/user.model');
const { Expo } = require('expo-server-sdk');

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
            subscriptionTier: user.subscriptionTier,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/users/push-token - Update Expo push token
const updatePushToken = async (req, res) => {
    try {
        const { expoPushToken } = req.body;
        
        if (!expoPushToken) {
            return res.status(400).json({ message: 'Expo push token is required' });
        }

        // Validate the Expo push token format
        if (!Expo.isExpoPushToken(expoPushToken)) {
            return res.status(400).json({ message: 'Invalid Expo push token format' });
        }

        // Get current user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only update if the token has changed
        if (user.expoPushToken !== expoPushToken) {
            user.expoPushToken = expoPushToken;
            user.expoPushTokenUpdatedAt = new Date();
            await user.save();
        }

        return res.json({ 
            message: 'Push token updated successfully',
            tokenUpdatedAt: user.expoPushTokenUpdatedAt 
        });
    } catch (err) {
        console.error('Error updating push token:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCurrentUser,
    updatePushToken,
};
