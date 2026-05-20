const { Resend } = require('resend');
require('dotenv').config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendMail = async (to, subject, html) => {
	if (!resend) {
		const msg = 'Missing RESEND_API_KEY env var. Email not sent.';
		console.warn(msg);
		// Don't throw to keep server usable in dev without keys; return a stub response
		return { ok: false, message: msg };
	}

	const fromEmail = process.env.FROM_EMAIL || 'noreply@synapse.codiac.online';
	const fromName = process.env.FROM_NAME || 'Synapse AI';

	try {
		const { data, error } = await resend.emails.send({
			from: `${fromName} <${fromEmail}>`,
			to: [to],
			subject,
			html,
		});

		if (error) {
			console.error('Resend email error:', error);
			throw new Error(error.message);
		}

		return { ok: true, id: data?.id, message: 'Email sent successfully' };
	} catch (err) {
		console.error('Error sending email via Resend', err);
		throw err;
	}
};

module.exports = sendMail;