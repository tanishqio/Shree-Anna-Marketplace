# 📱 Twilio SMS Integration Guide - Shree Anna Marketplace

## Overview

This guide explains how Twilio SMS is integrated into the Shree Anna Marketplace and how to set it up.

---

## 🔧 Step 1: Get Twilio Credentials

### 1.1 Create Twilio Account
1. Go to [twilio.com](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Verify your email and phone number

### 1.2 Get Your Credentials
From the Twilio Console Dashboard, copy:

| Credential | Location | Example |
|------------|----------|---------|
| **Account SID** | Console Dashboard | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| **Auth Token** | Console Dashboard (click to reveal) | `your_auth_token_here` |
| **Phone Number** | Buy a number from Phone Numbers menu | `+1234567890` |

> 💡 **Tip**: For India, you'll need a Twilio number with SMS capability to India, or use their Messaging Service for better delivery.

---

## 🔧 Step 2: Configure Environment

Create/update `.env` file in `backend-python/`:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

> ⚠️ **Important**: Never commit `.env` file to git. It's already in `.gitignore`.

---

## 🔧 Step 3: Install Twilio Package

```bash
cd backend-python
pip install twilio
pip freeze > requirements.txt
```

---

## 📦 Existing SMS Service

The SMS service is already implemented at:

```
backend-python/app/services/sms.py
```

### Key Features:
- ✅ Auto-fallback to mock SMS if Twilio not configured
- ✅ Multilingual templates (Hindi, English, Marathi, Telugu)
- ✅ Message logging for audit
- ✅ Template-based notifications
- ✅ OTP sending with language support

---

## 📋 Available SMS Templates

| Template Key | Event | Parameters |
|--------------|-------|------------|
| `REGISTRATION_SUCCESS` | User registered | `name`, `role` |
| `LISTING_CREATED` | Farmer creates listing | `crop`, `qty_kg`, `price` |
| `LISTING_EXPIRED` | Listing expired | `crop` |
| `LISTING_SOLD` | Listing sold | `crop`, `amount` |
| `OFFER_RECEIVED` | New offer on listing | `buyer`, `crop`, `price` |
| `OFFER_ACCEPTED` | Offer accepted | `crop`, `price` |
| `OFFER_REJECTED` | Offer declined | `crop` |
| `COUNTER_OFFER` | Counter offer sent | `crop`, `price` |
| `ORDER_CONFIRMED` | Order placed | `order_id`, `amount` |
| `PICKUP_SCHEDULED` | Pickup scheduled | `date`, `time`, `location` |
| `DELIVERY_STARTED` | Out for delivery | `order_id`, `time` |
| `DELIVERY_COMPLETED` | Delivered | `order_id` |
| `PAYMENT_RECEIVED` | Payment credited | `amount`, `order_id` |
| `PAYMENT_PENDING` | Payment due | `amount` |
| `PAYMENT_FAILED` | Payment failed | - |
| `COLLECTIVE_LISTING` | FPO collective | `qty_kg`, `crop`, `members` |
| `MEMBER_CONTRIBUTION` | FPO contribution | `member`, `qty_kg`, `crop` |
| `FPO_PAYOUT` | FPO payout | `amount`, `members` |
| `NEW_SCHEME` | Govt scheme | `scheme` |
| `SCHEME_APPROVED` | Scheme approved | `scheme` |
| `SCHEME_REJECTED` | Scheme rejected | `scheme`, `reason` |
| `WEATHER_ALERT` | Weather warning | `alert` |
| `QUALITY_VERIFIED` | Quality check | `crop`, `grade` |
| `PRICE_ALERT` | Price update | `crop`, `price` |

---

## 🔌 How to Use in API Endpoints

### Import the Service

```python
from app.services import send_notification_sms, send_otp_sms
```

### Send OTP

```python
# In auth endpoint
send_otp_sms(
    to="+919876543210",
    otp="123456",
    language="hi"  # Hindi
)
```

### Send Notification

```python
# When farmer creates a listing
send_notification_sms(
    to="+919876543210",
    template_key="LISTING_CREATED",
    params={
        "crop": "Ragi",
        "qty_kg": 500,
        "price": 4500
    },
    language="hi"
)

# When buyer makes an offer
send_notification_sms(
    to=farmer_phone,
    template_key="OFFER_RECEIVED",
    params={
        "buyer": "Ramesh Trading Co.",
        "crop": "Ragi",
        "price": 4200
    },
    language="hi"
)
```

---

## 🗺️ Where to Add SMS Calls

Here's where SMS should be sent in the codebase:

### 1. Authentication (`app/api/v1/auth.py`)
```python
# Already implemented - OTP sending
from app.services import send_otp_sms
send_otp_sms(phone, otp, language)
```

### 2. User Registration (`app/api/v1/users.py`)
```python
# After onboarding success
from app.services import send_notification_sms

@router.post("/onboard/{role}")
async def onboard_user(...):
    # ... onboarding logic ...
    
    # Send welcome SMS
    send_notification_sms(
        to=user.phone,
        template_key="REGISTRATION_SUCCESS",
        params={"name": user.name, "role": role},
        language=user.language or "hi"
    )
```

### 3. Listings (`app/api/v1/listings.py`)
```python
# After creating a listing
send_notification_sms(
    to=farmer.phone,
    template_key="LISTING_CREATED",
    params={
        "crop": listing.crop,
        "qty_kg": listing.qty_kg,
        "price": listing.price_per_qtl
    },
    language=farmer.language
)
```

### 4. Offers (`app/api/v1/offers.py`)
```python
# When offer is created
send_notification_sms(
    to=farmer.phone,
    template_key="OFFER_RECEIVED",
    params={
        "buyer": buyer.name,
        "crop": listing.crop,
        "price": offer.price_per_qtl
    },
    language=farmer.language
)

# When offer is accepted
send_notification_sms(
    to=buyer.phone,
    template_key="OFFER_ACCEPTED",
    params={
        "crop": listing.crop,
        "price": offer.price_per_qtl
    },
    language=buyer.language
)
```

### 5. Orders (`app/api/v1/orders.py`)
```python
# Order confirmed
send_notification_sms(
    to=buyer.phone,
    template_key="ORDER_CONFIRMED",
    params={"order_id": order.id, "amount": order.total_amount},
    language=buyer.language
)

# Pickup scheduled
send_notification_sms(
    to=farmer.phone,
    template_key="PICKUP_SCHEDULED",
    params={
        "date": "15 Dec 2024",
        "time": "10:00 AM",
        "location": farmer.village
    },
    language=farmer.language
)
```

### 6. Payments (`app/api/v1/payments.py`)
```python
# Payment received
send_notification_sms(
    to=farmer.phone,
    template_key="PAYMENT_RECEIVED",
    params={
        "amount": payment.amount,
        "order_id": payment.order_id
    },
    language=farmer.language
)
```

---

## 📊 SMS Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SMS NOTIFICATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │  User   │ ──► │   OTP   │ ──► │ Welcome │
   │ SignUp  │     │   SMS   │     │   SMS   │
   └─────────┘     └─────────┘     └─────────┘

2. LISTING FLOW
   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
   │ Create  │ ──► │ Listing │     │  Offer  │ ──► │ Accept/ │
   │ Listing │     │ Created │     │Received │     │ Reject  │
   └─────────┘     └─────────┘     └─────────┘     └─────────┘
        │                               │               │
        │                               │               ▼
        │                               │         ┌─────────┐
        │                               │         │  Order  │
        │                               │         │Confirmed│
        │                               │         └─────────┘
        │                               │               │
        ▼                               │               ▼
   ┌─────────┐                          │         ┌─────────┐
   │ Listing │                          │         │ Pickup  │
   │ Expired │                          │         │Scheduled│
   └─────────┘                          │         └─────────┘
                                        │               │
                                        │               ▼
                                        │         ┌─────────┐
                                        │         │Delivery │
                                        │         │Complete │
                                        │         └─────────┘
                                        │               │
                                        │               ▼
                                        │         ┌─────────┐
                                        │         │ Payment │
                                        └───────► │Received │
                                                  └─────────┘
```

---

## 🧪 Testing SMS

### Mock Mode (Default)
When Twilio credentials are not set, SMS messages are logged to console:

```
[MOCK SMS] To: +919876543210, Message: ✅ लिस्टिंग बनाई गई: Ragi...
```

### Production Mode
Set all three Twilio env vars to enable real SMS sending.

### Check Sent SMS
All SMS (mock and real) are logged in:
```
backend-python/data/sent_sms.json
```

---

## 💰 Twilio Pricing (India)

| Type | Cost |
|------|------|
| Outbound SMS to India | ~$0.0485 per message |
| Phone number (toll-free) | ~$2/month |

> 💡 **Tip**: Use Twilio's free trial credits ($15.50) for testing.

---

## 📱 WhatsApp Alternative

For better delivery in India, consider Twilio WhatsApp API:
- Better delivery rates
- Free to receive
- Supports media messages

```python
# WhatsApp message (similar API)
client.messages.create(
    body="Your message",
    from_='whatsapp:+14155238886',
    to='whatsapp:+919876543210'
)
```

---

## 🔒 Security Best Practices

1. **Never hardcode credentials** - Use environment variables
2. **Rate limit OTP requests** - Already configured (3/hour)
3. **Log all SMS** - For audit trail
4. **Validate phone numbers** - Before sending
5. **Use templates** - Prevent injection attacks

---

## 🚀 Quick Start Checklist

- [ ] Create Twilio account
- [ ] Copy Account SID, Auth Token, Phone Number
- [ ] Add to `.env` file
- [ ] Install `twilio` package
- [ ] Restart backend server
- [ ] Test with mock mode first
- [ ] Enable production mode when ready

---

## Need Help?

- **Twilio Docs**: [twilio.com/docs/sms](https://www.twilio.com/docs/sms)
- **India SMS Guide**: [twilio.com/docs/sms/send-messages-to-india](https://www.twilio.com/docs/sms/send-messages-to-india)
