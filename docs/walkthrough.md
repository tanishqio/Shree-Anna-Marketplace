# 🌾 Shree Anna Millets Marketplace - Complete Testing Walkthrough

This guide walks you through testing **every feature** of the Shree Anna platform from the frontend.

---

## 📋 Prerequisites

### 1. Start the Backend Server

```powershell
cd backend-python
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8005
```

### 2. Start the Frontend Dev Server

```powershell
cd ..  # back to annaf root
npm run dev
```

### 3. Open the App

- **URL:** `http://localhost:3000`
- **Recommended:** Use Chrome or Edge (for voice features)

---

## 🔐 1. Authentication Flow

### 1.1 Login Page

1. Navigate to: `http://localhost:3000/login`
2. **Test Phone Input:**
   - Enter valid phone: `9876543210` (10 digits, no +91 needed)
   - Try invalid phone: `123` (should show error)
   - Can also enter with prefix: `+919876543210`
3. **Request OTP:**
   - Click "Get OTP" button
   - Should see OTP input appear

### 1.2 OTP Verification

1. **Dev Mode:** Enter OTP `123456` (works in dev)
2. After successful login, you should be redirected to dashboard

### 1.3 Test Different Roles

Create users with different roles to test role-specific dashboards:

- **Farmer:** `/farmer/dashboard`
- **Buyer:** `/buyer/dashboard`
- **FPO:** `/fpo/dashboard`
- **Admin:** `/admin/dashboard`

---

## 👨‍🌾 2. Farmer Features

### 2.1 Farmer Registration

1. Navigate to: `http://localhost:3000/farmer/register`
2. **Registration Steps:**
   - Choose language preference
   - Enter phone number & verify OTP
   - Enter name (supports voice input)
   - Enter location (State, District, Village)
   - Bank details (optional, can skip)
3. **Test Voice Input:** 🎤
   - Click the microphone button
   - Speak in Hindi: "मेरा नाम किसान है"
   - Verify transcript appears
4. Submit and verify registration complete

### 2.2 Farmer Dashboard

1. Navigate to: `http://localhost:3000/farmer/dashboard`
2. **Verify Cards Display:**
   - Active Listings count
   - Pending Offers count
   - Total Earnings
   - Weather Widget (your location)
3. **Quick Actions:**
   - "Create Listing" button
   - "View Offers" button
   - "Track Orders" button

### 2.3 Create a Listing

1. Navigate to: `http://localhost:3000/farmer/listing/create`
2. **Fill Listing Details:**

   | Field | Test Value |
   |-------|------------|
   | Crop Type | Ragi (Finger Millet) |
   | Quantity | 500 kg |
   | Price per Quintal | ₹4500 |
   | Quality Grade | Premium |
   | Organic | Yes ✓ |
   | Description | "Fresh organic ragi from Tumkur" |

3. **Upload Photos:**
   - Click upload area
   - Select 1-3 images
   - Verify previews appear
4. **Test Voice Description:** 🎤
   - Click mic button
   - Speak description in Hindi
5. Submit and verify success message

### 2.4 View and Manage Offers

1. Navigate to: `http://localhost:3000/farmer/offers/[listing-id]`
2. **For each offer, test:**
   - View buyer details
   - Accept offer → Order created
   - Reject offer → Status updates
   - Counter offer → New price input

### 2.5 Farmer Consents

1. Navigate to: `http://localhost:3000/farmer/consents`
2. **Test Consent Management:**
   - View active consents
   - Revoke a consent
   - View consent history

### 2.6 Farmer Orders

1. Navigate to: `http://localhost:3000/farmer/orders`
2. **Verify Order List:**
   - Order ID
   - Buyer name
   - Quantity & Price
   - Status (Pending/Confirmed/Shipped/Delivered)

### 2.7 Farmer Payments

1. Navigate to: `http://localhost:3000/farmer/payments`
2. **Test Payment Views:**
   - Payment history
   - Pending payments
   - Total earnings chart
   - Download statement

---

## 🛒 3. Marketplace (Buyer Features)

### 3.1 Browse Marketplace

1. Navigate to: `http://localhost:3000/marketplace`
2. **Test Filters:**

   | Filter | Test |
   |--------|------|
   | Crop Type | Select "Ragi" |
   | Price Range | ₹3000 - ₹5000 |
   | Quality | Premium only |
   | Organic | Yes |
   | Location | Karnataka |

3. **Test Sorting:**
   - Price: Low to High
   - Price: High to Low
   - Newest First
   - Distance (if location enabled)

### 3.2 View Listing Details

1. Click any listing card
2. **Verify Details:**
   - All photos (carousel)
   - Farmer info
   - Quality grade badge
   - Organic certification
   - Location on map
   - Price breakdown

### 3.3 Make an Offer

1. Click "Make Offer" on a listing
2. **Fill Offer Form:**
   - Quantity: 200 kg
   - Offered Price: ₹4200/quintal
   - Message: "Need delivery by next week"
3. Submit and verify confirmation

### 3.4 Buyer Dashboard

1. Navigate to: `http://localhost:3000/buyer/dashboard`
2. **Verify Sections:**
   - My Offers (Pending/Accepted/Rejected)
   - My Orders
   - Saved Listings
   - Purchase History

---

## 🏢 4. FPO Features

### 4.1 FPO Dashboard

1. Navigate to: `http://localhost:3000/fpo/dashboard`
2. **Verify Analytics:**
   - Total Farmers count
   - Active Listings count
   - Total Volume traded
   - Revenue chart

### 4.2 Batch Management

1. **Create Batch:**
   - Select source listings
   - Set total weight
   - Assign grade
   - Generate QR code
2. **View Batches:**
   - Batch list with QR codes
   - Click to see trace history

---

## 🔍 5. Traceability Features

### 5.1 Trace a Product

1. Navigate to: `http://localhost:3000/trace/[qr-code]`
   - Example: `http://localhost:3000/trace/BATCH-001-2024`
2. **Verify Timeline:**
   - Harvest event
   - Quality check
   - Processing
   - Packaging
   - Dispatch
3. **Verify Each Event Shows:**
   - Timestamp
   - Location
   - Actor (Farmer/FPO/Transporter)
   - Verification status ✓

### 5.2 QR Code Display

1. On any batch page, click "Show QR"
2. **Test QR Actions:**
   - Download QR image
   - Print QR code
   - Share QR (on mobile)

---

## 🌤️ 6. Weather Features

### 6.1 Weather Widget

1. On Farmer Dashboard, locate weather card
2. **Verify Display:**
   - Current temperature
   - Humidity %
   - Weather condition icon
   - Location name

### 6.2 Weather Advisory

1. Check for farming advisory text
2. Examples:
   - "Good day for harvesting"
   - "Rain expected - delay spraying"

---

## 📜 7. Government Schemes

### 7.1 Schemes Hub

1. Navigate to: `http://localhost:3000/schemes`
2. **Verify Scheme Cards:**
   - PM-KISAN
   - Millet Mission
   - Crop Insurance
3. **For Each Scheme Test:**
   - Eligibility criteria
   - Benefits amount
   - Apply button/link
   - Documents required

---

## ❓ 8. Help and Support

### 8.1 Help Page

1. Navigate to: `http://localhost:3000/help`
2. **Test Accordion FAQs:**
   - Click to expand/collapse
   - Verify Hindi translations
3. **Test Contact Options:**
   - Phone number (click to call on mobile)
   - WhatsApp link

### 8.2 Help Modal

1. Click help icon (?) on any page
2. Verify modal opens with contextual help

---

## 🎤 9. Voice Features

### 9.1 Voice Input Button

Test on any page with voice input:

1. **Start Recording:**
   - Click microphone button
   - Button should pulse/animate
   - Permission prompt (first time)
2. **Speak:**
   - Hindi: "मैं राजा मिलेट बेचना चाहता हूं"
   - English: "I want to sell 500 kg of ragi"
3. **Verify:**
   - Live transcript appears
   - Final text populates input field
4. **Stop Recording:**
   - Click stop button
   - Recording indicator stops

### 9.2 Voice Languages

Test recognition in different languages:

- Hindi (hi-IN)
- Kannada (kn-IN)
- Telugu (te-IN)
- English (en-IN)

---

## 🌐 10. Multi-Language (i18n)

### 10.1 Language Switcher

1. Find language selector (usually in header/footer)
2. **Test Each Language:**

   | Code | Language |
   |------|----------|
   | en | English |
   | hi | हिंदी |
   | kn | ಕನ್ನಡ |
   | te | తెలుగు |

3. **Verify translations on:**
   - Navigation menu
   - Button labels
   - Form placeholders
   - Error messages
   - Success toasts

---

## 📴 11. Offline Features

### 11.1 Test Offline Mode

1. Open DevTools → Network tab
2. Set to "Offline"
3. **Verify:**
   - Offline indicator appears
   - Cached pages still load
   - Forms queue submissions
4. **Create listing while offline:**
   - Fill form
   - Submit
   - Verify "Queued for sync" message

### 11.2 Sync When Back Online

1. Set Network back to "Online"
2. **Verify:**
   - Sync indicator shows
   - Queued items sync
   - Success notifications appear

### 11.3 Service Worker

1. DevTools → Application → Service Workers
2. Verify service worker registered
3. Check cached assets

---

## 👨‍💼 12. Admin Features

### 12.1 Admin Dashboard

1. Navigate to: `http://localhost:3000/admin/dashboard`
2. **Verify Analytics:**
   - Total Users by role
   - Active Listings
   - Total Transaction Volume
   - Revenue charts
3. **Verify Tables:**
   - User management
   - Listing moderation
   - Payment oversight

---

## 🔔 13. Notifications

### 13.1 Toast Notifications

Trigger and verify toasts:

- ✅ Success: "Listing created successfully"
- ⚠️ Warning: "Low stock alert"
- ❌ Error: "Network error"
- ℹ️ Info: "New offer received"

### 13.2 Notification Center

1. Click bell icon
2. Verify notification list
3. Mark as read
4. Clear all

---

## 📱 14. Mobile Responsiveness

### 14.1 Test Breakpoints

Use DevTools device toolbar:

| Device | Width |
|--------|-------|
| Mobile S | 320px |
| Mobile M | 375px |
| Mobile L | 425px |
| Tablet | 768px |
| Laptop | 1024px |
| Desktop | 1440px |

### 14.2 Touch Interactions

On mobile viewport, verify:

- Touch targets are 44px+
- Swipe gestures work
- No horizontal scroll
- Bottom nav is accessible

---

## 🧪 15. Edge Cases and Error Handling

### 15.1 Form Validation

| Test | Expected |
|------|----------|
| Empty required field | Error message |
| Invalid phone format | "Enter valid phone" |
| Negative price | "Price must be positive" |
| Future date | "Date cannot be in future" |

### 15.2 Network Errors

1. Backend not running → Friendly error page
2. Timeout → Retry button
3. 404 → "Page not found" UI

### 15.3 Auth Errors

1. Expired token → Redirect to login
2. Invalid token → Logout & login prompt
3. Unauthorized access → 403 page

---

## ✅ Testing Checklist

### Authentication Checklist

- [ ] Login with valid phone
- [ ] Invalid phone error
- [ ] OTP verification
- [ ] Logout

### Farmer Flow Checklist

- [ ] Complete onboarding
- [ ] Create listing with photos
- [ ] Voice input for description
- [ ] Accept/Reject offers
- [ ] View orders
- [ ] Check payments

### Buyer Flow Checklist

- [ ] Browse marketplace
- [ ] Apply filters
- [ ] Make offer
- [ ] Track orders

### FPO Flow Checklist

- [ ] View dashboard analytics
- [ ] Create batch
- [ ] Generate QR code

### Traceability Checklist

- [ ] Scan/enter QR code
- [ ] View complete trace timeline
- [ ] Print QR code

### Voice Features Checklist

- [ ] Voice input works
- [ ] Hindi recognition
- [ ] Kannada recognition

### Offline Checklist

- [ ] Pages load offline
- [ ] Forms queue offline
- [ ] Sync when online

### i18n Checklist

- [ ] English UI
- [ ] Hindi UI
- [ ] Kannada UI
- [ ] Telugu UI

### Responsive Checklist

- [ ] Mobile layout
- [ ] Tablet layout
- [ ] Desktop layout

---

## 🐛 Reporting Issues

If you find bugs, note:

1. **URL** where issue occurred
2. **Steps** to reproduce
3. **Expected** behavior
4. **Actual** behavior
5. **Screenshots/Videos**
6. **Browser & Device** info

---

## Happy Testing! 🎉

*Shree Anna - Empowering Millet Farmers Digitally* 🌾
