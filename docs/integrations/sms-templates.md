# Shree Anna - SMS Templates

## Overview

All SMS messages follow these guidelines:
- Maximum 160 characters (single SMS) or 306 characters (2-part SMS)
- Available in 6 languages: English (en), Hindi (hi), Telugu (te), Kannada (kn), Tamil (ta), Marathi (mr)
- Variables are enclosed in `{curly_braces}`
- Sender ID: `SHREANNA`

---

## 1. Listing Confirmation

**Template ID:** `LISTING_CONFIRM`

### English
```
Shree Anna: Your listing #{listingId} for {quantity}kg {milletType} at ₹{price}/kg is live! 
Buyers can now see your produce. Track: shreenna.in/l/{listingId}
```

### Hindi
```
श्री अन्न: आपकी लिस्टिंग #{listingId} - {quantity}kg {milletType} ₹{price}/kg पर लाइव है!
खरीदार अब देख सकते हैं। देखें: shreenna.in/l/{listingId}
```

### Telugu
```
శ్రీ అన్న: మీ లిస్టింగ్ #{listingId} - {quantity}kg {milletType} ₹{price}/kg లైవ్!
కొనుగోలుదారులు చూడవచ్చు। చూడండి: shreenna.in/l/{listingId}
```

---

## 2. New Offer Received

**Template ID:** `OFFER_RECEIVED`

### English
```
Shree Anna: New offer! {buyerName} wants {quantity}kg {milletType} at ₹{offeredPrice}/kg (₹{totalValue} total).
Reply within 48hrs. View: shreenna.in/o/{offerId}
```

### Hindi
```
श्री अन्न: नया प्रस्ताव! {buyerName} {quantity}kg {milletType} ₹{offeredPrice}/kg (कुल ₹{totalValue}) चाहते हैं।
48 घंटे में जवाब दें। देखें: shreenna.in/o/{offerId}
```

### Telugu
```
శ్రీ అన్న: కొత్త ఆఫర్! {buyerName} {quantity}kg {milletType} ₹{offeredPrice}/kg కావాలి (మొత్తం ₹{totalValue}).
48 గంటల్లో స్పందించండి। చూడండి: shreenna.in/o/{offerId}
```

---

## 3. Offer Accepted Confirmation

**Template ID:** `OFFER_ACCEPTED`

### English
```
Shree Anna: Congratulations! Your deal with {buyerName} for {quantity}kg {milletType} (₹{totalValue}) is confirmed.
Order #{orderId}. Pickup on {pickupDate}. Call helpline if needed: 1800-XXX-XXXX
```

### Hindi
```
श्री अन्न: बधाई! {buyerName} के साथ {quantity}kg {milletType} (₹{totalValue}) का सौदा पक्का!
ऑर्डर #{orderId}। पिकअप {pickupDate}। मदद के लिए: 1800-XXX-XXXX
```

---

## 4. OTP for Voice Consent

**Template ID:** `CONSENT_OTP`

### English
```
Shree Anna: Your OTP is {otp}. Valid for 10 minutes. 
Use this to verify your {consentType} consent. Do NOT share with anyone.
```

### Hindi
```
श्री अन्न: आपका OTP है {otp}। 10 मिनट के लिए मान्य।
{consentType} सहमति सत्यापित करने के लिए उपयोग करें। किसी को न बताएं।
```

---

## 5. Payment Initiated

**Template ID:** `PAYMENT_INITIATED`

### English
```
Shree Anna: Payment of ₹{amount} initiated for Order #{orderId}. 
Expected in your bank account ({bankLast4}) within {days} days. Ref: {txnId}
```

### Hindi
```
श्री अन्न: ₹{amount} का भुगतान शुरू - ऑर्डर #{orderId}।
आपके खाते ({bankLast4}) में {days} दिन में आएगा। रेफ: {txnId}
```

---

## 6. Payment Completed

**Template ID:** `PAYMENT_COMPLETED`

### English
```
Shree Anna: ₹{amount} credited to your account ({bankLast4}) for Order #{orderId}!
UTR: {utrNumber}. Thank you for selling on Shree Anna! 🌾
```

### Hindi
```
श्री अन्न: ₹{amount} आपके खाते ({bankLast4}) में आ गया! ऑर्डर #{orderId}।
UTR: {utrNumber}। श्री अन्न पर बेचने के लिए धन्यवाद! 🌾
```

---

## 7. Weather Alert

**Template ID:** `WEATHER_ALERT`

### English
```
Shree Anna Weather Alert: {alertType} expected in {region} on {date}.
{recommendation}. Check weather: shreenna.in/weather
```

### Hindi
```
श्री अन्न मौसम चेतावनी: {region} में {date} को {alertType} की संभावना।
{recommendation}। मौसम देखें: shreenna.in/weather
```

**Variables:**
- `alertType`: Heavy Rain / Heatwave / Strong Winds / Frost
- `recommendation`: Store grains safely / Delay harvest / Cover produce

---

## 8. Price Alert

**Template ID:** `PRICE_ALERT`

### English
```
Shree Anna Price Update: {milletType} prices {direction} by {percentage}% in {region}.
Current rate: ₹{currentPrice}/kg. Good time to {action}!
```

### Hindi
```
श्री अन्न मूल्य अपडेट: {region} में {milletType} के दाम {percentage}% {direction}।
वर्तमान रेट: ₹{currentPrice}/kg। {action} का अच्छा समय!
```

**Variables:**
- `direction`: up/down (बढ़े/घटे)
- `action`: sell now/hold/wait (अभी बेचें/रखें/इंतज़ार करें)

---

## 9. Pickup Reminder

**Template ID:** `PICKUP_REMINDER`

### English
```
Shree Anna: Reminder! Your produce pickup for Order #{orderId} is tomorrow ({date}).
Keep {quantity}kg {milletType} ready. Driver: {driverName} ({driverPhone})
```

### Hindi
```
श्री अन्न: याद दिलाएं! कल ({date}) आपके माल की पिकअप है - ऑर्डर #{orderId}।
{quantity}kg {milletType} तैयार रखें। ड्राइवर: {driverName} ({driverPhone})
```

---

## 10. Scheme Notification

**Template ID:** `SCHEME_NOTIFY`

### English
```
Shree Anna: New govt scheme! {schemeName} - {benefit}.
Apply before {deadline}. Eligibility & details: shreenna.in/schemes/{schemeId}
```

### Hindi
```
श्री अन्न: नई सरकारी योजना! {schemeName} - {benefit}।
{deadline} से पहले आवेदन करें। जानकारी: shreenna.in/schemes/{schemeId}
```

---

## 11. FPO Batch Update

**Template ID:** `BATCH_UPDATE`

### English
```
Shree Anna FPO: Batch #{batchCode} status: {status}.
Total: {totalQuantity}kg from {farmerCount} farmers. QR: shreenna.in/b/{batchCode}
```

### Hindi
```
श्री अन्न FPO: बैच #{batchCode} स्थिति: {status}।
कुल: {farmerCount} किसानों से {totalQuantity}kg। QR: shreenna.in/b/{batchCode}
```

---

## 12. KYC Reminder

**Template ID:** `KYC_REMINDER`

### English
```
Shree Anna: Complete your KYC to start selling! 
Upload Aadhaar & bank details at shreenna.in/kyc or call 1800-XXX-XXXX for help.
```

### Hindi
```
श्री अन्न: बेचना शुरू करने के लिए KYC पूरा करें!
आधार और बैंक जानकारी दें: shreenna.in/kyc या 1800-XXX-XXXX पर कॉल करें।
```

---

## 13. Order In Transit

**Template ID:** `ORDER_TRANSIT`

### English
```
Shree Anna: Order #{orderId} is on the way! 
Vehicle: {vehicleNumber}, Driver: {driverName}.
Track: shreenna.in/track/{orderId}
```

### Hindi
```
श्री अन्न: ऑर्डर #{orderId} रास्ते में है!
गाड़ी: {vehicleNumber}, ड्राइवर: {driverName}।
ट्रैक करें: shreenna.in/track/{orderId}
```

---

## 14. Delivery Confirmation

**Template ID:** `DELIVERY_CONFIRM`

### English
```
Shree Anna: Order #{orderId} delivered! {quantity}kg {milletType} received by {receiverName}.
Payment of ₹{amount} will be processed within 3 days.
```

### Hindi
```
श्री अन्न: ऑर्डर #{orderId} पहुंचा! {quantity}kg {milletType} {receiverName} को मिला।
₹{amount} का भुगतान 3 दिन में होगा।
```

---

## 15. Proxy Consent Alert

**Template ID:** `PROXY_CONSENT`

### English
```
Shree Anna: {proxyName} ({relationship}) recorded consent on your behalf for {action}.
If not authorized, call 1800-XXX-XXXX immediately. Ref: {consentId}
```

### Hindi
```
श्री अन्न: {proxyName} ({relationship}) ने {action} के लिए आपकी तरफ से सहमति दी।
अगर आपने नहीं कहा, तुरंत 1800-XXX-XXXX पर कॉल करें। रेफ: {consentId}
```

---

## Voice Call Scripts

### Weather Alert (IVR)

```
नमस्ते, यह श्री अन्न से मौसम चेतावनी है।

{region} में {date} को {alertType} की संभावना है।

कृपया {recommendation}।

अधिक जानकारी के लिए 1 दबाएं, या फोन काट दें।

धन्यवाद।
```

### Price Update (IVR)

```
नमस्ते, यह श्री अन्न मूल्य अपडेट है।

आज {milletType} का भाव {currentPrice} रुपये प्रति किलो है।

पिछले हफ्ते से {percentage} प्रतिशत {direction} है।

अभी बेचने के लिए 1 दबाएं, या और जानने के लिए 2 दबाएं।

धन्यवाद।
```

---

## Template Registration Notes

1. **DLT Registration**: All templates must be registered on the DLT platform
2. **Variable Limits**: Maximum 5 variables per template
3. **Character Encoding**: Use UTF-8 for regional languages
4. **Sender ID**: Use `SHREANNA` (6 characters)
5. **Template Category**: Transactional for orders/payments, Promotional for schemes

## Integration

```javascript
// Example API call
const sendSMS = async (phone, templateId, language, variables) => {
  const response = await fetch('/api/notifications/sms', {
    method: 'POST',
    body: JSON.stringify({
      to: phone,
      template: templateId,
      language: language,
      variables: variables
    })
  });
  return response.json();
};

// Usage
await sendSMS(
  '+919876543210',
  'OFFER_RECEIVED',
  'hi',
  {
    buyerName: 'Organic Foods Ltd.',
    quantity: '300',
    milletType: 'रागी',
    offeredPrice: '48',
    totalValue: '14,400',
    offerId: 'OFR-2024-001'
  }
);
```
