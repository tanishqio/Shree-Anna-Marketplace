"""
Shree Anna Backend - Razorpay Payment Service
Payment gateway integration (Mock mode for development).
In production, replace mock methods with actual Razorpay API calls.
"""

import uuid
import hmac
import hashlib
from datetime import datetime
from typing import Dict, Optional
from enum import Enum

from loguru import logger
from pydantic import BaseModel

from app.core.config import settings
from app.core.utils import utc_now


class PaymentStatus(str, Enum):
    CREATED = "created"
    AUTHORIZED = "authorized"
    CAPTURED = "captured"
    FAILED = "failed"
    REFUNDED = "refunded"


class RazorpayOrder(BaseModel):
    """Razorpay order response model."""
    id: str
    entity: str = "order"
    amount: int  # Amount in paise
    amount_paid: int = 0
    amount_due: int
    currency: str = "INR"
    receipt: str
    status: str = "created"
    notes: Dict = {}
    created_at: int


class RazorpayPayment(BaseModel):
    """Razorpay payment response model."""
    id: str
    entity: str = "payment"
    amount: int
    currency: str = "INR"
    status: str
    order_id: str
    method: Optional[str] = None
    description: Optional[str] = None
    created_at: int


class RazorpayService:
    """
    Razorpay payment service.
    Uses mock mode when RAZORPAY_KEY_ID is not set.
    """
    
    def __init__(self):
        self.key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
        self.key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
        self.mock_mode = not self.key_id or not self.key_secret
        
        # In-memory storage for mock mode
        self._orders: Dict[str, Dict] = {}
        self._payments: Dict[str, Dict] = {}
        
        if self.mock_mode:
            logger.warning("Razorpay running in MOCK mode - no real payments will be processed")
        else:
            logger.info("Razorpay service initialized with production keys")
    
    def create_order(
        self,
        amount: float,
        currency: str = "INR",
        receipt: str = None,
        notes: Dict = None
    ) -> RazorpayOrder:
        """
        Create a Razorpay order.
        Amount should be in rupees (will be converted to paise).
        """
        amount_paise = int(amount * 100)
        receipt = receipt or f"order_{uuid.uuid4().hex[:12]}"
        
        if self.mock_mode:
            return self._create_mock_order(amount_paise, currency, receipt, notes or {})
        
        # Production Razorpay API call
        try:
            import razorpay
            client = razorpay.Client(auth=(self.key_id, self.key_secret))
            
            order_data = {
                "amount": amount_paise,
                "currency": currency,
                "receipt": receipt,
                "notes": notes or {}
            }
            
            order = client.order.create(data=order_data)
            
            return RazorpayOrder(
                id=order["id"],
                amount=order["amount"],
                amount_due=order["amount_due"],
                currency=order["currency"],
                receipt=order["receipt"],
                status=order["status"],
                notes=order.get("notes", {}),
                created_at=order["created_at"]
            )
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise
    
    def _create_mock_order(
        self,
        amount_paise: int,
        currency: str,
        receipt: str,
        notes: Dict
    ) -> RazorpayOrder:
        """Create a mock order for development."""
        order_id = f"order_{uuid.uuid4().hex[:16]}"
        created_at = int(utc_now().timestamp())
        
        order = RazorpayOrder(
            id=order_id,
            amount=amount_paise,
            amount_due=amount_paise,
            currency=currency,
            receipt=receipt,
            status="created",
            notes=notes,
            created_at=created_at
        )
        
        self._orders[order_id] = order.model_dump()
        logger.info(f"[MOCK] Created order: {order_id} for ₹{amount_paise/100}")
        
        return order
    
    def verify_payment_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """
        Verify the payment signature from Razorpay webhook.
        """
        if self.mock_mode:
            # In mock mode, accept if payment starts with "pay_mock"
            return razorpay_payment_id.startswith("pay_mock")
        
        try:
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                self.key_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, razorpay_signature)
        except Exception as e:
            logger.error(f"Signature verification failed: {e}")
            return False
    
    def capture_payment(
        self,
        payment_id: str,
        amount: int,
        currency: str = "INR"
    ) -> RazorpayPayment:
        """Capture an authorized payment."""
        if self.mock_mode:
            return self._capture_mock_payment(payment_id, amount, currency)
        
        try:
            import razorpay
            client = razorpay.Client(auth=(self.key_id, self.key_secret))
            
            payment = client.payment.capture(payment_id, amount, {"currency": currency})
            
            return RazorpayPayment(
                id=payment["id"],
                amount=payment["amount"],
                currency=payment["currency"],
                status=payment["status"],
                order_id=payment["order_id"],
                method=payment.get("method"),
                created_at=payment["created_at"]
            )
        except Exception as e:
            logger.error(f"Payment capture failed: {e}")
            raise
    
    def _capture_mock_payment(
        self,
        payment_id: str,
        amount: int,
        currency: str
    ) -> RazorpayPayment:
        """Capture a mock payment."""
        if payment_id in self._payments:
            self._payments[payment_id]["status"] = "captured"
            logger.info(f"[MOCK] Captured payment: {payment_id}")
            return RazorpayPayment(**self._payments[payment_id])
        
        # Create a new mock payment
        payment = RazorpayPayment(
            id=payment_id,
            amount=amount,
            currency=currency,
            status="captured",
            order_id=f"order_mock_{uuid.uuid4().hex[:8]}",
            method="upi",
            created_at=int(utc_now().timestamp())
        )
        self._payments[payment_id] = payment.model_dump()
        return payment
    
    def simulate_payment(
        self,
        order_id: str,
        method: str = "upi"
    ) -> RazorpayPayment:
        """
        Simulate a successful payment (MOCK MODE ONLY).
        Use this for testing the payment flow.
        """
        if not self.mock_mode:
            raise ValueError("simulate_payment only works in mock mode")
        
        if order_id not in self._orders:
            raise ValueError(f"Order {order_id} not found")
        
        order = self._orders[order_id]
        payment_id = f"pay_mock_{uuid.uuid4().hex[:16]}"
        
        payment = RazorpayPayment(
            id=payment_id,
            amount=order["amount"],
            currency=order["currency"],
            status="captured",
            order_id=order_id,
            method=method,
            created_at=int(utc_now().timestamp())
        )
        
        self._payments[payment_id] = payment.model_dump()
        self._orders[order_id]["status"] = "paid"
        self._orders[order_id]["amount_paid"] = order["amount"]
        self._orders[order_id]["amount_due"] = 0
        
        logger.info(f"[MOCK] Simulated payment: {payment_id} for order {order_id}")
        
        return payment
    
    def get_order(self, order_id: str) -> Optional[Dict]:
        """Get order details."""
        if self.mock_mode:
            return self._orders.get(order_id)
        
        try:
            import razorpay
            client = razorpay.Client(auth=(self.key_id, self.key_secret))
            return client.order.fetch(order_id)
        except Exception as e:
            logger.error(f"Failed to fetch order: {e}")
            return None
    
    def get_payment(self, payment_id: str) -> Optional[Dict]:
        """Get payment details."""
        if self.mock_mode:
            return self._payments.get(payment_id)
        
        try:
            import razorpay
            client = razorpay.Client(auth=(self.key_id, self.key_secret))
            return client.payment.fetch(payment_id)
        except Exception as e:
            logger.error(f"Failed to fetch payment: {e}")
            return None
    
    def refund_payment(
        self,
        payment_id: str,
        amount: Optional[int] = None,
        notes: Dict = None
    ) -> Dict:
        """Initiate a refund."""
        if self.mock_mode:
            return self._refund_mock_payment(payment_id, amount, notes)
        
        try:
            import razorpay
            client = razorpay.Client(auth=(self.key_id, self.key_secret))
            
            refund_data = {"notes": notes or {}}
            if amount:
                refund_data["amount"] = amount
            
            return client.payment.refund(payment_id, refund_data)
        except Exception as e:
            logger.error(f"Refund failed: {e}")
            raise
    
    def _refund_mock_payment(
        self,
        payment_id: str,
        amount: Optional[int],
        notes: Dict = None
    ) -> Dict:
        """Mock refund for development."""
        refund_id = f"rfnd_mock_{uuid.uuid4().hex[:12]}"
        
        if payment_id in self._payments:
            self._payments[payment_id]["status"] = "refunded"
        
        refund = {
            "id": refund_id,
            "entity": "refund",
            "amount": amount or (self._payments.get(payment_id, {}).get("amount", 0)),
            "currency": "INR",
            "payment_id": payment_id,
            "notes": notes or {},
            "status": "processed",
            "created_at": int(utc_now().timestamp())
        }
        
        logger.info(f"[MOCK] Refund processed: {refund_id} for payment {payment_id}")
        
        return refund


# Singleton instance
razorpay_service = RazorpayService()


# Convenience functions
def create_payment_order(amount: float, receipt: str = None, notes: Dict = None) -> RazorpayOrder:
    """Create a payment order."""
    return razorpay_service.create_order(amount, receipt=receipt, notes=notes)


def verify_payment(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify payment signature."""
    return razorpay_service.verify_payment_signature(order_id, payment_id, signature)


def simulate_test_payment(order_id: str) -> RazorpayPayment:
    """Simulate a test payment (mock mode only)."""
    return razorpay_service.simulate_payment(order_id)
