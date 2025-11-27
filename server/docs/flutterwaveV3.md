# Flutterwave V3 Integration Guide

This is a comprehensive guide to integrating **Flutterwave V3** into a Node.js Express application. It covers the **Standard Payment Flow** (redirecting the user to a secure payment page) and **Webhook Verification** (ensuring you get paid even if the user closes their browser).

## **Prerequisites**

1. **Node.js & Express** installed.
2. **Flutterwave Account** : Sign up and get your API Keys from the [Flutterwave Dashboard](https://www.google.com/search?q=https://dashboard.flutterwave.com/dashboard/settings/apis).
3. **API Keys** : You need your  **Public Key** ,  **Secret Key** , and  **Secret Hash** .

---

### **1. Project Setup**

Install the official Flutterwave Node.js SDK and other necessary packages:

```bash
npm install flutterwave-node-v3 dotenv express body-parser cors
```

Create a `.env` file in your project root to store your keys securely:

```.env
FLW_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxxxxxxx-X
FLW_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxxx-X
FLW_SECRET_HASH=your_super_secret_hash_string
PORT=3000
```

> **Note on Secret Hash:** You create this string yourself (e.g., `my_secure_app_v1`). You must also enter this exact string in your  **Flutterwave Dashboard > Settings > Webhooks** .

---

### **2. Initialization**

Create a `paymentController.js` (or similar) to handle the logic.

```javascript
// paymentController.js
const Flutterwave = require('flutterwave-node-v3');
require('dotenv').config();

// Initialize the SDK
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

// Generate a unique transaction reference
const createTxRef = () => {
    return 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
};

module.exports = { flw, createTxRef };
```

---

### **3. Implementation: The Standard Payment Flow**

This flow involves three steps:

1. **Initiate:** Frontend sends payment details -> Backend creates link -> Backend sends link to Frontend.
2. **Redirect:** Frontend redirects user to the link -> User pays on Flutterwave.
3. **Callback:** Flutterwave redirects user back to your site -> Backend verifies the transaction.

#### **A. Initiate Payment Route**

```javascript
// server.js (or routes file)
const express = require('express');
const { flw, createTxRef } = require('./paymentController');
const app = express();

app.use(express.json());

// 1. INITIATE PAYMENT
app.post('/api/pay', async (req, res) => {
    try {
        const { email, amount, name, phone_number } = req.body;

        const payload = {
            tx_ref: createTxRef(), // Unique reference for this transaction
            amount: amount,
            currency: 'NGN',
            payment_options: 'card, banktransfer, ussd',
            redirect_url: 'http://localhost:3000/api/verify-payment', // URL to redirect to after payment
            customer: {
                email: email,
                phonenumber: phone_number,
                name: name,
            },
            customizations: {
                title: 'My Store',
                description: 'Payment for items in cart',
                logo: 'https://assets.piedpiper.com/logo.png',
            },
        };

        const response = await flw.Payment.standard(payload);

        // Check if the link generation was successful
        if (response.status === 'success') {
            // Send the payment link to the frontend
            res.json({ status: 'success', link: response.data.link });
        } else {
            res.status(400).json({ status: 'error', message: 'Could not generate payment link' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
```

#### **B. Handle Redirect & Verification (Frontend Feedback)**

When the user finishes paying, Flutterwave redirects them to the `redirect_url` you specified. This route should verify the transaction status before showing a success page.

```javascript
// 2. VERIFY PAYMENT (Redirect Handler)
app.get('/api/verify-payment', async (req, res) => {
    try {
        // Flutterwave appends ?status=successful&tx_ref=...&transaction_id=... to the URL
        const { status, transaction_id, tx_ref } = req.query;

        if (status === 'successful' || status === 'completed') {
            // Additional check: Verify strictly with the server
            const response = await flw.Transaction.verify({ id: transaction_id });

            if (
                response.data.status === "successful" &&
                response.data.amount >= 1000 && // VALIDATE THE AMOUNT THE USER PAID
                response.data.currency === "NGN"
            ) {
                // Success! Update your database here (give value to user)
                // db.orders.update({ tx_ref }, { status: 'paid' });

                res.send("<h1>Payment Successful! Value updated.</h1>");
            } else {
                res.status(400).send("<h1>Verification failed: Amount mismatch or failed status</h1>");
            }
        } else {
            res.status(400).send("<h1>Payment Failed or Cancelled</h1>");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
```

---

### **4. Critical: Webhook Implementation**

**Why this is mandatory:** If a user pays but closes their tab *before* redirecting back to your site, the verify route above will never run. Webhooks solve this by having Flutterwave send a background notification to your server.

**Note on Security:** You must verify the `verif-hash` header to ensure the request actually came from Flutterwave.

```javascript
// 3. WEBHOOK ENDPOINT
app.post('/flw-webhook', async (req, res) => {
    // 1. Verify the signature
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== secretHash) {
        // This request isn't from Flutterwave; discard it
        return res.status(401).end();
    }

    const payload = req.body;

    // 2. Handle the event
    // It's good practice to handle 'charge.completed' events
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
        const transactionId = payload.data.id;
        const txRef = payload.data.tx_ref;

        // 3. Double-check verification (Optional but Recommended)
        // Webhooks can sometimes be duplicated, verification ensures idempotency
        try {
            const response = await flw.Transaction.verify({ id: transactionId });
          
            if (response.data.status === "successful" && response.data.amount === payload.data.amount) {
                console.log(`Payment successful for ref: ${txRef}`);
              
                // TODO: Update your database here
                // IMPORTANT: Check if you have already given value for this reference 
                // to avoid giving value twice (Idempotency).
            }
        } catch (error) {
            console.error('Verification failed inside webhook', error);
        }
    }

    // 4. Acknowledge receipt immediately (within 10 seconds)
    res.status(200).end();
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
```

---

### **5. Testing Checklist**

1. **Use Test Cards:** While in Test Mode, do not use your real ATM card. Use [Flutterwave Test Cards](https://www.google.com/search?q=https://developer.flutterwave.com/docs/integration-guides/testing-helpers).
2. **Expose Localhost:** To test Webhooks on your local machine, use a tool like  **Ngrok** .
   * Run: `ngrok http 3000`
   * Copy the HTTPS URL (e.g., `https://random.ngrok-free.app`)
   * Add `/flw-webhook` to it.
   * Paste this full URL into your Flutterwave Dashboard Webhook Settings.
3. **Validate Amount:** Always compare the `amount` returned in the verification response against the `amount` you expected the user to pay. This prevents users from manipulating the frontend to pay 1 NGN for a 1000 NGN item.

### **Relevant Video Resource**

... [Integrate Flutterwave Payment Gateway in Node.js](https://www.google.com/search?q=https://www.youtube.com/watch%3Fv%3DP2lYykNqCqo) ...

This video provides a visual walkthrough of setting up the Flutterwave Node.js SDK and managing the payment flow, which complements the code examples above.
