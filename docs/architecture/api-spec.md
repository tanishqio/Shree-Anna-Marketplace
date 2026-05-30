# Shree Anna - Millets Marketplace API Specification

## Base URL
```
Production: https://api.shreenna.in/v1
Staging: https://staging-api.shreenna.in/v1
```

## Authentication

All API requests require authentication using JWT tokens or API keys.

### Headers
```
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
Content-Type: application/json
Accept-Language: en|hi|te|kn|ta|mr
```

---

## Farmer APIs

### 1. Create Listing

**POST** `/farmers/{farmerId}/listings`

Create a new millet listing.

**Request Body:**
```json
{
  "milletType": "finger|pearl|foxtail|proso|barnyard|kodo|little|browntop|sorghum",
  "quantity": 300,
  "unit": "kg",
  "pricePerKg": 45,
  "qualityGrade": "premium|standard|economy",
  "moistureLevel": 12.5,
  "isOrganic": true,
  "harvestDate": "2024-01-15",
  "images": ["base64_or_url"],
  "voiceNote": "base64_audio",
  "location": {
    "village": "Madanapalle",
    "mandal": "Punganur",
    "district": "Chittoor",
    "state": "Andhra Pradesh",
    "pincode": "517325"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "listingId": "LST-2024-00123",
    "status": "pending_verification",
    "createdAt": "2024-01-20T10:30:00Z",
    "expiresAt": "2024-02-19T10:30:00Z"
  },
  "message": "Listing created successfully"
}
```

### 2. Get Farmer Offers

**GET** `/farmers/{farmerId}/offers`

**Query Parameters:**
- `status`: pending|accepted|rejected
- `page`: 1
- `limit`: 20

**Response:**
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "offerId": "OFR-2024-001",
        "listingId": "LST-2024-00123",
        "buyerId": "BUY-001",
        "buyerName": "Organic Foods Ltd.",
        "buyerRating": 4.8,
        "offeredPrice": 48,
        "quantity": 300,
        "totalValue": 14400,
        "deliveryDate": "2024-02-15",
        "status": "pending",
        "createdAt": "2024-01-22T14:00:00Z",
        "expiresAt": "2024-01-25T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "hasMore": false
    }
  }
}
```

### 3. Accept/Reject Offer

**POST** `/offers/{offerId}/respond`

**Request Body:**
```json
{
  "action": "accept|reject",
  "consent": {
    "type": "voice|otp",
    "audioBase64": "base64_audio_data",
    "duration": 8,
    "otp": "847291",
    "timestamp": "2024-01-22T15:30:00Z"
  },
  "proxyConsent": {
    "proxyId": "PROXY-001",
    "proxyName": "Venkat Kumar",
    "relationship": "FPO Staff"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-2024-001",
    "status": "confirmed",
    "consentId": "VC-001",
    "nextSteps": [
      "Buyer will contact within 24 hours",
      "Prepare produce for pickup"
    ]
  }
}
```

---

## Voice Consent APIs

### 4. Record Voice Consent

**POST** `/consents`

**Request Body:**
```json
{
  "farmerId": "FRM-001",
  "consentType": "offer_accept|listing_create|proxy_consent|kyc_verify|payment_confirm",
  "audioBase64": "base64_audio_data",
  "duration": 8,
  "language": "hi|te|kn|ta|mr|en",
  "relatedEntityId": "OFR-2024-001",
  "proxyInfo": {
    "proxyId": "PROXY-001",
    "proxyName": "Venkat Kumar",
    "relationship": "FPO Staff"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consentId": "VC-001",
    "status": "pending_otp",
    "otpSentTo": "+91 98765 XXXXX",
    "expiresAt": "2024-01-22T15:35:00Z"
  }
}
```

### 5. Verify Consent OTP

**POST** `/consents/{consentId}/verify`

**Request Body:**
```json
{
  "otp": "847291"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consentId": "VC-001",
    "status": "verified",
    "verifiedAt": "2024-01-22T15:32:00Z"
  }
}
```

### 6. Get Consent History

**GET** `/farmers/{farmerId}/consents`

**Query Parameters:**
- `type`: offer_accept|listing_create|proxy_consent|all
- `from`: 2024-01-01
- `to`: 2024-01-31

**Response:**
```json
{
  "success": true,
  "data": {
    "consents": [
      {
        "consentId": "VC-001",
        "type": "offer_accept",
        "audioUrl": "https://storage.shreenna.in/consents/VC-001.mp3",
        "duration": 8,
        "timestamp": "2024-01-22T15:30:00Z",
        "otpVerified": true,
        "relatedEntity": {
          "type": "offer",
          "id": "OFR-2024-001"
        }
      }
    ]
  }
}
```

---

## Offline Sync APIs

### 7. Sync Offline Queue

**POST** `/sync`

**Request Body:**
```json
{
  "deviceId": "DEVICE-001",
  "lastSyncAt": "2024-01-22T10:00:00Z",
  "actions": [
    {
      "localId": "local-001",
      "type": "listing_create",
      "timestamp": "2024-01-22T12:30:00Z",
      "data": { /* listing data */ },
      "retryCount": 0
    },
    {
      "localId": "local-002",
      "type": "offer_accept",
      "timestamp": "2024-01-22T14:00:00Z",
      "data": { /* consent data */ },
      "retryCount": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "syncedAt": "2024-01-22T16:00:00Z",
    "results": [
      {
        "localId": "local-001",
        "serverId": "LST-2024-00124",
        "status": "success"
      },
      {
        "localId": "local-002",
        "serverId": "ORD-2024-002",
        "status": "success"
      }
    ],
    "pendingSync": [],
    "serverUpdates": [
      {
        "type": "price_update",
        "data": { /* updated prices */ }
      }
    ]
  }
}
```

---

## FPO/Batch APIs

### 8. Create Batch

**POST** `/fpo/{fpoId}/batches`

**Request Body:**
```json
{
  "milletType": "finger",
  "collectionCenterId": "CC-001",
  "expectedQuantity": 5000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "BATCH-2024-001",
    "batchCode": "FPO-2024-001",
    "qrCode": "https://api.shreenna.in/qr/FPO-2024-001",
    "status": "collecting"
  }
}
```

### 9. Add Farmer Contribution

**POST** `/batches/{batchId}/contributions`

**Request Body:**
```json
{
  "farmerId": "FRM-001",
  "quantity": 200,
  "qualityGrade": "premium",
  "qcReport": {
    "moistureLevel": 12,
    "foreignMatter": false,
    "insects": false,
    "moldPresent": false,
    "colorConsistency": true,
    "odorNormal": true,
    "notes": ""
  }
}
```

### 10. Submit QC Report

**POST** `/batches/{batchId}/qc`

**Request Body:**
```json
{
  "inspectorId": "INSP-001",
  "moistureLevel": 12.5,
  "foreignMatter": false,
  "insects": false,
  "moldPresent": false,
  "colorConsistency": true,
  "odorNormal": true,
  "grainDamage": false,
  "uniformSize": true,
  "notes": "Good quality batch",
  "images": ["base64_or_url"],
  "passed": true,
  "qualityGrade": "premium"
}
```

---

## Webhooks

### Webhook Events

Configure webhooks at: `/settings/webhooks`

#### Available Events:

| Event | Description |
|-------|-------------|
| `listing.created` | New listing created |
| `listing.verified` | Listing verified by admin |
| `offer.received` | New offer received on listing |
| `offer.accepted` | Farmer accepted an offer |
| `offer.rejected` | Farmer rejected an offer |
| `order.created` | New order created |
| `order.pickup_scheduled` | Pickup scheduled |
| `order.in_transit` | Order is in transit |
| `order.delivered` | Order delivered |
| `payment.initiated` | Payment initiated |
| `payment.completed` | Payment completed |
| `consent.recorded` | Voice consent recorded |
| `consent.verified` | Consent OTP verified |
| `batch.created` | FPO batch created |
| `batch.qc_completed` | QC inspection completed |

### Webhook Payload Format

```json
{
  "event": "offer.accepted",
  "timestamp": "2024-01-22T15:32:00Z",
  "data": {
    "offerId": "OFR-2024-001",
    "listingId": "LST-2024-00123",
    "farmerId": "FRM-001",
    "buyerId": "BUY-001",
    "amount": 14400,
    "consentId": "VC-001"
  },
  "signature": "sha256_hmac_signature"
}
```

### Webhook Security

All webhooks include an HMAC-SHA256 signature in the `X-Webhook-Signature` header.

```javascript
const crypto = require('crypto');
const isValid = (payload, signature, secret) => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === `sha256=${expected}`;
};
```

---

## SMS/Voice Gateway Integration

### Send SMS

**POST** `/notifications/sms`

**Request Body:**
```json
{
  "to": "+919876543210",
  "template": "listing_confirmed|offer_received|payment_completed",
  "language": "hi",
  "variables": {
    "farmerName": "Ramesh",
    "listingId": "LST-2024-00123",
    "amount": "14,400"
  }
}
```

### Send Voice Call

**POST** `/notifications/voice`

**Request Body:**
```json
{
  "to": "+919876543210",
  "template": "weather_alert|price_update|offer_reminder",
  "language": "hi",
  "variables": {
    "message": "कल भारी बारिश की संभावना है"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid or expired token |
| `AUTH_002` | Insufficient permissions |
| `VAL_001` | Validation error |
| `VAL_002` | Required field missing |
| `LISTING_001` | Listing not found |
| `LISTING_002` | Listing expired |
| `OFFER_001` | Offer not found |
| `OFFER_002` | Offer already responded |
| `CONSENT_001` | Consent not found |
| `CONSENT_002` | OTP expired |
| `CONSENT_003` | Invalid OTP |
| `SYNC_001` | Sync conflict |
| `QC_001` | QC already submitted |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| General | 100 req/min |
| Auth | 10 req/min |
| File Upload | 20 req/min |
| Sync | 30 req/min |

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705934400
```
