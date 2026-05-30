# Shree Anna API — Request Examples

Complete API request examples using **curl** and **HTTPie**.

---

## 🔑 Authentication

### Request OTP

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

**HTTPie:**
```bash
http POST localhost:8005/api/v1/auth/request-otp phone=+919876543210
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "expires_in": 600
}
```

---

### Verify OTP

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'
```

**HTTPie:**
```bash
http POST localhost:8005/api/v1/auth/verify-otp phone=+919876543210 otp=123456
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "phone": "+919876543210",
    "roles": ["farmer"],
    "is_active": true
  }
}
```

---

### Refresh Token

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

**HTTPie:**
```bash
http POST localhost:8005/api/v1/auth/refresh refresh_token=eyJ...
```

---

### Get Current User

**curl:**
```bash
curl http://localhost:8005/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**HTTPie:**
```bash
http localhost:8005/api/v1/auth/me "Authorization: Bearer eyJ..."
```

---

## 👤 Users

### Register User

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "name": "Ramesh Kumar",
    "roles": ["farmer"],
    "language_pref": "kn"
  }'
```

---

### Create Farmer Profile

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/users/farmer-profile \
  -H "Authorization: Bearer $TOKEN" \
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

---

### Get User Profile

**curl:**
```bash
curl http://localhost:8005/api/v1/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer $TOKEN"
```

---

### Update User

**curl:**
```bash
curl -X PUT http://localhost:8005/api/v1/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ramesh Kumar Singh",
    "language_pref": "hi"
  }'
```

---

## 🌾 Listings

### Create Listing

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/listings \
  -H "Authorization: Bearer $TOKEN" \
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
```

**HTTPie:**
```bash
http POST localhost:8005/api/v1/listings \
  "Authorization: Bearer $TOKEN" \
  crop_type=ragi \
  variety=GPU-28 \
  quantity_kg:=500 \
  price_per_kg:=42.50 \
  harvest_date=2024-01-10 \
  is_organic:=true
```

---

### List All Listings (Public)

**curl:**
```bash
# Basic
curl http://localhost:8005/api/v1/listings

# With filters
curl "http://localhost:8005/api/v1/listings?crop_type=ragi&is_organic=true&limit=20"

# With pagination
curl "http://localhost:8005/api/v1/listings?skip=0&limit=10"
```

**HTTPie:**
```bash
http localhost:8005/api/v1/listings crop_type==ragi is_organic==true
```

---

### Get Listing by ID

**curl:**
```bash
curl http://localhost:8005/api/v1/listings/listing-uuid
```

---

### Update Listing

**curl:**
```bash
curl -X PUT http://localhost:8005/api/v1/listings/listing-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity_kg": 450,
    "price_per_kg": 44.00
  }'
```

---

### Delete Listing

**curl:**
```bash
curl -X DELETE http://localhost:8005/api/v1/listings/listing-uuid \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📦 Batches & Traceability

### Create Batch

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/batches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "listing-uuid",
    "quantity_kg": 100,
    "msp_price_per_kg": 45.50
  }'
```

**Response:**
```json
{
  "id": "batch-uuid",
  "trace_code": "SA-RG-TK-20240115-001",
  "qr_code_url": "/uploads/qr/SA-RG-TK-20240115-001.png",
  "status": "created",
  "listing_id": "listing-uuid",
  "quantity_kg": 100,
  "msp_price_per_kg": 45.50,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### List Batches

**curl:**
```bash
# All my batches
curl http://localhost:8005/api/v1/batches \
  -H "Authorization: Bearer $TOKEN"

# Filter by listing
curl "http://localhost:8005/api/v1/batches?listing_id=listing-uuid" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Get Batch Details

**curl:**
```bash
curl http://localhost:8005/api/v1/batches/batch-uuid \
  -H "Authorization: Bearer $TOKEN"
```

---

### Add Trace Event

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/batches/batch-uuid/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "harvested",
    "payload": {
      "field_id": "F-001",
      "harvest_method": "manual",
      "weather_conditions": "sunny"
    },
    "location_lat": 13.5231,
    "location_lng": 76.9029
  }'
```

**Common event types:**
- `harvested` — Crop harvested
- `quality_checked` — Quality inspection done
- `packed` — Product packaged
- `stored` — Moved to storage
- `shipped` — In transit
- `delivered` — Received by buyer
- `processed` — Value addition done

---

### Public Trace Lookup

**curl:**
```bash
curl http://localhost:8005/api/v1/batches/trace/SA-RG-TK-20240115-001
```

**HTTPie:**
```bash
http localhost:8005/api/v1/batches/trace/SA-RG-TK-20240115-001
```

**Response:**
```json
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
    }
  },
  "journey": [
    {
      "event_type": "harvested",
      "timestamp": "2024-01-10T08:00:00Z",
      "actor": "Farmer",
      "location": {"lat": 13.5231, "lng": 76.9029},
      "verified": true,
      "payload_hash": "a1b2c3..."
    }
  ],
  "verification": {
    "chain_valid": true,
    "tamper_detected": false
  }
}
```

---

## 🔄 Offline Sync

### Push Changes

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/sync/push \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": [
      {
        "entity_type": "listing",
        "entity_id": "local-uuid-1",
        "action": "create",
        "data": {
          "crop_type": "jowar",
          "quantity_kg": 200,
          "price_per_kg": 35
        },
        "local_timestamp": "2024-01-15T10:00:00Z"
      },
      {
        "entity_type": "listing",
        "entity_id": "existing-uuid",
        "action": "update",
        "data": {
          "quantity_kg": 180
        },
        "local_timestamp": "2024-01-15T10:05:00Z"
      }
    ]
  }'
```

**Response:**
```json
{
  "synced": 2,
  "conflicts": 0,
  "results": [
    {"local_id": "local-uuid-1", "server_id": "server-uuid-1", "status": "created"},
    {"local_id": "existing-uuid", "server_id": "existing-uuid", "status": "updated"}
  ],
  "server_timestamp": "2024-01-15T10:10:00Z"
}
```

---

### Pull Changes

**curl:**
```bash
curl "http://localhost:8005/api/v1/sync/pull?since=2024-01-15T00:00:00Z" \
  -H "Authorization: Bearer $TOKEN"
```

**HTTPie:**
```bash
http localhost:8005/api/v1/sync/pull since==2024-01-15T00:00:00Z \
  "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "changes": [
    {
      "entity_type": "listing",
      "entity_id": "uuid",
      "action": "update",
      "data": {...},
      "server_timestamp": "2024-01-15T09:00:00Z"
    }
  ],
  "server_timestamp": "2024-01-15T10:10:00Z"
}
```

---

## 🌤️ Weather

### Get Weather Data

**curl:**
```bash
curl http://localhost:8005/api/v1/weather/13.5231/76.9029 \
  -H "Authorization: Bearer $TOKEN"
```

**HTTPie:**
```bash
http localhost:8005/api/v1/weather/13.5231/76.9029 \
  "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "location": {
    "lat": 13.5231,
    "lng": 76.9029,
    "name": "Tumkur, Karnataka"
  },
  "current": {
    "temp_c": 28,
    "humidity": 65,
    "condition": "Partly Cloudy",
    "wind_kph": 12
  },
  "advisory": {
    "general": "Good conditions for outdoor activities",
    "agricultural": "Ideal for harvesting millets"
  },
  "forecast": [...]
}
```

---

## 💰 Payments

### Initiate Payment

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-uuid",
    "amount": 4550.00,
    "method": "upi",
    "description": "Payment for Ragi batch"
  }'
```

**Response:**
```json
{
  "payment_id": "pay-uuid",
  "status": "pending",
  "amount": 4550.00,
  "method": "upi",
  "upi_link": "upi://pay?pa=shreeanna@upi&pn=ShreeAnna&am=4550.00",
  "expires_at": "2024-01-15T11:00:00Z"
}
```

---

### Verify Payment

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/payments/verify/pay-uuid \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "payment_id": "pay-uuid",
  "status": "success",
  "amount": 4550.00,
  "method": "upi",
  "completed_at": "2024-01-15T10:35:00Z",
  "transaction_id": "TXN123456789"
}
```

---

### Payment History

**curl:**
```bash
curl http://localhost:8005/api/v1/payments/history \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎤 Voice Webhooks (Reverie)

### Main Webhook

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/voice/webhook \
  -H "Content-Type: application/json" \
  -H "X-Reverie-Signature: hmac-sha256-signature" \
  -d '{
    "call_id": "call-123",
    "caller": "+919876543210",
    "event": "call_start",
    "timestamp": "2024-01-15T10:00:00Z"
  }'
```

---

### Language Selection

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/voice/language \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "call-123",
    "caller": "+919876543210",
    "input": "2"
  }'
```

**Input mapping:**
- 1 = Hindi
- 2 = Kannada
- 3 = Telugu
- 4 = Marathi
- 5 = Tamil
- 6 = Odia

---

### Mandi Prices

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/voice/mandi-prices \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "call-123",
    "language": "kn",
    "crop": "ragi",
    "district": "Tumkur"
  }'
```

---

### Weather Info

**curl:**
```bash
curl -X POST http://localhost:8005/api/v1/voice/weather-info \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "call-123",
    "language": "kn",
    "district": "Tumkur"
  }'
```

---

## 🏥 Health Check

**curl:**
```bash
curl http://localhost:8005/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## 📚 OpenAPI Documentation

Interactive docs available at:
- Swagger UI: http://localhost:8005/docs
- ReDoc: http://localhost:8005/redoc
- OpenAPI JSON: http://localhost:8005/openapi.json

---

## 🔧 Tips

### Save Token to Variable

**Bash:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8005/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}' | jq -r '.access_token')

echo $TOKEN
```

### Pretty Print JSON

**curl with jq:**
```bash
curl http://localhost:8005/api/v1/listings | jq .
```

**HTTPie (automatic):**
```bash
http localhost:8005/api/v1/listings
```

### Test Error Responses

```bash
# Invalid token
curl http://localhost:8005/api/v1/auth/me \
  -H "Authorization: Bearer invalid-token"

# Missing required field
curl -X POST http://localhost:8005/api/v1/listings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Not found
curl http://localhost:8005/api/v1/listings/nonexistent-uuid
```

---

*Generated for Shree Anna Backend v1.0.0*
