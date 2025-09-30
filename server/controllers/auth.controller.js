
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const sendMail = require('../config/mail.config');
const admin = require('../config/firebaseAdmin');

const generateCode = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth - request code (login or register)
const sendVerificationCode = async (req, res) => {
	const { email } = req.body;
	if (!email) return res.status(400).json({ message: 'Email is required' });

	try {
		let user = await User.findOne({ email });
		if (!user) {
			user = new User({ email });
		}

		const code = generateCode();
		user.emailVerificationToken = code;
		// expire in 10 minutes
		user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
		await user.save();

		const subject = 'Your verification code';
		const html = `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`;

		await sendMail(email, subject, html);

		return res.json({ message: 'Verification code sent' });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Server error' });
	}
};

// POST /api/auth/verify - verify code and return access token
const verifyCode = async (req, res) => {
	const { email, code } = req.body;
	if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: 'Invalid email or code' });

		if (!user.emailVerificationToken || !user.emailVerificationExpires) {
			return res.status(400).json({ message: 'No verification requested' });
		}

		if (user.emailVerificationExpires < Date.now()) {
			return res.status(400).json({ message: 'Verification code expired' });
		}

		if (user.emailVerificationToken !== code) {
			return res.status(400).json({ message: 'Invalid verification code' });
		}

		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpires = undefined;
		user.lastLogin = Date.now();
		await user.save();

		const payload = { id: user._id, email: user.email };
		const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

		return res.json({ accessToken: token });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Server error' });
	}
};

module.exports = {
	sendVerificationCode,
	verifyCode,
	// Verify Firebase ID token (Google) and issue our JWT
	googleAuth: async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      const uid = decoded.uid;
      const email = decoded.email;
      const name = decoded.name;
      const picture = decoded.picture;

      if (!email) {
        return res.status(400).json({ message: 'Email not present in token' });
      }

      let user = await User.findOne({ $or: [{ googleId: uid }, { email }] });
      if (!user) {
        user = new User({ email });
      }

      // Update fields from Google profile
      user.googleId = uid;
      if (name) user.name = name;
      if (picture) user.profilePicture = picture;
      user.isEmailVerified = true;
      user.lastLogin = Date.now();
      await user.save();

      const payload = { id: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ accessToken: token });
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }
  },
  // Verify Firebase ID token (GitHub) and issue our JWT
  githubAuth: async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      const uid = decoded.uid;
      const email = decoded.email;
      const name = decoded.name;
      const picture = decoded.picture;

      if (!email) {
        return res.status(400).json({ message: 'Email not present in token' });
      }

      let user = await User.findOne({ $or: [{ githubId: uid }, { email }] });
      if (!user) {
        user = new User({ email });
      }

      // Update fields from GitHub profile
      user.githubId = uid;
      if (name) user.name = name;
      if (picture) user.profilePicture = picture;
      user.isEmailVerified = true;
      user.lastLogin = Date.now();
      await user.save();

      const payload = { id: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      return res.json({ accessToken: token });
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }
  }
};

