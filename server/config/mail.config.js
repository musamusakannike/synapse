const { Resend } = require('resend');
require('dotenv').config();

let resendClient = null;

const getResend = () => {
	if (resendClient) return resendClient;
	const key = process.env.RESEND_API_KEY;
	if (!key) return null;
	resendClient = new Resend(key);
	return resendClient;
};

const sendMail = async (to, subject, html) => {
	const resend = getResend();
	if (!resend) {
		const msg = 'Missing RESEND_API_KEY environment variable. Email not sent.';
		console.warn(msg);
		// Don't throw to keep server usable in dev without keys; return a stub response
		return { ok: false, message: msg };
	}

	if (!process.env.RESEND_FROM_EMAIL) {
		console.warn('Missing RESEND_FROM_EMAIL env var');
	}

	try {
		const res = await resend.emails.send({
			from: process.env.RESEND_FROM_EMAIL,
			to,
			subject,
			html,
		});
		return res;
	} catch (err) {
		console.error('Error sending email', err);
		throw err;
	}
};

module.exports = sendMail;