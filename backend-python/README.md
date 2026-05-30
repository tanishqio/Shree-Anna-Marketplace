# Shree Anna — Python Backend

A complete, production-ready Python backend for the **Shree Anna — Millets Value Chain** hackathon project. Built with FastAPI, SQLite, and designed for rural India with offline-first capabilities, voice-bot integration, and multilingual support.

---

## 🌾 Features

- **Phone-based JWT Authentication** with OTP via Twilio (mock fallback available)
- **Role-Based Access Control (RBAC)** — farmer, fpo, shg, buyer, admin
- **Traceability Ledger** — Append-only trace events with tamper-evident hashing
- **Offline Sync** — Push/pull mechanism with conflict resolution
- **Voice-Bot Webhooks** — Reverie AI integration for IVR
- **Weather & Advisories** — Cached weather data with agricultural tips
- **Payment Integration** — Mock payment gateway ready for production
- **QR Code Generation** — For batch traceability
- **JSON Fallback Storage** — Graceful degradation when database unavailable

---

## 📋 Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- SQLite3 (usually pre-installed)

---

## 🚀 Quick Start

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Required
SECRET_KEY=your-super-secret-key-change-this

# Optional (uses mocks if not set)
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
REVERIE_API_KEY=your-reverie-key
REVERIE_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Run the Server

```bash
# Development (with hot reload)
uvicorn app.main:app --reload --port 8005

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8005
```

### 5. Open API Documentation

Visit: http://localhost:8005/docs

---

## 🛠️ Makefile Commands

```bash
make install    # Install dependencies
make run        # Run production server
make dev        # Run development server with reload
make test       # Run tests with coverage
make lint       # Run linters (flake8, mypy)
make format     # Format code (black, isort)
make clean      # Clean cache files
make seed       # Seed database with demo data
make docs       # Generate OpenAPI JSON
```

---

## 📁 Project Structure

```
backend-python/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py        # OTP & JWT endpoints
│   │       ├── users.py       # User management
│   │       ├── listings.py    # Marketplace listings
│   │       ├── batches.py     # Batch traceability
│   │       ├── voice.py       # Reverie webhooks
│   │       ├── sync.py        # Offline sync
│   │       ├── weather.py     # Weather data
│   │       └── payments.py    # Payment processing
│   ├── core/
│   │   ├── config.py          # Settings & configuration
│   │   ├── hashing.py         # Cryptographic utilities
│   │   ├── security.py        # JWT & RBAC
│   │   └── utils.py           # Helpers & fallback storage
│   ├── db/
│   │   ├── models.py          # SQLModel entities
│   │   ├── init_db.py         # Database initialization
│   │   └── crud.py            # CRUD operations
│   ├── services/
│   │   ├── sms.py             # Twilio SMS service
│   │   ├── storage.py         # File storage service
│   │   ├── reverie.py         # Voice-bot service
│   │   ├── weather_cache.py   # Weather caching
│   │   └── payments.py        # Payment gateway
│   ├── tests/
│   │   ├── conftest.py        # Test fixtures
│   │   ├── test_auth.py       # Auth tests
│   │   ├── test_trace.py      # Traceability tests
│   │   └── test_webhook.py    # Webhook tests
│   └── main.py                # FastAPI application
├── scripts/
│   ├── seed_data.py           # Demo data seeding
│   └── venv_create.sh         # Environment setup
├── data/                      # JSON fallback storage
├── uploads/                   # File uploads
├── requirements.txt
├── Makefile
└── .env.example
```

---

## 🔐 Authentication Flow

### 1. Request OTP
```bash
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

### 2. Verify OTP
```bash
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}
```

Response:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "roles": ["farmer"]
  }
}
```

### 3. Use Token
```bash
GET /api/v1/auth/me
Authorization: Bearer eyJ...
```

---

## 🌿 Traceability System

### Create Batch
```bash
POST /api/v1/batches
Authorization: Bearer <farmer-token>
Content-Type: application/json

{
  "listing_id": "uuid",
  "quantity_kg": 100.0,
  "msp_price_per_kg": 45.50
}
```

Response includes QR code URL and trace code.

### Add Trace Event
```bash
POST /api/v1/batches/{batch_id}/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_type": "quality_check",
  "payload": {
    "grade": "A",
    "moisture": 12.5,
    "inspector": "Inspector Name"
  },
  "location_lat": 20.5937,
  "location_lng": 78.9629
}
```

### Verify Trace (Public)
```bash
GET /api/v1/batches/trace/{trace_code}
```

Returns complete journey with tamper-evidence verification.

---

## 🎤 Voice-Bot Integration (Reverie)

The backend handles Reverie voice-bot webhooks for IVR:

```
POST /api/v1/voice/webhook
POST /api/v1/voice/language
POST /api/v1/voice/mandi-prices
POST /api/v1/voice/weather-info
```

Supported languages: Hindi, Kannada, Telugu, Marathi, Tamil, Odia

---

## 📡 Offline Sync

### Push Local Changes
```bash
POST /api/v1/sync/push
Authorization: Bearer <token>
Content-Type: application/json

{
  "changes": [
    {
      "entity_type": "listing",
      "entity_id": "local-uuid",
      "action": "create",
      "data": { ... },
      "local_timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Pull Server Changes
```bash
GET /api/v1/sync/pull?since=2024-01-15T00:00:00Z
Authorization: Bearer <token>
```

---

## 🧪 Testing

```bash
# Run all tests
pytest app/tests/ -v

# With coverage
pytest app/tests/ -v --cov=app --cov-report=html

# Specific test file
pytest app/tests/test_auth.py -v
```

---

## 🌐 API Endpoints Summary

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/auth/request-otp` | POST | Request OTP | No |
| `/api/v1/auth/verify-otp` | POST | Verify OTP & get token | No |
| `/api/v1/auth/refresh` | POST | Refresh access token | Yes |
| `/api/v1/auth/me` | GET | Get current user | Yes |
| `/api/v1/users` | POST | Register user | Yes |
| `/api/v1/users/{id}` | GET/PUT | Get/Update user | Yes |
| `/api/v1/listings` | GET/POST | List/Create listings | Yes* |
| `/api/v1/listings/{id}` | GET/PUT/DELETE | Manage listing | Yes |
| `/api/v1/batches` | GET/POST | List/Create batches | Yes |
| `/api/v1/batches/{id}/events` | POST | Add trace event | Yes |
| `/api/v1/batches/trace/{code}` | GET | Public trace lookup | No |
| `/api/v1/sync/push` | POST | Push offline changes | Yes |
| `/api/v1/sync/pull` | GET | Pull server changes | Yes |
| `/api/v1/weather/{lat}/{lng}` | GET | Get weather data | Yes |
| `/api/v1/payments/initiate` | POST | Start payment | Yes |
| `/api/v1/payments/verify/{id}` | POST | Verify payment | Yes |
| `/api/v1/voice/webhook` | POST | Reverie webhook | HMAC |

*GET listings is public, POST requires farmer role

---

## 🔧 Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | dev-secret | JWT signing key |
| `DATABASE_URL` | sqlite:///./shreeanna.db | Database connection |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 30 | JWT expiry |
| `REFRESH_TOKEN_EXPIRE_DAYS` | 7 | Refresh token expiry |
| `OTP_EXPIRE_MINUTES` | 10 | OTP validity |
| `USE_MOCK_SMS` | false | Use mock SMS service |
| `USE_MOCK_WEATHER` | false | Use mock weather data |
| `TWILIO_ACCOUNT_SID` | - | Twilio account |
| `TWILIO_AUTH_TOKEN` | - | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | - | Sender phone number |
| `REVERIE_API_KEY` | - | Reverie API key |
| `REVERIE_WEBHOOK_SECRET` | - | Webhook signature secret |
| `LOG_LEVEL` | INFO | Logging level |
| `CORS_ORIGINS` | * | Allowed CORS origins |

---

## 🛡️ Security Features

1. **Password-less Auth** — OTP-based, no passwords to leak
2. **JWT with Refresh** — Short-lived access tokens
3. **RBAC** — Role-based endpoint protection
4. **HMAC Signatures** — Webhook verification
5. **Tamper-Evident Ledger** — Hashed trace events
6. **Input Validation** — Pydantic schemas everywhere
7. **SQL Injection Prevention** — SQLAlchemy ORM

---

## 📱 Mobile App Integration

The API is designed for mobile-first use:

- **Offline-First**: Sync API for intermittent connectivity
- **Voice Support**: IVR integration for feature phones
- **QR Codes**: Scannable batch traces
- **Minimal Payloads**: Optimized for slow networks

---

## 🚢 Deployment

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8005
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8005"]
```

### Azure App Service

See `../azure/` for Bicep templates and deployment scripts.

---

## 📄 License

MIT License — Built for the Shree Anna hackathon.

---

## 🙏 Acknowledgments

- **Government of India** — Shree Anna Mission
- **NITI Aayog** — Digital Agriculture initiative
- **Reverie Language Technologies** — Voice AI
- **FastAPI** — Modern Python web framework
