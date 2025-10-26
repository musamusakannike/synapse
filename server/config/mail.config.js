const { google } = require('googleapis');
require('dotenv').config();

let oauth2Client = null;

const getOAuth2Client = () => {
	if (oauth2Client) return oauth2Client;
	
	const clientId = process.env.GMAIL_CLIENT_ID;
	const clientSecret = process.env.GMAIL_CLIENT_SECRET;
	const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
	
	if (!clientId || !clientSecret || !refreshToken) {
		return null;
	}
	
	oauth2Client = new google.auth.OAuth2(
		clientId,
		clientSecret,
		'https://developers.google.com/oauthplayground'
	);
	
	oauth2Client.setCredentials({
		refresh_token: refreshToken
	});
	
	return oauth2Client;
};

const sendMail = async (to, subject, html) => {
	const auth = getOAuth2Client();
	
	if (!auth) {
		const msg = 'Missing Gmail API credentials (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN). Email not sent.';
		console.warn(msg);
		// Don't throw to keep server usable in dev without keys; return a stub response
		return { ok: false, message: msg };
	}

	if (!process.env.GMAIL_FROM_EMAIL) {
		console.warn('Missing GMAIL_FROM_EMAIL env var');
	}

	try {
		const gmail = google.gmail({ version: 'v1', auth });
		
		// Create email message in RFC 2822 format
		const fromEmail = process.env.GMAIL_FROM_EMAIL || 'noreply@example.com';
		const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
		const messageParts = [
			`From: ${fromEmail}`,
			`To: ${to}`,
			'Content-Type: text/html; charset=utf-8',
			'MIME-Version: 1.0',
			`Subject: ${utf8Subject}`,
			'',
			html
		];
		const message = messageParts.join('\n');
		
		// Encode message in base64url format
		const encodedMessage = Buffer.from(message)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
		
		const res = await gmail.users.messages.send({
			userId: 'me',
			requestBody: {
				raw: encodedMessage
			}
		});
		
		return { ok: true, id: res.data.id, message: 'Email sent successfully' };
	} catch (err) {
		console.error('Error sending email via Gmail API', err);
		throw err;
	}
};

module.exports = sendMail;