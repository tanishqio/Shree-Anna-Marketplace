"""
Shree Anna Backend - Escrow Service
Handles holding funds between payment and delivery confirmation.
"""

from datetime import datetime
from typing import Optional
from loguru import logger
from sqlmodel import Session, select

from app.core.utils import generate_uuid, utc_now
from app.db.models import Escrow, Order, Payment


# Platform fee percentage (e.g., 2.5%)
PLATFORM_FEE_PERCENT = 2.5


class EscrowService:
    """
    Escrow service for managing payment holds.
    
    Flow:
    1. Payment completed -> create_escrow_hold()
    2. Delivery confirmed -> release_escrow()
    3. Dispute filed -> dispute_escrow()
    4. Dispute resolved -> resolve_dispute()
    5. Order cancelled -> refund_escrow()
    """
    
    def __init__(self, mock_mode: bool = True):
        """
        Initialize escrow service.
        
        Args:
            mock_mode: If True, simulates escrow operations without actual fund transfers
        """
        self.mock_mode = mock_mode
        if mock_mode:
            logger.warning("Escrow service running in MOCK mode - no actual transfers")
    
    def calculate_fees(self, amount: float) -> dict:
        """
        Calculate platform fee and seller amount.
        
        Args:
            amount: Total transaction amount
            
        Returns:
            dict with platform_fee and seller_amount
        """
        platform_fee = round(amount * (PLATFORM_FEE_PERCENT / 100), 2)
        seller_amount = round(amount - platform_fee, 2)
        
        return {
            "total_amount": amount,
            "platform_fee": platform_fee,
            "seller_amount": seller_amount,
            "fee_percent": PLATFORM_FEE_PERCENT
        }
    
    def create_escrow_hold(
        self,
        session: Session,
        order_id: str,
        payment_id: Optional[str] = None,
        amount: Optional[float] = None
    ) -> Escrow:
        """
        Create an escrow hold for an order after payment.
        
        Args:
            session: Database session
            order_id: Order ID
            payment_id: Optional payment ID
            amount: Amount to hold (defaults to order total)
            
        Returns:
            Created Escrow record
        """
        # Get order
        order = session.get(Order, order_id)
        if not order:
            raise ValueError(f"Order not found: {order_id}")
        
        # Check if escrow already exists
        existing = session.exec(
            select(Escrow).where(Escrow.order_id == order_id)
        ).first()
        
        if existing:
            logger.warning(f"Escrow already exists for order {order_id}")
            return existing
        
        # Calculate amounts
        hold_amount = amount or order.total_amount
        fees = self.calculate_fees(hold_amount)
        
        # Create escrow
        escrow = Escrow(
            order_id=order_id,
            payment_id=payment_id,
            amount=hold_amount,
            platform_fee=fees["platform_fee"],
            seller_amount=fees["seller_amount"],
            status="held",
            held_at=utc_now()
        )
        
        session.add(escrow)
        session.commit()
        session.refresh(escrow)
        
        logger.info(f"Escrow created: {escrow.id} for order {order_id}, amount: ₹{hold_amount}")
        
        if self.mock_mode:
            logger.info(f"[MOCK] Funds held: ₹{hold_amount}")
        
        return escrow
    
    def release_escrow(
        self,
        session: Session,
        order_id: str,
        released_by: Optional[str] = None
    ) -> Escrow:
        """
        Release escrow funds to seller after delivery confirmation.
        
        Args:
            session: Database session
            order_id: Order ID
            released_by: User ID who triggered release
            
        Returns:
            Updated Escrow record
        """
        # Get escrow
        escrow = session.exec(
            select(Escrow).where(Escrow.order_id == order_id)
        ).first()
        
        if not escrow:
            raise ValueError(f"Escrow not found for order: {order_id}")
        
        if escrow.status not in ["held"]:
            raise ValueError(f"Cannot release escrow with status: {escrow.status}")
        
        # Get order to find seller
        order = session.get(Order, order_id)
        
        # Simulate transfer to seller
        if self.mock_mode:
            transaction_id = f"mock_release_{generate_uuid()[:8]}"
            logger.info(f"[MOCK] Releasing ₹{escrow.seller_amount} to seller {order.seller_id}")
        else:
            # TODO: Integrate with actual payment provider for payout
            transaction_id = f"release_{generate_uuid()[:8]}"
        
        # Update escrow
        escrow.status = "released"
        escrow.released_at = utc_now()
        escrow.released_to = order.seller_id
        escrow.release_transaction_id = transaction_id
        escrow.updated_at = utc_now()
        
        session.add(escrow)
        session.commit()
        session.refresh(escrow)
        
        logger.info(f"Escrow {escrow.id} released: ₹{escrow.seller_amount} to seller")
        
        return escrow
    
    def refund_escrow(
        self,
        session: Session,
        order_id: str,
        reason: Optional[str] = None,
        partial_amount: Optional[float] = None
    ) -> Escrow:
        """
        Refund escrow to buyer (for cancellations or disputes).
        
        Args:
            session: Database session
            order_id: Order ID
            reason: Refund reason
            partial_amount: If specified, refund this amount (partial refund)
            
        Returns:
            Updated Escrow record
        """
        # Get escrow
        escrow = session.exec(
            select(Escrow).where(Escrow.order_id == order_id)
        ).first()
        
        if not escrow:
            raise ValueError(f"Escrow not found for order: {order_id}")
        
        if escrow.status not in ["held", "disputed"]:
            raise ValueError(f"Cannot refund escrow with status: {escrow.status}")
        
        # Get order to find buyer
        order = session.get(Order, order_id)
        
        refund_amount = partial_amount or escrow.amount
        
        # Simulate refund to buyer
        if self.mock_mode:
            transaction_id = f"mock_refund_{generate_uuid()[:8]}"
            logger.info(f"[MOCK] Refunding ₹{refund_amount} to buyer {order.buyer_id}")
        else:
            # TODO: Integrate with Razorpay refund API
            transaction_id = f"refund_{generate_uuid()[:8]}"
        
        # Update escrow
        escrow.status = "refunded"
        escrow.refunded_at = utc_now()
        escrow.refunded_to = order.buyer_id
        escrow.refund_transaction_id = transaction_id
        escrow.notes = reason
        escrow.updated_at = utc_now()
        
        session.add(escrow)
        session.commit()
        session.refresh(escrow)
        
        logger.info(f"Escrow {escrow.id} refunded: ₹{refund_amount} to buyer")
        
        return escrow
    
    def file_dispute(
        self,
        session: Session,
        order_id: str,
        reason: str,
        filed_by: str
    ) -> Escrow:
        """
        File a dispute on an escrow hold.
        
        Args:
            session: Database session
            order_id: Order ID
            reason: Dispute reason
            filed_by: User ID who filed dispute
            
        Returns:
            Updated Escrow record
        """
        # Get escrow
        escrow = session.exec(
            select(Escrow).where(Escrow.order_id == order_id)
        ).first()
        
        if not escrow:
            raise ValueError(f"Escrow not found for order: {order_id}")
        
        if escrow.status != "held":
            raise ValueError(f"Cannot dispute escrow with status: {escrow.status}")
        
        # Update escrow
        escrow.status = "disputed"
        escrow.dispute_reason = reason
        escrow.dispute_filed_at = utc_now()
        escrow.updated_at = utc_now()
        
        session.add(escrow)
        session.commit()
        session.refresh(escrow)
        
        logger.info(f"Dispute filed on escrow {escrow.id} by {filed_by}: {reason}")
        
        return escrow
    
    def resolve_dispute(
        self,
        session: Session,
        order_id: str,
        resolution: str,
        partial_refund_amount: Optional[float] = None,
        resolved_by: Optional[str] = None
    ) -> Escrow:
        """
        Resolve a dispute on an escrow.
        
        Args:
            session: Database session
            order_id: Order ID
            resolution: Resolution type (refund, release, partial_refund)
            partial_refund_amount: Amount to refund if partial
            resolved_by: Admin user ID who resolved
            
        Returns:
            Updated Escrow record
        """
        # Get escrow
        escrow = session.exec(
            select(Escrow).where(Escrow.order_id == order_id)
        ).first()
        
        if not escrow:
            raise ValueError(f"Escrow not found for order: {order_id}")
        
        if escrow.status != "disputed":
            raise ValueError(f"Cannot resolve non-disputed escrow: {escrow.status}")
        
        # Update escrow
        escrow.dispute_resolved_at = utc_now()
        escrow.dispute_resolution = resolution
        escrow.updated_at = utc_now()
        
        session.add(escrow)
        session.commit()
        
        # Apply resolution
        if resolution == "refund":
            return self.refund_escrow(session, order_id, "Dispute resolved: full refund")
        elif resolution == "release":
            return self.release_escrow(session, order_id)
        elif resolution == "partial_refund" and partial_refund_amount:
            return self.refund_escrow(session, order_id, "Dispute resolved: partial refund", partial_refund_amount)
        
        session.refresh(escrow)
        return escrow
    
    def get_escrow_status(self, session: Session, order_id: str) -> Optional[dict]:
        """
        Get escrow status for an order.
        
        Args:
            session: Database session
            order_id: Order ID
            
        Returns:
            Escrow status dict or None
        """
        escrow = session.exec(
            select(Escrow).where(Escrow.order_id == order_id)
        ).first()
        
        if not escrow:
            return None
        
        return {
            "id": escrow.id,
            "order_id": escrow.order_id,
            "status": escrow.status,
            "amount": escrow.amount,
            "platform_fee": escrow.platform_fee,
            "seller_amount": escrow.seller_amount,
            "held_at": escrow.held_at.isoformat() if escrow.held_at else None,
            "released_at": escrow.released_at.isoformat() if escrow.released_at else None,
            "refunded_at": escrow.refunded_at.isoformat() if escrow.refunded_at else None,
            "dispute_status": {
                "is_disputed": escrow.status == "disputed",
                "reason": escrow.dispute_reason,
                "filed_at": escrow.dispute_filed_at.isoformat() if escrow.dispute_filed_at else None,
                "resolved_at": escrow.dispute_resolved_at.isoformat() if escrow.dispute_resolved_at else None,
                "resolution": escrow.dispute_resolution
            } if escrow.dispute_reason else None
        }


# Singleton instance
_escrow_service: Optional[EscrowService] = None


def get_escrow_service() -> EscrowService:
    """Get or create escrow service singleton."""
    global _escrow_service
    if _escrow_service is None:
        # Mock mode by default in development
        import os
        mock_mode = os.getenv("ESCROW_MOCK_MODE", "true").lower() == "true"
        _escrow_service = EscrowService(mock_mode=mock_mode)
    return _escrow_service
