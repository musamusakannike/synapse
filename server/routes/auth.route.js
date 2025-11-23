const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendVerificationCode, verifyCode, googleAuth, googleOAuthWithToken, githubAuth } = require('../controllers/auth.controller');

const router = express.Router();

router.post(
	'/',
	[body('email').isEmail().withMessage('Valid email required')],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		return sendVerificationCode(req, res);
	}
);

router.post(
	'/verify',
	[
		body('email').isEmail().withMessage('Valid email required'),
		body('code').isLength({ min: 6, max: 6 }).withMessage('6 digit code required'),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		return verifyCode(req, res);
	}
);

router.post(
  '/google',
  [body('idToken').isString().withMessage('idToken is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return googleAuth(req, res);
  }
);

router.post(
  '/google-token',
  [
    body('accessToken').isString().withMessage('accessToken is required'),
    body('userInfo').isObject().withMessage('userInfo is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return googleOAuthWithToken(req, res);
  }
);

router.post(
  '/github',
  [body('idToken').isString().withMessage('idToken is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    return githubAuth(req, res);
  }
);

module.exports = router;