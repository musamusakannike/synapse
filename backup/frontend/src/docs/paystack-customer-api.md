# Paystack Customers API

The Customers API allows you create and manage customers on your integration.

## Create Customer
Create a customer on your integration

Customer Validation
The first_name, last_name and phone are optional parameters. However, when creating a customer that would be assigned a Dedicated Virtual Account and your business category falls under Betting, Financial services, and General Service, then these parameters become compulsory.

Headers
authorization
String
Set value to Bearer SECRET_KEY

content-type
String
Set value to application/json

Body Parameters
email
String
Customer's email address

first_name
String
Customer's first name

last_name
String
Customer's last name

phone
String
optional
Customer's phone number

metadata
Object
optional
A set of key/value pairs that you can attach to the customer. It can be used to store additional information in a structured format.


REQUEST: ```const https = require('https')

const params = JSON.stringify({
  "email": "customer@email.com",
  "first_name": "Zero",
  "last_name": "Sum",
  "phone": "+2348123456789"
})

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/customer',
  method: 'POST',
  headers: {
    Authorization: 'Bearer SECRET_KEY',
    'Content-Type': 'application/json'
  }
}

const req = https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})

req.write(params)
req.end()
```

RESPONSE: ```
{
  "status": true,
  "message": "Customer created",
  "data": {
    "email": "customer@email.com",
    "integration": 100032,
    "domain": "test",
    "customer_code": "CUS_xnxdt6s1zg1f4nx",
    "id": 1173,
    "identified": false,
    "identifications": null,
    "createdAt": "2016-03-29T20:03:09.584Z",
    "updatedAt": "2016-03-29T20:03:09.584Z"
  }
}
```


## List Customer

List customers available on your integration.

Headers
authorization
String
Set value to Bearer SECRET_KEY

Query Parameters
perPage
Integer
Specify how many records you want to retrieve per page. If not specified, we use a default value of 50.

page
Integer
Specify exactly what page you want to retrieve. If not specified, we use a default value of 1.

from
Datetime
optional
A timestamp from which to start listing customers e.g. 2016-09-24T00:00:05.000Z, 2016-09-21

to
Datetime
optional
A timestamp at which to stop listing customers e.g. 2016-09-24T00:00:05.000Z, 2016-09-21

REQUEST: ```
const https = require('https')

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/customer',
  method: 'GET',
  headers: {
    Authorization: 'Bearer SECRET_KEY'
  }
}

https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})

```

RESPONSE: ```
{
  "status": true,
  "message": "Customers retrieved",
  "data": [
    {
      "integration": 463433,
      "first_name": null,
      "last_name": null,
      "email": "dom@gmail.com",
      "phone": null,
      "metadata": null,
      "domain": "test",
      "customer_code": "CUS_c6wqvwmvwopw4ms",
      "risk_action": "default",
      "id": 90758908,
      "createdAt": "2022-08-15T13:46:39.000Z",
      "updatedAt": "2022-08-15T13:46:39.000Z"
    },
    {
      "integration": 463433,
      "first_name": "Okiki",
      "last_name": "Sample",
      "email": "okiki@sample.com",
      "phone": "09048829123",
      "metadata": {},
      "domain": "test",
      "customer_code": "CUS_rki2ccocw7g8lsj",
      "risk_action": "default",
      "id": 90758301,
      "createdAt": "2022-08-15T13:42:52.000Z",
      "updatedAt": "2022-08-15T13:42:52.000Z"
    },
    {
      "integration": 463433,
      "first_name": "lukman",
      "last_name": "calle",
      "email": "lukman@calle.co",
      "phone": "08922383034",
      "metadata": {},
      "domain": "test",
      "customer_code": "CUS_hpxsz8c1if90quo",
      "risk_action": "default",
      "id": 90747194,
      "createdAt": "2022-08-15T12:31:13.000Z",
      "updatedAt": "2022-08-15T12:31:13.000Z"
    }
  ],
  "meta": {
    "next": "Y3VzdG9tZXI6OTAyMjU4MDk=",
    "previous": null,
    "perPage": 3
  }
}
```

## Fetch Customer

Get details of a customer on your integration.


Headers
authorization
String
Set value to Bearer SECRET_KEY

Path Parameters
email_or_code
String
An email or customer code for the customer you want to fetch

REQUEST: ```
const https = require('https')

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/customer/:email_or_code',
  method: 'GET',
  headers: {
    Authorization: 'Bearer SECRET_KEY'
  }
}

https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})
```

RESPONSE: ```
{
  "status": true,
  "message": "Customer retrieved",
  "data": {
    "transactions": [],
    "subscriptions": [],
    "authorizations": [
      {
        "authorization_code": "AUTH_ekk8t49ogj",
        "bin": "408408",
        "last4": "4081",
        "exp_month": "12",
        "exp_year": "2030",
        "channel": "card",
        "card_type": "visa ",
        "bank": "TEST BANK",
        "country_code": "NG",
        "brand": "visa",
        "reusable": true,
        "signature": "SIG_yEXu7dLBeqG0kU7g95Ke",
        "account_name": null
      }
    ],
    "first_name": null,
    "last_name": null,
    "email": "dom@gmail.com",
    "phone": null,
    "metadata": null,
    "domain": "test",
    "customer_code": "CUS_c6wqvwmvwopw4ms",
    "risk_action": "default",
    "id": 90758908,
    "integration": 463433,
    "createdAt": "2022-08-15T13:46:39.000Z",
    "updatedAt": "2022-08-15T13:46:39.000Z",
    "created_at": "2022-08-15T13:46:39.000Z",
    "updated_at": "2022-08-15T13:46:39.000Z",
    "total_transactions": 0,
    "total_transaction_value": [],
    "dedicated_account": null,
    "identified": false,
    "identifications": null
  }
}
```

## Validate Customer

Validate a customer's identity

Headers
authorization
String
Set value to Bearer SECRET_KEY

content-type
String
Set value to application/json

Body Parameters
first_name
String
Customer's first name

last_name
String
Customer's last name

type
String
Predefined types of identification. Only bank_account is supported at the moment

value
String
Customer's identification number

country
String
2 letter country code of identification issuer

bvn
String
Customer's Bank Verification Number

bank_code
String
You can get the list of Bank Codes by calling the List Banks endpoint. (required if type is bank_account)

account_number
String
Customer's bank account number. (required if type is bank_account)

middle_name
String
optional
Customer's middle name

REQUEST: ```
const https = require('https')

const params = JSON.stringify({
  "country": "NG",
  "type": "bank_account",
  "account_number": "0123456789",
  "bvn": "20012345677",
  "bank_code": "007",
  "first_name": "Asta",
  "last_name": "Lavista"

})

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/customer/{customer_code}/identification',
  method: 'POST',
  headers: {
    Authorization: 'Bearer SECRET_KEY',
    'Content-Type': 'application/json'
  }
}

const req = https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})

req.write(params)
req.end()
```

RESPONSE: ```
{
  "status": true,
  "message": "Customer Identification in progress"
}
```