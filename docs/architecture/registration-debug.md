# 🔍 Farmer Registration Flow - Debug Guide

## Files Involved & Their Functions

### 📁 **Frontend Files**

| File | Purpose | Key Functions |
|------|---------|---------------|
| `src/app/farmer/register/page.tsx` | Registration page | `handleSendOtp()`, `handleVerifyOtp()`, `handleComplete()` |
| `src/components/FlashCard.tsx` | Multi-step card UI | `goNext()`, `goPrev()`, `onComplete` callback |
| `src/lib/api.ts` | API client | `authApi.requestOtp()`, `authApi.verifyOtp()`, `userApi.onboardFarmer()` |

### 📁 **Backend Files**

| File | Purpose | Key Functions |
|------|---------|---------------|
| `backend-python/app/api/v1/auth.py` | Auth endpoints | `request_otp()`, `verify_otp()` |
| `backend-python/app/api/v1/users.py` | User endpoints | `onboard_farmer()` |
| `backend-python/app/db/crud.py` | DB operations | `create_otp_record()`, `create_user()`, `create_farmer_profile()` |
| `backend-python/app/db/models.py` | DB models | `User`, `Farmer`, `OTPRecord` |

---

## 📊 Registration Flow Diagram

```
STEP 1: Phone Number Entry
┌─────────────────────────────────────────────────────────────────────────────┐
│ User enters phone number → Clicks "Send OTP"                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: handleSendOtp()                                                   │
│ File: src/app/farmer/register/page.tsx                                      │
│ Calls: authApi.requestOtp('+91' + phone, language)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ API CALL: POST /api/v1/auth/request-otp                                     │
│ Body: { "phone": "+919876543210", "language": "en" }                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: request_otp()                                                      │
│ File: backend-python/app/api/v1/auth.py                                     │
│ Calls: create_otp_record() → Stores OTP hash in 'otps' table                │
└─────────────────────────────────────────────────────────────────────────────┘


STEP 2: OTP Verification
┌─────────────────────────────────────────────────────────────────────────────┐
│ User enters 6-digit OTP → Auto-verifies                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: handleVerifyOtp()                                                 │
│ File: src/app/farmer/register/page.tsx                                      │
│ Calls: authApi.verifyOtp('+91' + phone, otp)                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ API CALL: POST /api/v1/auth/verify-otp                                      │
│ Body: { "phone": "+919876543210", "otp": "123456" }                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: verify_otp()                                                       │
│ File: backend-python/app/api/v1/auth.py                                     │
│ Creates: New user in 'users' table (if not exists)                          │
│ Returns: JWT token + user data                                              │
│ *** USER IS CREATED HERE with onboarded=False ***                           │
└─────────────────────────────────────────────────────────────────────────────┘


STEP 3: Profile Completion (Name, State, District, Village, Bank)
┌─────────────────────────────────────────────────────────────────────────────┐
│ User fills all profile steps → Clicks "Done" on last step                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: FlashCard → goNext() → onComplete(formData)                       │
│ File: src/components/FlashCard.tsx (line 86)                                │
│ Triggers: handleComplete() in parent component                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: handleComplete()                                                  │
│ File: src/app/farmer/register/page.tsx                                      │
│ Calls: userApi.onboardFarmer(payload)                                       │
│ Payload: { name, language, district, state, village, bank_account, ifsc }   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ API CALL: POST /api/v1/users/onboard/farmer                                 │
│ Headers: Authorization: Bearer <JWT_TOKEN>                                  │
│ Body: { name, language, district, state, village, bank_account, ifsc }      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: onboard_farmer()                                                   │
│ File: backend-python/app/api/v1/users.py                                    │
│ 1. update_user() → Updates 'users' table (name, district, onboarded=True)   │
│ 2. create_farmer_profile() → Creates entry in 'farmers' table               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Debug Checklist

### Check 1: Is the phone API being called?
Open browser console (F12) and look for:
```
POST http://localhost:8005/api/v1/auth/request-otp
```

### Check 2: Is OTP verification working?
Look for:
```
POST http://localhost:8005/api/v1/auth/verify-otp
```
Response should include `token`

### Check 3: Is the token being saved?
After OTP verification, run in console:
```javascript
localStorage.getItem('shreeanna_token')
```
Should return a JWT token

### Check 4: Is onboard API being called?
After clicking "Done", look for:
```
POST http://localhost:8005/api/v1/users/onboard/farmer
```

### Check 5: Console logs
Look for these console messages:
```
=== handleComplete called ===
formData: { name: '...', phone: '...', ... }
Sending payload to API: { name: '...', ... }
API Response: { success: true, ... }
```

---

## ⚠️ Common Issues

### Issue 1: Token not being sent
- The JWT token from OTP verification must be saved
- Check if `setAccessToken(result.token)` is called in `handleVerifyOtp`

### Issue 2: onComplete not being called
- FlashCard's "Done" button must trigger `onComplete`
- Check if `canProceed` is blocking the button

### Issue 3: API returns 401
- Token expired or not set
- Check Authorization header in Network tab

### Issue 4: Mock verification bypasses real API
- If using mock OTP (123456), token may not be set
- Real API must be called for proper registration

---

## 🧪 Quick Test

Run this in browser console to test the API directly:
```javascript
const token = localStorage.getItem('shreeanna_token');
fetch('http://localhost:8005/api/v1/users/onboard/farmer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Test Farmer',
    language: 'hi',
    district: 'Bangalore Rural',
    state: 'Karnataka',
    village: 'Test Village'
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
.catch(e => console.error('Error:', e));
```
