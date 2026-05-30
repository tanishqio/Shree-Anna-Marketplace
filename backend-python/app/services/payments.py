"""
Shree Anna Backend - Payment Service
Mock payment integration for demo purposes.
"""

import json
import uuid
from datetime import datetime
from enum import Enum
from typing import Dict, Optional

from loguru import logger
from pydantic import BaseModel

from app.core.utils import utc_now, get_fallback_store


class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    UPI = "upi"
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    WALLET = "wallet"


class PaymentRequest(BaseModel):
    """Payment initiation request."""
    amount: float
    order_id: str
    payer_id: str
    payee_id: str
    method: PaymentMethod = PaymentMethod.UPI
    description: Optional[str] = None
    metadata: Optional[Dict] = None


class PaymentResponse(BaseModel):
    """Payment response."""
    transaction_id: str
    status: PaymentStatus
    amount: float
    order_id: str
    method: PaymentMethod
    upi_link: Optional[str] = None
    qr_data: Optional[str] = None
    message: str
    timestamp: str


class PaymentService:
    """
    Mock payment service for demo.
    Simulates UPI and bank transfer payments.
    """
    
    def __init__(self):
        self.transactions: Dict[str, Dict] = {}
        self._orders: Dict[str, Dict] = {}  # Payment orders storage
        self.upi_id = "shreeanna@upi"
    
    def initiate_payment(self, request: PaymentRequest) -> PaymentResponse:
        """
        Initiate a payment.
        In production, this would integrate with actual payment gateway.
        """
        transaction_id = f"TXN{utc_now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"
        
        # Generate UPI link
        upi_link = None
        qr_data = None
        
        if request.method == PaymentMethod.UPI:
            upi_link = self._generate_upi_link(
                amount=request.amount,
                txn_id=transaction_id,
                note=request.description or f"Order {request.order_id}"
            )
            qr_data = upi_link  # QR code would encode this
        
        # Create transaction record
        transaction = {
            "id": transaction_id,
            "order_id": request.order_id,
            "amount": request.amount,
            "payer_id": request.payer_id,
            "payee_id": request.payee_id,
            "method": request.method.value,
            "status": PaymentStatus.PENDING.value,
            "upi_link": upi_link,
            "description": request.description,
            "metadata": request.metadata or {},
            "created_at": utc_now().isoformat(),
            "updated_at": utc_now().isoformat()
        }
        
        self.transactions[transaction_id] = transaction
        
        # Store in fallback
        store = get_fallback_store("payments")
        store.append(transaction)
        
        logger.info(
            f"Payment initiated: {transaction_id}, "
            f"Amount: ₹{request.amount}, Order: {request.order_id}"
        )
        
        return PaymentResponse(
            transaction_id=transaction_id,
            status=PaymentStatus.PENDING,
            amount=request.amount,
            order_id=request.order_id,
            method=request.method,
            upi_link=upi_link,
            qr_data=qr_data,
            message="Payment initiated. Complete via UPI or bank transfer.",
            timestamp=utc_now().isoformat()
        )
    
    def confirm_payment(
        self,
        transaction_id: str,
        gateway_response: Optional[Dict] = None
    ) -> PaymentResponse:
        """
        Confirm a payment (mock - always succeeds for demo).
        In production, this would verify with payment gateway.
        """
        transaction = self.transactions.get(transaction_id)
        
        if not transaction:
            # Check fallback store
            store = get_fallback_store("payments")
            for item in store.get_all():
                if item.get("id") == transaction_id:
                    transaction = item
                    break
        
        if not transaction:
            return PaymentResponse(
                transaction_id=transaction_id,
                status=PaymentStatus.FAILED,
                amount=0,
                order_id="",
                method=PaymentMethod.UPI,
                message="Transaction not found",
                timestamp=utc_now().isoformat()
            )
        
        # Update status (mock: always success for demo)
        transaction["status"] = PaymentStatus.SUCCESS.value
        transaction["updated_at"] = utc_now().isoformat()
        transaction["gateway_response"] = gateway_response
        
        self.transactions[transaction_id] = transaction
        
        logger.info(f"Payment confirmed: {transaction_id}")
        
        return PaymentResponse(
            transaction_id=transaction_id,
            status=PaymentStatus.SUCCESS,
            amount=transaction["amount"],
            order_id=transaction["order_id"],
            method=PaymentMethod(transaction["method"]),
            message="Payment successful!",
            timestamp=utc_now().isoformat()
        )
    
    def get_payment_status(self, transaction_id: str) -> Optional[PaymentResponse]:
        """Get payment status."""
        transaction = self.transactions.get(transaction_id)
        
        if not transaction:
            return None
        
        return PaymentResponse(
            transaction_id=transaction_id,
            status=PaymentStatus(transaction["status"]),
            amount=transaction["amount"],
            order_id=transaction["order_id"],
            method=PaymentMethod(transaction["method"]),
            upi_link=transaction.get("upi_link"),
            message=f"Payment {transaction['status']}",
            timestamp=transaction["updated_at"]
        )
    
    def refund_payment(
        self,
        transaction_id: str,
        reason: str = "Order cancelled"
    ) -> PaymentResponse:
        """Refund a payment (mock)."""
        transaction = self.transactions.get(transaction_id)
        
        if not transaction:
            return PaymentResponse(
                transaction_id=transaction_id,
                status=PaymentStatus.FAILED,
                amount=0,
                order_id="",
                method=PaymentMethod.UPI,
                message="Transaction not found",
                timestamp=utc_now().isoformat()
            )
        
        if transaction["status"] != PaymentStatus.SUCCESS.value:
            return PaymentResponse(
                transaction_id=transaction_id,
                status=PaymentStatus.FAILED,
                amount=transaction["amount"],
                order_id=transaction["order_id"],
                method=PaymentMethod(transaction["method"]),
                message="Only successful payments can be refunded",
                timestamp=utc_now().isoformat()
            )
        
        # Process refund (mock)
        transaction["status"] = PaymentStatus.REFUNDED.value
        transaction["refund_reason"] = reason
        transaction["updated_at"] = utc_now().isoformat()
        
        self.transactions[transaction_id] = transaction
        
        logger.info(f"Payment refunded: {transaction_id}, Reason: {reason}")
        
        return PaymentResponse(
            transaction_id=transaction_id,
            status=PaymentStatus.REFUNDED,
            amount=transaction["amount"],
            order_id=transaction["order_id"],
            method=PaymentMethod(transaction["method"]),
            message=f"Refund processed: {reason}",
            timestamp=utc_now().isoformat()
        )
    
    def _generate_upi_link(
        self,
        amount: float,
        txn_id: str,
        note: str
    ) -> str:
        """Generate UPI payment link."""
        # Standard UPI deep link format
        return (
            f"upi://pay?"
            f"pa={self.upi_id}&"
            f"pn=ShreeAnna&"
            f"am={amount}&"
            f"tn={note}&"
            f"tr={txn_id}"
        )
    
    def get_payment_history(
        self,
        user_id: str,
        role: str = "payer"
    ) -> list:
        """Get payment history for a user."""
        payments = []
        field = "payer_id" if role == "payer" else "payee_id"
        
        for txn_id, txn in self.transactions.items():
            if txn.get(field) == user_id:
                payments.append(txn)
        
        # Sort by created_at descending
        payments.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return payments


# Global singleton
payment_service = PaymentService()


def initiate_payment(request: PaymentRequest) -> PaymentResponse:
    """Initiate a payment."""
    return payment_service.initiate_payment(request)


def confirm_payment(
    transaction_id: str,
    gateway_response: Optional[Dict] = None
) -> PaymentResponse:
    """Confirm a payment."""
    return payment_service.confirm_payment(transaction_id, gateway_response)


def get_payment_status(transaction_id: str) -> Optional[PaymentResponse]:
    """Get payment status."""
    return payment_service.get_payment_status(transaction_id)


def refund_payment(transaction_id: str, reason: str = "Order cancelled") -> PaymentResponse:
    """Refund a payment."""
    return payment_service.refund_payment(transaction_id, reason)
