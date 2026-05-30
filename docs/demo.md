# Shree Anna - Demo Guide

This document provides a walkthrough of the Shree Anna platform's key features for demonstration purposes.

## 🎬 Demo Scenarios

### Scenario 1: Farmer Creates a Listing (2-3 minutes)

**Story**: Ram, a farmer from Karnataka, wants to sell his ragi harvest.

1. **Open the app** → Navigate to http://localhost:3000
2. **Login as Farmer**:
   - Click "I am a Farmer" 
   - Enter phone: +919876543210
   - Enter OTP: 123456
3. **Create Listing**:
   - Click "Create Listing" button
   - Select millet type: "Ragi" (tap icon)
   - Set quantity: 100 kg (slider)
   - Set price: ₹50/kg
   - Add photo (optional)
   - Click "Publish"
4. **Demonstrate offline**:
   - Open DevTools → Network → Offline
   - Create another listing
   - Show "Saved offline" notification
   - Go back online → "Synced" notification

**Key Points to Highlight**:
- Large, colorful buttons for low-literacy users
- Visual millet selection with icons
- Offline capability
- Hindi language available (toggle in header)

---

### Scenario 2: Buyer Makes an Offer (2-3 minutes)

**Story**: Priya, an FPO manager, wants to buy ragi from farmers.

1. **Login as Buyer**:
   - Phone: +919876543211
   - OTP: 123456
2. **Browse Marketplace**:
   - Navigate to /marketplace
   - Filter by: Ragi, Karnataka
   - View listing details
3. **Make an Offer**:
   - Click "Make Offer"
   - Enter price: ₹55/kg
   - Enter quantity: 50 kg
   - Submit offer

**Key Points to Highlight**:
- Filter and search capabilities
- Direct farmer-buyer connection
- Competitive bidding

---

### Scenario 3: Farmer Accepts Offer with Voice Consent (3 minutes)

**Story**: Ram receives Priya's offer and wants to accept.

1. **Switch to Farmer account** (or use incognito)
2. **View Offers**:
   - Navigate to Dashboard → "View Offers"
   - See Priya's offer for ₹55/kg
3. **Accept with Voice Consent**:
   - Click "Accept"
   - Record voice consent: "I agree to sell 50kg at ₹55"
   - Verify with OTP
   - Order confirmed!

**Key Points to Highlight**:
- Voice consent for illiterate users
- OTP verification for security
- Order creation workflow

---

### Scenario 4: FPO Creates Batch & QR Code (2 minutes)

**Story**: An FPO aggregates produce from multiple farmers.

1. **Login as FPO**:
   - Phone: +919876543212
   - OTP: 123456
2. **Create Batch**:
   - Navigate to "Create Batch"
   - Add contributing farmers
   - Specify total quantity
   - Generate QR code
3. **Show QR Code**:
   - Display generated QR
   - Explain traceability

**Key Points to Highlight**:
- Multi-farmer aggregation
- Automatic QR generation
- Batch tracking

---

### Scenario 5: Consumer Traces Product (1-2 minutes)

**Story**: A consumer at a retail store scans a QR code.

1. **Navigate to /trace**
2. **Enter batch code** or scan QR
3. **View journey**:
   - Farmer details
   - Harvest date
   - FPO processing
   - Quality certifications
   - Complete timeline

**Key Points to Highlight**:
- Farm-to-fork transparency
- Consumer trust
- Certification verification

---

## 📱 PWA Demonstration

1. **Install as App**:
   - Chrome → Three dots → "Install app"
   - Show app icon on home screen
2. **Offline Mode**:
   - Disconnect WiFi
   - Navigate app
   - Create listing
   - Show queue
   - Reconnect → Sync

---

## 🌐 Multi-language Demo

1. Click language selector (globe icon)
2. Switch to Hindi (हिंदी)
3. Show translated UI:
   - "किसान डैशबोर्ड"
   - "लिस्टिंग बनाएं"
   - Error messages

---

## 📊 Admin Analytics Demo

1. **Login as Admin**:
   - Phone: +919876543200
   - OTP: 123456
2. **View Dashboard**:
   - Total farmers
   - Active listings
   - Transaction volume
   - Regional breakdown
3. **Send Advisory**:
   - Create weather advisory
   - Target specific region
   - Show notification

---

## 🎤 Voice Feature Demo

1. Open listing creation
2. Click microphone icon
3. Speak in Hindi: "मुझे रागी बेचनी है, 100 किलो"
4. Show transcription
5. Demonstrate voice consent recording

---

## Demo Data Quick Reference

| Account | Phone | Role | Features to Show |
|---------|-------|------|------------------|
| Ram (Farmer) | +919876543210 | Farmer | Listings, offers, voice |
| Priya (Buyer) | +919876543211 | Buyer | Marketplace, ordering |
| FPO Manager | +919876543212 | FPO | Batches, QR codes |
| Admin | +919876543200 | Admin | Analytics, advisories |

**OTP for all accounts**: 123456

---

## Technical Demo Points

1. **Architecture**: Next.js 15 + FastAPI
2. **Offline**: localforage + Service Worker
3. **i18n**: react-i18next (4 languages)
4. **Validation**: Zod schemas
5. **State**: TanStack Query
6. **Testing**: Jest + MSW (105 backend tests)

---

## Common Questions

**Q: How does voice work for low-literacy users?**
A: Users can record voice notes and consent in their language. The system transcribes and stores both text and audio.

**Q: What happens offline?**
A: All actions queue in IndexedDB. On reconnection, they sync automatically. Conflict resolution uses timestamps.

**Q: How is pricing determined?**
A: Farmers set prices. Buyers make competitive offers. Market rates are displayed for reference.

**Q: Is the data on blockchain?**
A: Batch QR codes reference immutable trace logs. Future roadmap includes blockchain anchoring.

---

**Total Demo Time**: 15-20 minutes for full walkthrough
