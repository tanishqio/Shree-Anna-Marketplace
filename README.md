# 🌾 Shree Anna — Millet Marketplace

<div align="center">

**India's trusted digital marketplace for millets — connecting smallholder farmers directly to buyers**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render)](https://render.com)

[Live Demo](https://shree-anna-frontend-x3g7.onrender.com/) · [API Docs](https://shree-anna-backend.onrender.com/docs) · [Architecture](./docs/architecture/)

</div>

---

## 📖 What is Shree Anna?

Shree Anna (श्री अन्न) is a full-stack digital marketplace built for India's **Shree Anna (Millet) Mission**. It connects smallholder millet farmers directly to buyers, processors, and FPOs — eliminating middlemen, ensuring fair prices, and bringing **traceability from farm to fork**.

Built for **Smart India Hackathon 2025 (SIH)** — Problem Statement on Digital Millet Economy.

### Who uses it?

| Role | What they do |
|---|---|
| 🌾 **Farmer** | List millets, receive offers, track payments, view crop history |
| 🏢 **FPO** (Farmer Producer Organisation) | Aggregate farmer produce, manage bulk listings |
| 🏭 **Processor** | Browse marketplace, create batches, process millets into products |
| 🛒 **Buyer** | Browse listings, place orders, make payments |
| 🏪 **KSC** (Krishi Seva Kendra) | Register farmers, verify documents |
| 👤 **Admin** | Platform oversight, advisory management |

---

## ✨ Key Features

- **🎤 Voice-first UI** — Complete registration and listing creation via voice in 6 languages (Hindi, Telugu, Kannada, Tamil, Marathi, English)
- **📱 PWA + Offline support** — Works on low-connectivity farms via service worker and offline queue
- **🔍 End-to-end Traceability** — QR codes track every batch from seed to shelf
- **💰 Escrow payments** — Razorpay-powered secure payments released on delivery confirmation
- **🌦️ Weather integration** — Hyperlocal weather advisory for crop decisions
- **📜 Government Schemes** — Live database of PM millet schemes with eligibility checker
- **🔐 OTP Authentication** — Phone-based auth via Supabase, no password required

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                 │
│              shree-anna-frontend.onrender.com            │
│  App Router · TypeScript · Tailwind · shadcn/ui · PWA  │
└─────────────────┬───────────────────────────────────────┘
                  │  REST API calls
┌─────────────────▼───────────────────────────────────────┐
│                   BACKEND (FastAPI)                      │
│              shree-anna-backend.onrender.com             │
│         Python 3.11 · SQLModel · Pydantic · JWT          │
└───────────┬─────────────────────────────┬───────────────┘
            │                             │
┌───────────▼──────────┐    ┌────────────▼──────────────┐
│   Supabase (Primary) │    │   External Services        │
│   PostgreSQL DB      │    │   Twilio (SMS OTP)         │
│   Auth (OTP)         │    │   Razorpay (Payments)      │
│   Storage (Files)    │    │   Google STT/TTS (Voice)   │
│   Row Level Security │    │   Bhashini (Translation)   │
└──────────────────────┘    │   Open-Meteo (Weather)     │
                            └────────────────────────────┘
```

---

## 📁 Project Structure

```
shree-anna-marketplace/
│
├── src/                          # Next.js Frontend
│   ├── app/                      # App Router pages
│   │   ├── farmer/               # Farmer role pages
│   │   ├── buyer/                # Buyer role pages
│   │   ├── fpo/                  # FPO role pages
│   │   ├── processor/            # Processor role pages
│   │   ├── admin/                # Admin role pages
│   │   ├── ksc/                  # KSC role pages
│   │   ├── marketplace/          # Public marketplace
│   │   ├── krishi-darpan/        # Advisory & education
│   │   ├── schemes/              # Govt schemes hub
│   │   └── trace/                # QR traceability
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── layout/               # Navigation, Footer (barrel)
│   │   ├── common/               # Shared components (barrel)
│   │   ├── voice/                # Voice & TTS components (barrel)
│   │   └── features/             # Domain-specific (barrel)
│   │       ├── auth/
│   │       ├── marketplace/
│   │       ├── orders/
│   │       ├── payments/
│   │       ├── kyc/
│   │       ├── notifications/
│   │       ├── offline/
│   │       └── traceability/
│   │
│   ├── features/                 # API split by domain
│   │   ├── auth/api.ts
│   │   ├── listings/api.ts
│   │   ├── orders/api.ts
│   │   ├── payments/api.ts
│   │   ├── traceability/api.ts
│   │   └── weather/api.ts
│   │
│   ├── constants/                # App-wide constants
│   │   ├── roles.ts              # ROLES enum + labels
│   │   ├── routes.ts             # All route paths
│   │   ├── millets.ts            # Millet types & grades
│   │   └── languages.ts          # Supported languages
│   │
│   ├── hooks/                    # React hooks
│   │   ├── useAuth.tsx           # Authentication state
│   │   ├── useData.tsx           # Data fetching hooks
│   │   ├── useLanguage.tsx       # i18n & language switching
│   │   └── use-mobile.ts         # Responsive breakpoint
│   │
│   └── lib/                      # Infrastructure
│       ├── api.ts                # HTTP client + all API functions
│       ├── supabase.ts           # Supabase client
│       ├── providers.tsx         # React context tree
│       └── utils.ts              # Shared utilities
│
├── backend-python/               # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/               # 21 route modules
│   │   ├── services/             # Business logic
│   │   ├── core/                 # Config, security, utils
│   │   ├── db/                   # SQLModel ORM, CRUD
│   │   └── main.py               # App entry point
│   ├── migrations/               # SQL schema files (numbered)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_schema_v2.sql
│   │   ├── 003_crop_history.sql
│   │   └── 004_seed_mock_listings.sql
│   └── scripts/
│       ├── seed/                 # DB seeding scripts
│       ├── dev/                  # Dev environment setup
│       └── ops/                  # Operational tools
│
├── docs/                         # All documentation
│   ├── deployment/               # render.md, local.md
│   ├── architecture/             # auth-flow, api-spec
│   └── integrations/             # twilio, sms-templates
│
├── public/                       # Static assets
├── render.yaml                   # Render deployment config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/tanishqio/Shree-Anna-Marketplace.git
cd Shree-Anna-Marketplace

# Frontend
npm install

# Backend
cd backend-python
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Frontend — copy and fill in values
cp .env.example .env.local
```

```bash
# Backend — copy and fill in values
cp backend-python/.env.example backend-python/.env
```

**Required environment variables:**

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8005` for local dev |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection String |
| `JWT_SECRET_KEY` | Generate: `openssl rand -hex 32` |

### 3. Set Up Database

```bash
# Run the schema in your Supabase SQL editor
# Apply in order:
backend-python/migrations/001_initial_schema.sql
backend-python/migrations/002_schema_v2.sql
backend-python/migrations/003_crop_history.sql

# Optional: seed with mock data
backend-python/migrations/004_seed_mock_listings.sql
```

### 4. Run Locally

```bash
# Terminal 1 — Backend
cd backend-python
uvicorn app.main:app --reload --port 8005

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Developer Mode

The app includes developer bypass accounts for testing without real OTPs:

| Phone | Role | OTP |
|---|---|---|
| `9876543210` | Farmer | `000000` |
| `9876543211` | Buyer | `000000` |
| `9876543212` | Processor | `000000` |
| `9876543213` | FPO | `000000` |
| `9876543214` | KSC | `000000` |

> These are only active in development mode. In production, real Supabase OTP is used.

---

## 🌐 Deployment

The app is deployed on [Render](https://render.com) using `render.yaml` at the repository root.

| Service | URL |
|---|---|
| Frontend | https://shree-anna-frontend-x3g7.onrender.com |
| Backend API | https://shree-anna-backend.onrender.com |
| API Docs | https://shree-anna-backend.onrender.com/docs |

Full deployment guide: [`docs/deployment/render.md`](./docs/deployment/render.md)

---

## 📡 API Overview

The FastAPI backend exposes 21 route modules under `/api/v1/`:

| Module | Endpoints |
|---|---|
| `/auth` | OTP request, verify, logout |
| `/users` | Profile CRUD, onboarding |
| `/listings` | Marketplace listings CRUD |
| `/orders` | Order lifecycle management |
| `/payments` | Razorpay integration |
| `/offers` | Offer negotiation flow |
| `/batches` | Processing batch management |
| `/trace` | QR traceability lookup |
| `/fpo` | FPO management |
| `/admin` | Platform administration |
| `/voice` | Reverie voice bot webhooks |
| `/speech` | Google STT/TTS |
| `/weather` | Hyperlocal weather data |
| `/schemes` | Govt scheme database |
| `/notifications` | Push notification management |
| `/kyc` | Document verification |

Interactive docs: [https://shree-anna-backend.onrender.com/docs](https://shree-anna-backend.onrender.com/docs)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework, SSR |
| TypeScript | Type safety |
| Tailwind CSS + shadcn/ui | Styling and component library |
| React Query | Server state management |
| i18next | Internationalisation (6 languages) |
| Supabase JS Client | Auth + direct DB queries |
| Workbox / Service Worker | PWA + offline support |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Python web framework |
| SQLModel | ORM (built on SQLAlchemy + Pydantic) |
| Supabase PostgreSQL | Production database |
| JWT (python-jose) | Authentication tokens |
| Twilio | SMS OTP delivery |
| Google Cloud Speech | STT and TTS for voice features |
| Razorpay | Payment gateway |
| Loguru | Structured logging |

---

## 🗺️ Roadmap

- [ ] UPI direct payment integration
- [ ] AI-powered price discovery
- [ ] Bulk SMS advisory broadcasts
- [ ] ONDC network integration
- [ ] Mobile app (React Native)
- [ ] Multilingual voice bot (full conversation)

---

## 🤝 Contributing

This project was built for SIH 2025. Contributions are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push and open a PR

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with ❤️ for India's millet farmers · **श्री अन्न — भारत का अन्न**

</div>
