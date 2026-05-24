# Paystack: Accept Payments

To accept a payment, create a transaction using our API, our client Javascript library (Popup JS), or our Mobile SDKs. Every transaction includes a link that can be used to complete the payment.

---

## Paystack Popup (Javascript)

Paystack Popup is a Javascript library that allows developers to build a secure and convenient payment flow for their web applications. You can add it to your frontend app via CDN, NPM, or Yarn.

### Installation

```bash
# NPM
npm i @paystack/inline-js

# Yarn
yarn add @paystack/inline-js
```

If you used NPM or Yarn, ensure you import the library:

```javascript
import PaystackPop from "@paystack/inline-js";
```

### Integration Process

The integration follows a three-step process:

1. **Initialize transaction**
2. **Complete transaction**
3. **Verify transaction status**

#### 1. Initialize Transaction (Server-side)

Initialize the transaction from your backend to ensure you have full control of the details. Make a `POST` request to the Initialize Transaction API endpoint:

```bash
curl https://api.paystack.co/transaction/initialize \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@email.com",
    "amount": "500000"
  }' \
  -X POST
```

> [!CAUTION]
> **Never** use your secret key in your frontend. All requests to the Paystack API should be initiated from your server.

#### 2. Complete Transaction (Frontend)

After getting the `access_code` from your backend, use Popup to complete the transaction:

```javascript
const popup = new PaystackPop();
popup.resumeTransaction(access_code);
```

#### 3. Verify Transaction Status

Confirm the status using either webhooks or the Verify Transaction endpoint. Check these key parameters:

| Parameter     | Description                                                                               |
| :------------ | :---------------------------------------------------------------------------------------- |
| `data.status` | Indicates if the payment is successful or not.                                            |
| `data.amount` | Indicates the price in the **lowest denomination** of your currency (e.g., Kobo for NGN). |

---

## Redirect Integration

Call the Initialize Transaction API from your server to generate a checkout link, then redirect your users to that link. After payment, users are returned to your `callback_url`.

> [!WARNING]
> Confirm that your server supports **TLSv1.2** for secure connections to Paystack.

### 1. Collect Customer Information

Retrieve information from your database or a form. Email and amount are required.

```html
<form action="/save-order-and-pay" method="POST">
  <input type="hidden" name="user_email" value="<?php echo $email; ?>" />
  <input type="hidden" name="amount" value="<?php echo $amount; ?>" />
  <input type="hidden" name="cartid" value="<?php echo $cartid; ?>" />
  <button type="submit" name="pay_now">Pay Now</button>
</form>
```

### 2. Initialize Transaction (PHP Example)

```php
<?php
  $url = "https://api.paystack.co/transaction/initialize";

  $fields = [
    'email' => "customer@email.com",
    'amount' => "20000",
    'callback_url' => "https://hello.pstk.xyz/callback",
    'metadata' => ["cancel_action" => "https://your-cancel-url.com"]
  ];

  $fields_string = http_build_query($fields);
  $ch = curl_init();

  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Authorization: Bearer YOUR_SECRET_KEY",
    "Cache-Control: no-cache",
  ));

  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $result = curl_exec($ch);
  echo $result;
?>
```

---

## Mobile SDKs

With our mobile SDKs, transactions are initiated on the server and completed within the app using an `access_code`.

### Android SDK (Kotlin)

Add the dependency to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.paystack.android:paystack-ui:0.0.9'
}
```

Implementation:

```kotlin
import com.paystack.android.core.Paystack
import com.paystack.android.ui.paymentsheet.PaymentSheet
import com.paystack.android.ui.paymentsheet.PaymentSheetResult

class MainActivity : AppCompatActivity() {
    private lateinit var paymentSheet: PaymentSheet

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Paystack.builder()
            .setPublicKey("pk_test_xxxx")
            .build()

        paymentSheet = PaymentSheet(this, ::paymentComplete)
    }

    private fun makePayment(accessCode: String) {
        paymentSheet.launch(accessCode)
    }

    private fun paymentComplete(result: PaymentSheetResult) {
        when (result) {
            PaymentSheetResult.Cancelled -> println("Payment Cancelled")
            is PaymentSheetResult.Failed -> println("Error: ${result.error.message}")
            is PaymentSheetResult.Completed -> println("Successful: ${result.paymentCompletionDetails}")
        }
    }
}
```

### iOS SDK (SwiftUI)

Install via Swift Package Manager and implement:

```swift
import SwiftUI
import PaystackCore
import PaystackUI

struct PaymentView: View {
    let paystack = try? PaystackBuilder.newInstance
        .setKey("pk_domain_xxxxxxxx")
        .build()

    var body: some View {
        VStack {
            paystack?.chargeUIButton(accessCode: "0peioxfhpn", onComplete: paymentDone) {
                Text("Initiate Payment")
            }
        }
    }

    func paymentDone(_ result: TransactionResult) {
        print(result)
    }
}
```

---

## Charge API (Custom UI)

The **Create Charge API** allows you to pass payment details (card, mobile money, etc.) directly. This is ideal for custom checkouts or non-smartphone flows (USSD/SMS prompts).

### Sample Payload (Mobile Money)

```json
{
  "amount": 1000,
  "email": "customer@email.com",
  "currency": "GHS",
  "mobile_money": {
    "phone": "0553241149",
    "provider": "MTN"
  }
}
```

### Handling Statuses

| Value           | Next Step                                                        |
| :-------------- | :--------------------------------------------------------------- |
| `pending`       | Wait 10s and call **Check Pending Charge**.                      |
| `timeout`       | Show `data.message` and restart charge.                          |
| `success`       | Provide value to user.                                           |
| `send_birthday` | Prompt user for birthdate and submit to **Submit Birthday API**. |
| `send_otp`      | Prompt user for OTP and submit to **Submit OTP API**.            |
| `failed`        | Transaction failed; no remedy.                                   |

---

## Webhooks

Webhooks notify your server automatically when events happen (like a successful payment).

> [!TIP]
> **Always use webhooks** for delivering value. Client-side callbacks can fail due to network drops or tab closures.

### Create a Webhook URL (Node.js/Express)

```javascript
app.post("/paystack-webhook", function (req, res) {
  const event = req.body;
  // Verify signature and process event here
  res.sendStatus(200); // Always respond with 200 OK
});
```

### Security & Verification

#### 1. Signature Validation (Recommended)

Every request includes an `x-paystack-signature` header (HMAC SHA512 of the payload using your Secret Key).

```javascript
const crypto = require("crypto");
const secret = process.env.PAYSTACK_SECRET_KEY;

app.post("/webhook", (req, res) => {
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash == req.headers["x-paystack-signature"]) {
    const event = req.body;
    // Handle event
  }
  res.sendStatus(200);
});
```

#### 2. IP Whitelisting

Filter incoming requests to only allow these Paystack IPs:

- `52.31.139.75`
- `52.49.173.169`
- `52.214.14.220`

---

## Event Types Reference

| Event                            | Description                                 |
| :------------------------------- | :------------------------------------------ |
| `charge.success`                 | A successful charge was made.               |
| `transfer.success`               | A successful transfer has been completed.   |
| `transfer.failed`                | A transfer you attempted has failed.        |
| `invoice.update`                 | An invoice has been updated (usually paid). |
| `subscription.create`            | A new subscription has been created.        |
| `refund.processed`               | Refund has successfully been processed.     |
| `charge.dispute.create`          | A dispute was logged against your business. |
| `customeridentification.success` | Customer identity validation successful.    |

Verify Payments

In a nutshell

The Verify Transaction API allows you confirm the status of a customer's transaction.

Transaction statuses

Webhooks are the preferred option for confirming a transaction status, but we currently send webhook events for just successful transactions. However, a transaction can have the following statuses:

Status

Meaning

abandoned

The customer hasn't completed the transaction.

failed

The transaction failed. For more information on why, refer to the message/gateway response.

ongoing

The customer is currently trying to carry out an action to complete the transaction. This can get returned when we're waiting on the customer to enter an otp or to make a transfer (for a pay with transfer transaction).

pending

The transaction is currently in progress.

processing

Same as pending, but for direct debit transactions.

queued

The transaction has been queued to be processed later. Only possible on bulk charge transactions.

reversed

The transaction was reversed. This could mean the transaction was refunded, or a chargeback was successfully logged for this transaction.

success

The transaction was successfully processed.

Verify a transaction

You do this by making a GET request to the Verify Transaction API endpoint from your server using your transaction reference. This is dependent on the method you used to initialize the transaction.

From Popup or mobile SDKs

You'll have to send the reference to your server, then from your server you call the verify endpoint.

From the Redirect API

You initiate this request from your callback URL. The transaction reference is returned as a query parameter to your callback URL.

Helpful Tip: If you offer digital value like airtime, wallet top-up, digital credit, etc., always confirm that you haven't already delivered value for that transaction to avoid double fulfillments, especially, if you also use webhooks.

Here's a code sample for verifying transactions:

```#!/bin/sh
curl [https://api.paystack.co/transaction/verify/:reference](https://api.paystack.co/transaction/verify/:reference) \
-H "Authorization: Bearer YOUR_SECRET_KEY" \
-X GET
```

Warning: The API response has a status key response.status indicating the status of the API call. This is not the status of the transaction. The status of the transaction is in the data object in the verify API response, i.e response.data.status. Learn more about Paystack API format.

Charge returning users

The verify response also returns information about the payment instrument that the user paid with in the data.authorization object. If the channel is card, then you can store the authorization_code for that card against that user, and use that charge the user for subsequent transaction. Learn more about recurring charges.
