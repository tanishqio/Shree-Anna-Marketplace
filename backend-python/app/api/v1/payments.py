"""
Shree Anna Backend - Payment API Routes
Mock payment integration.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlmodel import Session
from loguru import logger

from app.core.security import get_current_user
from app.core.utils import success_response
from app.db import get_session, User, Order
from app.services import (
    initiate_payment, confirm_payment, get_payment_status, refund_payment,
    PaymentRequest, PaymentResponse, PaymentStatus, PaymentMethod
)
from app.services.sms import send_notification_sms


router = APIRouter(prefix="/payments", tags=["Payments"])


class InitiatePaymentRequest(BaseModel):
    """Payment initiation request."""
    order_id: str = Field(..., description="Order ID")
    amount: float = Field(..., gt=0, description="Amount in INR")
    method: str = Field(default="upi", description="Payment method (upi, bank_transfer)")
    description: Optional[str] = None


class ConfirmPaymentRequest(BaseModel):
    """Payment confirmation request."""
    transaction_id: str
    gateway_response: Optional[dict] = None


class RefundRequest(BaseModel):
    """Refund request."""
    transaction_id: str
    reason: str = Field(default="Order cancelled")


class CreateOrderRequest(BaseModel):
    """Create payment order request."""
    listing_id: str
    quantity_kg: float = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    payment_method: str = Field(default="upi")


class PaymentCallbackRequest(BaseModel):
    """Payment callback/webhook request."""
    order_id: str
    payment_id: str
    status: str
    signature: Optional[str] = None
    error: Optional[str] = None


@router.post("/orders")
async def create_payment_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a payment order for a listing purchase.
    Alternative to /initiate with simplified flow.
    """
    import uuid
    
    # Validate listing exists
    from app.db import get_listing_by_id
    listing = get_listing_by_id(session, request.listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Create order ID
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    
    # Store order in mock payment service
    from app.services.payments import payment_service
    
    order_data = {
        "id": order_id,
        "order_id": order_id,
        "listing_id": request.listing_id,
        "buyer_id": current_user.id,
        "seller_id": listing.owner_id,
        "quantity_kg": request.quantity_kg,
        "amount": request.amount,
        "payment_method": request.payment_method,
        "status": "pending",
        "created_at": str(__import__("datetime").datetime.utcnow())
    }
    
    # Store in payment service
    payment_service._orders[order_id] = order_data
    
    logger.info(f"Payment order created: {order_id} by {current_user.id}")
    
    return order_data


@router.get("/orders/{order_id}")
async def get_payment_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get payment order details."""
    from app.services.payments import payment_service
    
    order = payment_service._orders.get(order_id)
    if not order:
        # Try DB order
        db_order = session.get(Order, order_id)
        if db_order:
            return {
                "id": db_order.id,
                "order_id": db_order.id,
                "buyer_id": db_order.buyer_id,
                "seller_id": db_order.seller_id,
                "quantity_kg": db_order.quantity_kg,
                "total_amount": db_order.total_amount,
                "status": db_order.status,
            }
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order


@router.get("/orders/{order_id}/status")
async def get_payment_order_status(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get payment order status."""
    from app.services.payments import payment_service
    
    order = payment_service._orders.get(order_id)
    if not order:
        db_order = session.get(Order, order_id)
        if db_order:
            return {
                "order_id": order_id,
                "status": db_order.payment_status or db_order.status,
            }
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return {
        "order_id": order_id,
        "status": order.get("status", "unknown"),
        "payment_id": order.get("payment_id"),
    }


@router.post("/callback")
async def payment_callback(
    request: PaymentCallbackRequest,
    session: Session = Depends(get_session)
):
    """
    Payment callback for webhook/status updates.
    """
    from app.services.payments import payment_service
    
    order = payment_service._orders.get(request.order_id)
    
    if order:
        order["status"] = "completed" if request.status == "success" else "failed"
        order["payment_id"] = request.payment_id
        if request.error:
            order["error"] = request.error
        
        logger.info(f"Payment callback: {request.order_id} - {request.status}")
    
    return {
        "order_id": request.order_id,
        "status": request.status,
        "processed": True
    }


@router.post("/initiate")
async def initiate_new_payment(
    request: InitiatePaymentRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Initiate a new payment.
    Returns UPI link and QR code for payment.
    """
    # Validate order exists
    order = session.get(Order, request.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization
    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this order"
        )
    
    # Create payment request
    payment_req = PaymentRequest(
        amount=request.amount,
        order_id=request.order_id,
        payer_id=current_user.id,
        payee_id=order.seller_id,
        method=PaymentMethod(request.method),
        description=request.description
    )
    
    response = initiate_payment(payment_req)
    
    logger.info(
        f"Payment initiated: {response.transaction_id} by {current_user.id}"
    )
    
    return {
        "success": True,
        "transaction_id": response.transaction_id,
        "status": response.status.value,
        "amount": response.amount,
        "upi_link": response.upi_link,
        "qr_data": response.qr_data,
        "message": response.message
    }


@router.post("/confirm")
async def confirm_payment_endpoint(
    request: ConfirmPaymentRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Confirm a payment (for mock/testing).
    In production, this would be called by payment gateway webhook.
    """
    response = confirm_payment(
        transaction_id=request.transaction_id,
        gateway_response=request.gateway_response
    )
    
    if response.status == PaymentStatus.SUCCESS:
        # Update order status
        order = session.get(Order, response.order_id)
        if order:
            order.payment_status = "paid"
            order.status = "confirmed"
            from app.core.utils import utc_now
            order.updated_at = utc_now()
            session.add(order)
            session.commit()
            
            # Notify seller
            seller = session.get(User, order.seller_id)
            if seller:
                try:
                    send_notification_sms(
                        to=seller.phone,
                        template_key="PAYMENT_RECEIVED",
                        params={
                            "amount": response.amount,
                            "txn_id": request.transaction_id[:12]
                        },
                        language=seller.language
                    )
                except Exception as e:
                    logger.warning(f"Failed to send payment notification: {e}")
        
        logger.info(f"Payment confirmed: {request.transaction_id}")
    
    return {
        "success": response.status == PaymentStatus.SUCCESS,
        "transaction_id": response.transaction_id,
        "status": response.status.value,
        "message": response.message
    }


@router.get("/status/{transaction_id}")
async def check_payment_status(
    transaction_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check payment status.
    """
    response = get_payment_status(transaction_id)
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return {
        "transaction_id": response.transaction_id,
        "status": response.status.value,
        "amount": response.amount,
        "order_id": response.order_id,
        "message": response.message
    }


@router.post("/refund")
async def request_refund(
    request: RefundRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Request a refund (admin or buyer only).
    """
    response = refund_payment(
        transaction_id=request.transaction_id,
        reason=request.reason
    )
    
    if response.status != PaymentStatus.REFUNDED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.message
        )
    
    logger.info(f"Payment refunded: {request.transaction_id}")
    
    return {
        "success": True,
        "transaction_id": response.transaction_id,
        "status": response.status.value,
        "message": response.message
    }


@router.get("/my")
async def get_my_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get current user's payment history.
    """
    from app.services.payments import payment_service
    
    # Get payments where user is payer or payee
    all_payments = []
    
    # From in-memory store
    for pid, pdata in payment_service.transactions.items():
        if pdata.get('payer_id') == current_user.id or pdata.get('payee_id') == current_user.id:
            all_payments.append({
                "id": pdata.get('transaction_id', pid),
                "order_id": pdata.get('order_id'),
                "amount": pdata.get('amount'),
                "status": pdata.get('status'),
                "payment_method": pdata.get('method'),
                "created_at": pdata.get('created_at')
            })
    
    # Sort by created_at
    all_payments.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    # Paginate
    start = (page - 1) * limit
    end = start + limit
    paginated = all_payments[start:end]
    
    return {
        "payments": paginated,
        "page": page,
        "limit": limit,
        "total": len(all_payments)
    }


@router.get("/{payment_id}/receipt")
async def get_payment_receipt(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get payment receipt/details.
    """
    from app.services.payments import payment_service
    
    payment = payment_service._payments.get(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check authorization
    if payment.get('payer_id') != current_user.id and payment.get('payee_id') != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this receipt"
        )
    
    return {
        "receipt": {
            "transaction_id": payment.get('transaction_id', payment_id),
            "order_id": payment.get('order_id'),
            "amount": payment.get('amount'),
            "status": payment.get('status'),
            "payment_method": payment.get('method'),
            "payer_id": payment.get('payer_id'),
            "payee_id": payment.get('payee_id'),
            "created_at": payment.get('created_at'),
            "completed_at": payment.get('completed_at')
        },
        "download_url": f"/api/v1/payments/{payment_id}/pdf"
    }


@router.get("/history")
async def get_payment_history(
    role: str = Query("payer", pattern="^(payer|payee)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    Get payment history for current user.
    """
    from app.services.payments import payment_service
    
    payments = payment_service.get_payment_history(current_user.id, role)
    
    # Paginate
    start = (page - 1) * limit
    end = start + limit
    paginated = payments[start:end]
    
    return {
        "payments": paginated,
        "page": page,
        "limit": limit,
        "total": len(payments)
    }


# =============================================================================
# WEBHOOK FOR PAYMENT GATEWAY (Production use)
# =============================================================================

@router.post("/webhook/gateway")
async def payment_gateway_webhook(
    payload: dict,
    session: Session = Depends(get_session)
):
    """
    Webhook endpoint for payment gateway callbacks.
    In production, verify signature and process payment status.
    """
    # This would be implemented based on actual payment gateway (Razorpay, etc.)
    logger.info(f"Payment gateway webhook: {payload}")
    
    # For demo, just log
    from app.core.utils import get_fallback_store
    store = get_fallback_store("events_log")
    store.append({
        "type": "payment_webhook",
        "payload": payload,
        "timestamp": str(__import__("datetime").datetime.now())
    })
    
    return {"status": "received"}


# =============================================================================
# RAZORPAY INTEGRATION ENDPOINTS
# =============================================================================

class RazorpayOrderRequest(BaseModel):
    """Create Razorpay order request."""
    order_id: str = Field(..., description="Our internal order ID")
    amount: float = Field(..., gt=0, description="Amount in INR")
    currency: str = Field(default="INR")
    notes: Optional[dict] = None


class RazorpayVerifyRequest(BaseModel):
    """Verify Razorpay payment request."""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    our_order_id: str


class RazorpayRefundRequest(BaseModel):
    """Razorpay refund request."""
    payment_id: str
    amount: Optional[float] = None  # Full refund if not specified
    reason: str = Field(default="Customer request")


@router.post("/razorpay/create-order")
async def create_razorpay_order(
    request: RazorpayOrderRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a Razorpay order for payment.
    Returns order_id and key_id for frontend integration.
    """
    from app.services.razorpay import razorpay_service
    
    # Validate our order exists
    order = session.get(Order, request.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization
    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to pay for this order"
        )
    
    # Create Razorpay order
    notes = request.notes or {}
    notes["our_order_id"] = request.order_id
    notes["buyer_id"] = current_user.id
    
    rp_order = razorpay_service.create_order(
        amount=request.amount,
        currency=request.currency,
        receipt=f"rcpt_{request.order_id[:20]}",
        notes=notes
    )
    
    # Store Razorpay order ID in our order
    order.razorpay_order_id = rp_order.id
    session.add(order)
    session.commit()
    
    logger.info(f"Razorpay order created: {rp_order.id} for order {request.order_id}")
    
    return {
        "success": True,
        "razorpay_order_id": rp_order.id,
        "razorpay_key_id": razorpay_service.key_id or "rzp_test_mock",
        "amount": rp_order.amount,
        "currency": rp_order.currency,
        "our_order_id": request.order_id,
        "mock_mode": razorpay_service.mock_mode
    }


@router.post("/razorpay/verify")
async def verify_razorpay_payment(
    request: RazorpayVerifyRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Verify Razorpay payment signature after successful payment.
    Updates order status if payment is verified.
    """
    from app.services.razorpay import razorpay_service
    from app.core.utils import utc_now
    
    # Verify signature
    is_valid = razorpay_service.verify_payment(
        order_id=request.razorpay_order_id,
        payment_id=request.razorpay_payment_id,
        signature=request.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed - invalid signature"
        )
    
    # Update our order
    order = session.get(Order, request.our_order_id)
    if order:
        order.payment_status = "paid"
        order.status = "confirmed"
        order.razorpay_payment_id = request.razorpay_payment_id
        order.updated_at = utc_now()
        session.add(order)
        session.commit()
        
        # Notify seller
        seller = session.get(User, order.seller_id)
        if seller:
            try:
                send_notification_sms(
                    to=seller.phone,
                    template_key="PAYMENT_RECEIVED",
                    params={
                        "amount": order.total_amount,
                        "order_id": order.id[:12]
                    },
                    language=seller.language
                )
            except Exception as e:
                logger.warning(f"Failed to send payment SMS: {e}")
        
        logger.info(f"Razorpay payment verified: {request.razorpay_payment_id}")
    
    return {
        "success": True,
        "verified": True,
        "order_id": request.our_order_id,
        "payment_id": request.razorpay_payment_id,
        "message": "Payment verified successfully"
    }


@router.get("/razorpay/status/{payment_id}")
async def get_razorpay_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get Razorpay payment status.
    """
    from app.services.razorpay import razorpay_service
    
    status = razorpay_service.get_payment_status(payment_id)
    
    return {
        "payment_id": status.id,
        "status": status.status,
        "amount": status.amount,
        "currency": status.currency,
        "method": status.method,
        "captured": status.captured,
        "error": status.error_description
    }


@router.post("/razorpay/refund")
async def refund_razorpay_payment(
    request: RazorpayRefundRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Initiate refund for a Razorpay payment.
    Admin or seller only.
    """
    from app.services.razorpay import razorpay_service
    
    # Check if user is admin or involved in the order
    # For now, allow any authenticated user (should be restricted in production)
    
    refund = razorpay_service.refund_payment(
        payment_id=request.payment_id,
        amount=request.amount
    )
    
    logger.info(f"Razorpay refund initiated: {refund.id} for payment {request.payment_id}")
    
    return {
        "success": True,
        "refund_id": refund.id,
        "payment_id": refund.payment_id,
        "amount": refund.amount,
        "status": refund.status
    }


@router.post("/razorpay/webhook")
async def razorpay_webhook(
    payload: dict,
    session: Session = Depends(get_session)
):
    """
    Razorpay webhook endpoint for payment events.
    In production, verify webhook signature.
    """
    from app.core.utils import utc_now
    from app.services.escrow import get_escrow_service
    
    event = payload.get("event")
    payment_data = payload.get("payload", {}).get("payment", {}).get("entity", {})
    
    logger.info(f"Razorpay webhook: {event}")
    
    if event == "payment.captured":
        # Payment successful
        notes = payment_data.get("notes", {})
        our_order_id = notes.get("our_order_id")
        
        if our_order_id:
            order = session.get(Order, our_order_id)
            if order:
                order.payment_status = "paid"
                order.status = "confirmed"
                order.razorpay_payment_id = payment_data.get("id")
                order.updated_at = utc_now()
                session.add(order)
                session.commit()
                
                # Create escrow hold
                try:
                    escrow_service = get_escrow_service()
                    escrow_service.create_escrow_hold(session, our_order_id)
                except Exception as e:
                    logger.error(f"Failed to create escrow: {e}")
    
    elif event == "payment.failed":
        notes = payment_data.get("notes", {})
        our_order_id = notes.get("our_order_id")
        
        if our_order_id:
            order = session.get(Order, our_order_id)
            if order:
                order.payment_status = "failed"
                order.updated_at = utc_now()
                session.add(order)
                session.commit()
    
    elif event == "refund.created":
        refund_data = payload.get("payload", {}).get("refund", {}).get("entity", {})
        logger.info(f"Refund created: {refund_data.get('id')}")
    
    return {"status": "ok"}


# =============================================================================
# ESCROW ENDPOINTS
# =============================================================================

class EscrowHoldRequest(BaseModel):
    """Request to create an escrow hold."""
    order_id: str = Field(..., description="Order ID to hold funds for")


class EscrowReleaseRequest(BaseModel):
    """Request to release escrow funds."""
    order_id: str = Field(..., description="Order ID to release funds for")


class EscrowRefundRequest(BaseModel):
    """Request to refund escrow."""
    order_id: str = Field(..., description="Order ID to refund")
    reason: Optional[str] = Field(None, description="Reason for refund")


class DisputeRequest(BaseModel):
    """Request to file a dispute."""
    order_id: str = Field(..., description="Order ID to dispute")
    reason: str = Field(..., description="Reason for dispute")


class ResolveDisputeRequest(BaseModel):
    """Request to resolve a dispute."""
    order_id: str = Field(..., description="Order ID")
    resolution: str = Field(..., description="Resolution: refund, release, partial_refund")
    partial_amount: Optional[float] = Field(None, description="Amount for partial refund")


@router.post("/escrow/hold")
async def create_escrow_hold(
    request: EscrowHoldRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create an escrow hold for an order after payment.
    Usually called automatically after payment confirmation.
    """
    from app.services.escrow import get_escrow_service
    
    # Verify order exists and belongs to user
    order = session.get(Order, request.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this order"
        )
    
    if order.payment_status != "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment not completed yet"
        )
    
    try:
        escrow_service = get_escrow_service()
        escrow = escrow_service.create_escrow_hold(session, request.order_id)
        
        return success_response(
            message="Escrow hold created",
            data={
                "escrow_id": escrow.id,
                "order_id": escrow.order_id,
                "amount": escrow.amount,
                "platform_fee": escrow.platform_fee,
                "seller_amount": escrow.seller_amount,
                "status": escrow.status,
                "held_at": escrow.held_at.isoformat()
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/escrow/release")
async def release_escrow(
    request: EscrowReleaseRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Release escrow funds to seller after delivery confirmation.
    Only buyer or admin can release funds.
    """
    from app.services.escrow import get_escrow_service
    
    # Verify order exists
    order = session.get(Order, request.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only buyer or admin can release
    if order.buyer_id != current_user.id and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyer or admin can release escrow"
        )
    
    # Check delivery status
    if order.status != "delivered" and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must be delivered before releasing escrow"
        )
    
    try:
        escrow_service = get_escrow_service()
        escrow = escrow_service.release_escrow(session, request.order_id, current_user.id)
        
        # Update order status
        order.status = "completed"
        order.updated_at = __import__('app.core.utils', fromlist=['utc_now']).utc_now()
        session.add(order)
        session.commit()
        
        return success_response(
            message="Escrow released to seller",
            data={
                "escrow_id": escrow.id,
                "seller_amount": escrow.seller_amount,
                "status": escrow.status,
                "released_at": escrow.released_at.isoformat() if escrow.released_at else None,
                "transaction_id": escrow.release_transaction_id
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/escrow/refund")
async def refund_escrow(
    request: EscrowRefundRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Refund escrow to buyer (for cancellations).
    Only seller or admin can initiate refund.
    """
    from app.services.escrow import get_escrow_service
    
    # Verify order exists
    order = session.get(Order, request.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only seller or admin can refund
    if order.seller_id != current_user.id and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller or admin can refund escrow"
        )
    
    try:
        escrow_service = get_escrow_service()
        escrow = escrow_service.refund_escrow(session, request.order_id, request.reason)
        
        # Update order status
        order.status = "cancelled"
        order.payment_status = "refunded"
        order.updated_at = __import__('app.core.utils', fromlist=['utc_now']).utc_now()
        session.add(order)
        session.commit()
        
        return success_response(
            message="Escrow refunded to buyer",
            data={
                "escrow_id": escrow.id,
                "refund_amount": escrow.amount,
                "status": escrow.status,
                "refunded_at": escrow.refunded_at.isoformat() if escrow.refunded_at else None,
                "transaction_id": escrow.refund_transaction_id
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/escrow/dispute")
async def file_dispute(
    request: DisputeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    File a dispute on an escrow hold.
    Buyer can dispute before releasing funds.
    """
    from app.services.escrow import get_escrow_service
    
    # Verify order exists
    order = session.get(Order, request.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only buyer can file dispute
    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyer can file dispute"
        )
    
    try:
        escrow_service = get_escrow_service()
        escrow = escrow_service.file_dispute(
            session, request.order_id, request.reason, current_user.id
        )
        
        # Update order status
        order.status = "disputed"
        order.updated_at = __import__('app.core.utils', fromlist=['utc_now']).utc_now()
        session.add(order)
        session.commit()
        
        return success_response(
            message="Dispute filed successfully",
            data={
                "escrow_id": escrow.id,
                "status": escrow.status,
                "dispute_reason": escrow.dispute_reason,
                "dispute_filed_at": escrow.dispute_filed_at.isoformat() if escrow.dispute_filed_at else None
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/escrow/resolve")
async def resolve_dispute(
    request: ResolveDisputeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Resolve a dispute (Admin only).
    """
    from app.services.escrow import get_escrow_service
    
    # Only admin can resolve disputes
    if not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can resolve disputes"
        )
    
    if request.resolution not in ["refund", "release", "partial_refund"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resolution. Must be: refund, release, or partial_refund"
        )
    
    try:
        escrow_service = get_escrow_service()
        escrow = escrow_service.resolve_dispute(
            session,
            request.order_id,
            request.resolution,
            request.partial_amount,
            current_user.id
        )
        
        return success_response(
            message=f"Dispute resolved: {request.resolution}",
            data={
                "escrow_id": escrow.id,
                "status": escrow.status,
                "resolution": request.resolution
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/escrow/{order_id}")
async def get_escrow_status(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get escrow status for an order.
    """
    from app.services.escrow import get_escrow_service
    
    # Verify order exists and user has access
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.buyer_id != current_user.id and order.seller_id != current_user.id and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized for this order"
        )
    
    escrow_service = get_escrow_service()
    escrow_status = escrow_service.get_escrow_status(session, order_id)
    
    if not escrow_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No escrow found for this order"
        )
    
    return success_response(
        message="Escrow status retrieved",
        data=escrow_status
    )

