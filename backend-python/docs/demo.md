# Shree Anna — Demo Walkthrough

This guide walks you through a complete demo of the Shree Anna backend, showcasing the full millet value chain from farmer to consumer.

---

## 🎬 Demo Scenario

**Story**: A farmer in Karnataka grows Ragi (Finger Millet), sells it through an FPO, and the consumer can trace the entire journey via QR code.

### Characters

| Role | Phone | Description |
|------|-------|-------------|
| Farmer | +919876543210 | Ragi farmer in Tumkur |
| FPO | +919876543211 | Karnataka Millet FPO |
| Buyer | +919876543212 | Organic food retailer |
| Consumer | - | Scans QR code |

---

## 🚀 Setup

### 1. Start the Server

```bash
cd backend-python
make dev
```

### 2. Seed Demo Data (Optional)

```bash
make seed
```

This creates demo users, farmers, FPOs, and sample listings.

---

## 📱 Demo Flow

### Step 1: Farmer Onboarding

```bash
# Request OTP
curl -X POST http://localhost:8005/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Response
{
  "message": "OTP sent successfully",
  "expires_in": 600
}
```

```bash
# Verify OTP (use 123456 in mock mode)
curl -X POST http://localhost:8005/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'

# Response - Save the access_token!
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "phone": "+919876543210",
    "roles": ["farmer"]
  }
}
```

Save the token:
```bash
export FARMER_TOKEN="eyJ..."
```

### Step 2: Complete Farmer Profile

```bash
curl -X POST http://localhost:8005/api/v1/users/farmer-profile \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ramesh Kumar",
    "village": "Sira",
    "district": "Tumkur",
    "state": "Karnataka",
    "land_acres": 5.5,
    "crops": ["ragi", "jowar", "bajra"],
    "aadhaar_last_4": "1234",
    "language_pref": "kn"
  }'
```

### Step 3: Create Listing

```bash
curl -X POST http://localhost:8005/api/v1/listings \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "ragi",
    "variety": "GPU-28",
    "quantity_kg": 500,
    "price_per_kg": 42.50,
    "harvest_date": "2024-01-10",
    "description": "Premium organic Ragi from Tumkur",
    "is_organic": true,
    "location_lat": 13.5231,
    "location_lng": 76.9029
  }'

# Response
{
  "id": "listing-uuid",
  "crop_type": "ragi",
  "status": "active",
  ...
}
```

Save the listing ID:
```bash
export LISTING_ID="listing-uuid"
```

### Step 4: Create Batch with Traceability

```bash
curl -X POST http://localhost:8005/api/v1/batches \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"listing_id\": \"$LISTING_ID\",
    \"quantity_kg\": 100,
    \"msp_price_per_kg\": 45.50
  }"

# Response
{
  "id": "batch-uuid",
  "trace_code": "SA-RG-TK-20240115-001",
  "qr_code_url": "/uploads/qr/SA-RG-TK-20240115-001.png",
  "status": "created",
  ...
}
```

Save:
```bash
export BATCH_ID="batch-uuid"
export TRACE_CODE="SA-RG-TK-20240115-001"
```

### Step 5: Add Trace Events

**Harvest Event:**
```bash
curl -X POST "http://localhost:8005/api/v1/batches/$BATCH_ID/events" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "harvested",
    "payload": {
      "field_id": "F-001",
      "harvest_method": "manual",
      "weather": "sunny"
    },
    "location_lat": 13.5231,
    "location_lng": 76.9029
  }'
```

**Quality Check (by FPO):**
```bash
# Login as FPO first, then:
curl -X POST "http://localhost:8005/api/v1/batches/$BATCH_ID/events" \
  -H "Authorization: Bearer $FPO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "quality_checked",
    "payload": {
      "grade": "A",
      "moisture_percent": 12.5,
      "foreign_matter_percent": 0.2,
      "inspector": "Quality Officer",
      "certificate_id": "QC-2024-001"
    },
    "location_lat": 13.5200,
    "location_lng": 76.9000
  }'
```

**Packed Event:**
```bash
curl -X POST "http://localhost:8005/api/v1/batches/$BATCH_ID/events" \
  -H "Authorization: Bearer $FPO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "packed",
    "payload": {
      "package_type": "25kg_bag",
      "package_count": 4,
      "lot_number": "LOT-2024-001"
    },
    "location_lat": 13.5200,
    "location_lng": 76.9000
  }'
```

**Shipped Event:**
```bash
curl -X POST "http://localhost:8005/api/v1/batches/$BATCH_ID/events" \
  -H "Authorization: Bearer $FPO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "shipped",
    "payload": {
      "vehicle_number": "KA-01-AB-1234",
      "driver_name": "Kumar",
      "driver_phone": "+919876543299",
      "destination": "Bangalore Organic Store"
    },
    "location_lat": 13.5200,
    "location_lng": 76.9000
  }'
```

**Delivered Event (by Buyer):**
```bash
curl -X POST "http://localhost:8005/api/v1/batches/$BATCH_ID/events" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "delivered",
    "payload": {
      "received_by": "Store Manager",
      "condition": "good",
      "weight_verified": true
    },
    "location_lat": 12.9716,
    "location_lng": 77.5946
  }'
```

### Step 6: Consumer Traces Product (Public API)

```bash
curl "http://localhost:8005/api/v1/batches/trace/$TRACE_CODE"

# Response
{
  "batch": {
    "trace_code": "SA-RG-TK-20240115-001",
    "crop_type": "ragi",
    "variety": "GPU-28",
    "quantity_kg": 100,
    "is_organic": true,
    "farmer": {
      "name": "Ramesh Kumar",
      "village": "Sira",
      "district": "Tumkur"
    },
    "fpo": {
      "name": "Karnataka Millet FPO"
    }
  },
  "journey": [
    {
      "event_type": "harvested",
      "timestamp": "2024-01-10T08:00:00Z",
      "location": "Sira, Tumkur",
      "verified": true
    },
    {
      "event_type": "quality_checked",
      "timestamp": "2024-01-11T10:00:00Z",
      "details": {
        "grade": "A",
        "moisture": "12.5%"
      },
      "verified": true
    },
    ...
  ],
  "verification": {
    "chain_valid": true,
    "all_signatures_valid": true,
    "tamper_detected": false
  }
}
```

---

## 📞 Voice Bot Demo

### IVR Flow (via Reverie)

1. User calls toll-free number
2. Webhook triggers:

```bash
# Simulated webhook call
curl -X POST http://localhost:8005/api/v1/voice/webhook \
  -H "Content-Type: application/json" \
  -H "X-Reverie-Signature: <hmac-signature>" \
  -d '{
    "call_id": "call-123",
    "caller": "+919876543210",
    "event": "call_start"
  }'
```

3. Language selection:
```bash
curl -X POST http://localhost:8005/api/v1/voice/language \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "call-123",
    "caller": "+919876543210",
    "input": "2"
  }'

# Response
{
  "action": "speak",
  "text": "ನಮಸ್ಕಾರ! ಶ್ರೀ ಅನ್ನ ಗೆ ಸ್ವಾಗತ...",
  "language": "kn"
}
```

4. Mandi prices:
```bash
curl -X POST http://localhost:8005/api/v1/voice/mandi-prices \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "call-123",
    "language": "kn",
    "crop": "ragi",
    "district": "Tumkur"
  }'

# Response
{
  "action": "speak",
  "text": "ತುಮಕೂರು ಜಿಲ್ಲೆಯಲ್ಲಿ ರಾಗಿ ಬೆಲೆ ₹42 ಪ್ರತಿ ಕೆಜಿ...",
  "language": "kn"
}
```

---

## 📴 Offline Sync Demo

### Simulate Offline Mode

1. Create changes while "offline":

```javascript
// Frontend stores locally
const localChanges = [
  {
    entity_type: "listing",
    entity_id: "local-1234",
    action: "create",
    data: { crop_type: "jowar", quantity_kg: 200 },
    local_timestamp: "2024-01-15T10:00:00Z"
  }
];
```

2. When back online, push:

```bash
curl -X POST http://localhost:8005/api/v1/sync/push \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": [
      {
        "entity_type": "listing",
        "entity_id": "local-1234",
        "action": "create",
        "data": {
          "crop_type": "jowar",
          "quantity_kg": 200,
          "price_per_kg": 35
        },
        "local_timestamp": "2024-01-15T10:00:00Z"
      }
    ]
  }'

# Response
{
  "synced": 1,
  "conflicts": 0,
  "server_timestamp": "2024-01-15T10:05:00Z"
}
```

3. Pull server updates:

```bash
curl "http://localhost:8005/api/v1/sync/pull?since=2024-01-15T00:00:00Z" \
  -H "Authorization: Bearer $FARMER_TOKEN"

# Response
{
  "changes": [
    {
      "entity_type": "listing",
      "entity_id": "server-uuid",
      "action": "update",
      "data": { ... },
      "server_timestamp": "2024-01-15T09:00:00Z"
    }
  ],
  "server_timestamp": "2024-01-15T10:05:00Z"
}
```

---

## 💰 Payment Demo

### Initiate Payment

```bash
curl -X POST http://localhost:8005/api/v1/payments/initiate \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"order_id\": \"order-uuid\",
    \"amount\": 4550.00,
    \"method\": \"upi\"
  }"

# Response (mock)
{
  "payment_id": "pay-uuid",
  "status": "pending",
  "upi_link": "upi://pay?pa=shreeanna@upi&am=4550.00"
}
```

### Verify Payment

```bash
curl -X POST "http://localhost:8005/api/v1/payments/verify/pay-uuid" \
  -H "Authorization: Bearer $BUYER_TOKEN"

# Response
{
  "payment_id": "pay-uuid",
  "status": "success",
  "amount": 4550.00,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

## 🌤️ Weather Demo

```bash
curl "http://localhost:8005/api/v1/weather/13.5231/76.9029" \
  -H "Authorization: Bearer $FARMER_TOKEN"

# Response
{
  "location": "Tumkur, Karnataka",
  "current": {
    "temp_c": 28,
    "humidity": 65,
    "condition": "Partly Cloudy"
  },
  "advisory": {
    "message": "Good weather for harvesting. Complete before expected rain on Friday.",
    "crop_specific": {
      "ragi": "Ideal moisture levels for storage"
    }
  },
  "forecast": [...]
}
```

---

## ✅ Success Criteria

After completing this demo, you should have:

1. ✅ Farmer authenticated and profiled
2. ✅ Listing created in marketplace
3. ✅ Batch with traceable journey
4. ✅ Multiple trace events recorded
5. ✅ Public trace API showing complete journey
6. ✅ Tamper-evidence verified
7. ✅ (Optional) Voice bot interaction
8. ✅ (Optional) Offline sync working
9. ✅ (Optional) Payment processed

---

## 🎥 Video Recording Tips

1. Start with the consumer scanning QR code (end result)
2. Rewind to show farmer onboarding
3. Walk through each trace event
4. Highlight tamper-evidence
5. Show voice bot in action
6. Demonstrate offline resilience

---

## 🐛 Troubleshooting

**OTP not working?**
- Check if `USE_MOCK_SMS=true` in `.env`
- Mock OTP is always `123456`

**Token expired?**
- Use refresh token endpoint
- Check `ACCESS_TOKEN_EXPIRE_MINUTES` setting

**Database errors?**
- Delete `shreeanna.db` and restart
- JSON fallback should still work

---

*Happy Demo! 🌾*
