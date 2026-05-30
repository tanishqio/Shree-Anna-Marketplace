"""
Shree Anna Backend - Orders API Routes
Order management after offer acceptance.
"""

from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from loguru import logger

from app.core.security import get_current_user
from app.core.utils import success_response, utc_now
from app.db import get_session, User, Listing, Offer, Order, OrderEvent
from app.services.sms import send_notification_sms


router = APIRouter(prefix="/orders", tags=["Orders"])


class BuyNowRequest(BaseModel):
    """Buy Now request - direct purchase without negotiation."""
    listing_id: str = Field(..., description="Listing to purchase")
    qty_kg: float = Field(..., gt=0, description="Quantity to buy in kg")
    shipping_address: Optional[str] = Field(None, description="Delivery address")
    notes: Optional[str] = Field(None, description="Order notes")


class ShipOrderRequest(BaseModel):
    """Ship order request."""
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    expected_delivery: Optional[str] = None


class ConfirmDeliveryRequest(BaseModel):
    """Delivery confirmation request."""
    delivery_proof_url: Optional[str] = Field(None, description="Photo proof of delivery")
    notes: Optional[str] = Field(None, description="Delivery notes")


class UpdateOrderStatusRequest(BaseModel):
    """Update order status request."""
    status: str


class OrderResponse(BaseModel):
    """Order response model."""
    id: str
    offer_id: Optional[str] = None
    listing_id: Optional[str] = None
    seller_id: Optional[str] = None
    buyer_id: str
    qty_kg: float
    price_per_qtl: float
    total_amount: float
    status: str
    shipping_address: Optional[str] = None
    tracking_number: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None


# Valid status transitions
STATUS_TRANSITIONS = {
    "created": ["confirmed", "cancelled"],
    "confirmed": ["processing", "cancelled"],
    "processing": ["shipped", "cancelled"],
    "shipped": ["delivered", "cancelled"],
    "delivered": ["completed"],
    "completed": [],
    "cancelled": []
}

# Human-readable status titles
STATUS_TITLES = {
    "created": "Order Created",
    "confirmed": "Order Confirmed",
    "processing": "Processing Order",
    "shipped": "Order Shipped",
    "delivered": "Order Delivered",
    "completed": "Order Completed",
    "cancelled": "Order Cancelled"
}


def log_order_event(
    session: Session,
    order_id: str,
    event_type: str,
    title: str,
    actor_id: Optional[str] = None,
    actor_type: Optional[str] = None,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    description: Optional[str] = None,
    location: Optional[str] = None,
    extra_data: Optional[str] = None,
    estimated_next_at: Optional[datetime] = None
) -> OrderEvent:
    """Helper function to log order events for tracking."""
    event = OrderEvent(
        order_id=order_id,
        event_type=event_type,
        title=title,
        actor_id=actor_id,
        actor_type=actor_type,
        previous_status=previous_status,
        new_status=new_status,
        description=description,
        location=location,
        extra_data=extra_data,
        estimated_next_at=estimated_next_at
    )
    session.add(event)
    return event


@router.get("/my")
async def get_my_orders(
    role: str = Query("seller", description="Role: seller or buyer"),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get orders for current user.
    Role determines whether to get orders as seller or buyer.
    """
    offset = (page - 1) * limit
    
    if role == "seller":
        statement = select(Order).where(Order.seller_id == current_user.id)
    else:
        statement = select(Order).where(Order.buyer_id == current_user.id)
    
    if status_filter:
        statement = statement.where(Order.status == status_filter)
    
    statement = statement.offset(offset).limit(limit).order_by(Order.created_at.desc())
    orders = session.exec(statement).all()
    
    items = []
    for order in orders:
        listing = session.get(Listing, order.listing_id) if order.listing_id else None
        seller = session.get(User, order.seller_id) if order.seller_id else None
        buyer = session.get(User, order.buyer_id)
        
        items.append({
            "id": order.id,
            "offer_id": order.offer_id,
            "listing_id": order.listing_id,
            "listing_crop": listing.crop if listing else None,
            "seller_id": order.seller_id,
            "seller_name": seller.name if seller else None,
            "seller_phone": seller.phone if seller else None,
            "buyer_id": order.buyer_id,
            "buyer_name": buyer.name if buyer else None,
            "buyer_phone": buyer.phone if buyer else None,
            "qty_kg": order.qty_kg,
            "price_per_qtl": order.price_per_qtl,
            "total_amount": order.total_amount,
            "status": order.status,
            "payment_status": order.payment_status,
            "logistics_status": order.logistics_status,
            "tracking_number": order.tracking_number,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None
        })
    
    return {"orders": items, "total": len(items), "page": page, "limit": limit}


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get order details."""
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization (seller or buyer)
    if order.seller_id != current_user.id and order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    listing = session.get(Listing, order.listing_id) if order.listing_id else None
    seller = session.get(User, order.seller_id) if order.seller_id else None
    buyer = session.get(User, order.buyer_id)
    
    return {
        "id": order.id,
        "offer_id": order.offer_id,
        "listing_id": order.listing_id,
        "listing": {
            "crop": listing.crop if listing else None,
            "qty_kg": listing.qty_kg if listing else None,
            "district": listing.district if listing else None
        } if listing else None,
        "seller_id": order.seller_id,
        "seller_name": seller.name if seller else None,
        "seller_phone": seller.phone if seller else None,
        "seller_district": seller.district if seller else None,
        "buyer_id": order.buyer_id,
        "buyer_name": buyer.name if buyer else None,
        "buyer_phone": buyer.phone if buyer else None,
        "qty_kg": order.qty_kg,
        "price_per_qtl": order.price_per_qtl,
        "total_amount": order.total_amount,
        "status": order.status,
        "payment_status": order.payment_status,
        "logistics_status": order.logistics_status,
        "shipping_address": order.shipping_address,
        "tracking_number": order.tracking_number,
        "delivery_date": order.delivery_date.isoformat() if order.delivery_date else None,
        "notes": order.notes,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }


@router.get("/{order_id}/history")
async def get_order_history(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get order history/timeline.
    Returns all events for an order in chronological order.
    """
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization (seller or buyer)
    if order.seller_id != current_user.id and order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    # Get all events for this order
    statement = select(OrderEvent).where(
        OrderEvent.order_id == order_id
    ).order_by(OrderEvent.timestamp.asc())
    
    events = session.exec(statement).all()
    
    # If no events exist, create initial event from order creation
    if not events:
        initial_event = log_order_event(
            session=session,
            order_id=order_id,
            event_type="status_change",
            title="Order Created",
            new_status="created",
            actor_type="system",
            description=f"Order created for {order.qty_kg}kg at ₹{order.price_per_qtl}/qtl"
        )
        initial_event.timestamp = order.created_at  # Backdate to order creation
        session.commit()
        events = [initial_event]
    
    timeline = []
    for event in events:
        actor = session.get(User, event.actor_id) if event.actor_id else None
        timeline.append({
            "id": event.id,
            "event_type": event.event_type,
            "title": event.title,
            "description": event.description,
            "previous_status": event.previous_status,
            "new_status": event.new_status,
            "actor_id": event.actor_id,
            "actor_name": actor.name if actor else None,
            "actor_type": event.actor_type,
            "location": event.location,
            "timestamp": event.timestamp.isoformat() if event.timestamp else None,
            "estimated_next_at": event.estimated_next_at.isoformat() if event.estimated_next_at else None
        })
    
    return {
        "order_id": order_id,
        "current_status": order.status,
        "total_events": len(timeline),
        "timeline": timeline
    }


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    request: UpdateOrderStatusRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update order status.
    Validates status transitions.
    """
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization
    if order.seller_id != current_user.id and order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    
    # Validate status transition
    allowed_transitions = STATUS_TRANSITIONS.get(order.status, [])
    if request.status not in allowed_transitions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from '{order.status}' to '{request.status}'"
        )
    
    old_status = order.status
    order.status = request.status
    order.updated_at = utc_now()
    
    session.add(order)
    
    # Log the status change event
    actor_type = "seller" if current_user.id == order.seller_id else "buyer"
    log_order_event(
        session=session,
        order_id=order_id,
        event_type="status_change",
        title=STATUS_TITLES.get(request.status, f"Status changed to {request.status}"),
        actor_id=current_user.id,
        actor_type=actor_type,
        previous_status=old_status,
        new_status=request.status,
        description=f"Order status updated from {old_status} to {request.status}"
    )
    
    session.commit()
    session.refresh(order)
    
    # Notify other party
    other_user_id = order.buyer_id if current_user.id == order.seller_id else order.seller_id
    if other_user_id:
        other_user = session.get(User, other_user_id)
        if other_user:
            try:
                send_notification_sms(
                    to=other_user.phone,
                    template_key="ORDER_STATUS_UPDATE",
                    params={"status": request.status, "order_id": order_id[:8]},
                    language=other_user.language
                )
            except Exception as e:
                logger.warning(f"Failed to send status notification: {e}")
    
    logger.info(f"Order {order_id} status: {old_status} -> {request.status}")
    
    return {
        "id": order.id,
        "status": order.status,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }


@router.post("/{order_id}/ship")
async def ship_order(
    order_id: str,
    request: ShipOrderRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Mark order as shipped/in transit.
    Only seller can ship.
    """
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller can ship order"
        )
    
    if order.status not in ["confirmed", "processing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot ship order with status '{order.status}'"
        )
    
    old_status = order.status
    order.status = "shipped"
    order.logistics_status = "in_transit"
    order.tracking_number = request.vehicle_number
    order.notes = f"Driver: {request.driver_name or 'N/A'}, Phone: {request.driver_phone or 'N/A'}"
    order.updated_at = utc_now()
    
    session.add(order)
    
    # Log shipment event
    log_order_event(
        session=session,
        order_id=order_id,
        event_type="shipment",
        title="Order Shipped",
        actor_id=current_user.id,
        actor_type="seller",
        previous_status=old_status,
        new_status="shipped",
        description=f"Vehicle: {request.vehicle_number or 'N/A'}, Driver: {request.driver_name or 'N/A'}"
    )
    
    session.commit()
    session.refresh(order)
    
    # Notify buyer
    buyer = session.get(User, order.buyer_id)
    if buyer:
        try:
            send_notification_sms(
                to=buyer.phone,
                template_key="ORDER_SHIPPED",
                params={
                    "vehicle": request.vehicle_number or "N/A",
                    "driver": request.driver_name or "N/A"
                },
                language=buyer.language
            )
        except Exception as e:
            logger.warning(f"Failed to send shipping notification: {e}")
    
    logger.info(f"Order {order_id} shipped")
    
    return {
        "id": order.id,
        "status": order.status,
        "tracking_number": order.tracking_number,
        "logistics_status": order.logistics_status,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }


@router.post("/{order_id}/deliver")
async def deliver_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Mark order as delivered.
    Buyer confirms delivery.
    """
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Both seller and buyer can mark as delivered
    if order.seller_id != current_user.id and order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if order.status != "shipped":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot mark delivered from status '{order.status}'"
        )
    
    old_status = order.status
    order.status = "delivered"
    order.logistics_status = "delivered"
    order.delivery_date = utc_now()
    order.updated_at = utc_now()
    
    session.add(order)
    
    # Log delivery event
    actor_type = "seller" if current_user.id == order.seller_id else "buyer"
    log_order_event(
        session=session,
        order_id=order_id,
        event_type="delivery",
        title="Order Delivered",
        actor_id=current_user.id,
        actor_type=actor_type,
        previous_status=old_status,
        new_status="delivered",
        description="Order has been delivered successfully"
    )
    
    session.commit()
    session.refresh(order)
    
    # Notify both parties
    seller = session.get(User, order.seller_id) if order.seller_id else None
    buyer = session.get(User, order.buyer_id)
    
    for user in [seller, buyer]:
        if user and user.id != current_user.id:
            try:
                send_notification_sms(
                    to=user.phone,
                    template_key="ORDER_DELIVERED",
                    params={"order_id": order_id[:8]},
                    language=user.language
                )
            except Exception as e:
                logger.warning(f"Failed to send delivery notification: {e}")
    
    logger.info(f"Order {order_id} delivered")
    
    return {
        "id": order.id,
        "status": order.status,
        "logistics_status": order.logistics_status,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }


@router.post("/{order_id}/complete")
async def complete_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Mark order as completed (after payment confirmed).
    """
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Both seller and buyer can complete
    if order.seller_id != current_user.id and order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if order.status != "delivered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete order from status '{order.status}'"
        )
    
    old_status = order.status
    order.status = "completed"
    order.updated_at = utc_now()
    
    session.add(order)
    
    # Log completion event
    actor_type = "seller" if current_user.id == order.seller_id else "buyer"
    log_order_event(
        session=session,
        order_id=order_id,
        event_type="status_change",
        title="Order Completed",
        actor_id=current_user.id,
        actor_type=actor_type,
        previous_status=old_status,
        new_status="completed",
        description="Order has been completed. Thank you for your business!"
    )
    
    session.commit()
    session.refresh(order)
    
    logger.info(f"Order {order_id} completed")
    
    return {
        "id": order.id,
        "status": order.status,
        "message": "Order completed successfully",
        "updated_at": order.updated_at.isoformat() if order.updated_at else None
    }


@router.post("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Cancel an order.
    Only allowed before delivery.
    """
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.seller_id != current_user.id and order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if order.status in ["delivered", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel delivered/completed order"
        )
    
    old_status = order.status
    order.status = "cancelled"
    order.notes = reason or order.notes
    order.updated_at = utc_now()
    
    # Restore listing if applicable
    if order.listing_id:
        listing = session.get(Listing, order.listing_id)
        if listing and listing.status == "sold":
            listing.status = "active"
            listing.updated_at = utc_now()
            session.add(listing)
    
    session.add(order)
    
    # Log cancellation event
    actor_type = "seller" if current_user.id == order.seller_id else "buyer"
    log_order_event(
        session=session,
        order_id=order_id,
        event_type="status_change",
        title="Order Cancelled",
        actor_id=current_user.id,
        actor_type=actor_type,
        previous_status=old_status,
        new_status="cancelled",
        description=f"Order cancelled. Reason: {reason or 'No reason provided'}"
    )
    
    session.commit()
    
    # Notify other party
    other_user_id = order.buyer_id if current_user.id == order.seller_id else order.seller_id
    if other_user_id:
        other_user = session.get(User, other_user_id)
        if other_user:
            try:
                send_notification_sms(
                    to=other_user.phone,
                    template_key="ORDER_CANCELLED",
                    params={"order_id": order_id[:8], "reason": reason or "No reason provided"},
                    language=other_user.language
                )
            except Exception as e:
                logger.warning(f"Failed to send cancellation notification: {e}")
    
    logger.info(f"Order {order_id} cancelled")
    
    return {"success": True, "message": "Order cancelled", "status": "cancelled"}


# =============================================================================
# BUY NOW - Direct Purchase Without Negotiation
# =============================================================================

@router.post("/buy-now")
async def buy_now(
    request: BuyNowRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Direct purchase of a listing without offer negotiation.
    Creates order immediately at listing price.
    """
    import uuid
    
    # Get listing
    listing = session.get(Listing, request.listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Validate listing is active
    if listing.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Listing is not available for purchase (status: {listing.status})"
        )
    
    # Can't buy own listing
    if listing.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot purchase your own listing"
        )
    
    # Validate quantity
    if request.qty_kg > listing.qty_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity ({request.qty_kg} kg) exceeds available ({listing.qty_kg} kg)"
        )
    
    # Calculate total amount (price is per quintal = 100 kg)
    total_amount = (request.qty_kg / 100) * listing.min_price_per_qtl
    
    # Create order
    order = Order(
        id=str(uuid.uuid4()),
        buyer_id=current_user.id,
        seller_id=listing.owner_id,
        listing_id=listing.id,
        offer_id=None,  # No offer for direct purchase
        qty_kg=request.qty_kg,
        price_per_qtl=listing.min_price_per_qtl,
        total_amount=total_amount,
        status="created",
        payment_status="pending",
        logistics_status="pending",
        shipping_address=request.shipping_address,
        notes=request.notes,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    
    session.add(order)
    
    # Log order creation event
    log_order_event(
        session=session,
        order_id=order.id,
        event_type="status_change",
        title="Order Created",
        actor_id=current_user.id,
        actor_type="buyer",
        new_status="created",
        description=f"Buy Now order for {request.qty_kg}kg of {listing.crop} at ₹{listing.min_price_per_qtl}/qtl. Total: ₹{total_amount:.2f}"
    )
    
    # Update listing quantity or mark as sold
    if request.qty_kg >= listing.qty_kg:
        listing.status = "sold"
        listing.qty_kg = 0
    else:
        listing.qty_kg -= request.qty_kg
    listing.updated_at = utc_now()
    session.add(listing)
    
    session.commit()
    session.refresh(order)
    
    # Notify seller
    seller = session.get(User, listing.owner_id)
    if seller:
        try:
            send_notification_sms(
                to=seller.phone,
                template_key="NEW_ORDER",
                params={
                    "crop": listing.crop,
                    "qty": request.qty_kg,
                    "amount": total_amount,
                    "buyer": current_user.name or "Buyer"
                },
                language=seller.language
            )
        except Exception as e:
            logger.warning(f"Failed to send order notification: {e}")
    
    logger.info(f"Buy Now order created: {order.id} by {current_user.id}")
    
    return {
        "success": True,
        "message": "Order created successfully",
        "order": {
            "id": order.id,
            "listing_id": order.listing_id,
            "crop": listing.crop,
            "qty_kg": order.qty_kg,
            "price_per_qtl": order.price_per_qtl,
            "total_amount": order.total_amount,
            "status": order.status,
            "payment_status": order.payment_status,
            "seller_name": seller.name if seller else None,
            "seller_phone": seller.phone if seller else None,
            "created_at": order.created_at.isoformat()
        }
    }


# =============================================================================
# DELIVERY CONFIRMATION
# =============================================================================

@router.post("/{order_id}/confirm-delivery")
async def confirm_delivery(
    order_id: str,
    request: ConfirmDeliveryRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Confirm delivery of an order with optional photo proof.
    Can be done by seller (marking as delivered) or buyer (confirming receipt).
    """
    order = session.get(Order, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization
    if order.seller_id != current_user.id and order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm delivery for this order"
        )
    
    # Check order is in shipped status (for seller) or delivered (for buyer confirmation)
    is_seller = current_user.id == order.seller_id
    
    if is_seller:
        # Seller marking as delivered
        if order.status not in ["shipped", "processing", "confirmed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot confirm delivery. Order status is '{order.status}'"
            )
        order.status = "delivered"
        order.logistics_status = "delivered"
    else:
        # Buyer confirming receipt
        if order.status != "delivered":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order must be marked as delivered by seller first"
            )
        order.status = "completed"
    
    # Store delivery proof if provided
    if request.delivery_proof_url:
        order.delivery_proof_url = request.delivery_proof_url
    
    if request.notes:
        existing_notes = order.notes or ""
        order.notes = f"{existing_notes}\n[Delivery Notes]: {request.notes}".strip()
    
    order.delivery_date = utc_now()
    order.updated_at = utc_now()
    
    session.add(order)
    session.commit()
    
    # Notify other party
    other_user_id = order.buyer_id if is_seller else order.seller_id
    other_user = session.get(User, other_user_id) if other_user_id else None
    
    if other_user:
        try:
            template = "ORDER_DELIVERED" if is_seller else "ORDER_COMPLETED"
            send_notification_sms(
                to=other_user.phone,
                template_key=template,
                params={"order_id": order_id[:8]},
                language=other_user.language
            )
        except Exception as e:
            logger.warning(f"Failed to send delivery notification: {e}")
    
    logger.info(f"Delivery confirmed for order {order_id} by {'seller' if is_seller else 'buyer'}")
    
    return {
        "success": True,
        "message": "Delivery confirmed" if is_seller else "Order completed",
        "order": {
            "id": order.id,
            "status": order.status,
            "logistics_status": order.logistics_status,
            "delivery_date": order.delivery_date.isoformat() if order.delivery_date else None
        }
    }


# =============================================================================
# LOGISTICS ENDPOINTS
# =============================================================================

class SchedulePickupRequest(BaseModel):
    """Schedule pickup request."""
    pickup_date: str = Field(..., description="Pickup date (YYYY-MM-DD)")
    pickup_time_slot: str = Field(..., description="Time slot (e.g., '9:00 AM - 12:00 PM')")
    pickup_address: Optional[str] = Field(None, description="Pickup address (uses farmer address if not provided)")
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


class DeliveryEstimateRequest(BaseModel):
    """Get delivery estimate request."""
    origin_pincode: str
    destination_pincode: str
    weight_kg: float = Field(..., gt=0)


@router.post("/{order_id}/schedule-pickup")
async def schedule_order_pickup(
    order_id: str,
    request: SchedulePickupRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Schedule a pickup for an order (seller only).
    """
    from app.services.logistics import logistics_service
    from app.db.models import Farmer
    
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization - seller only
    is_seller = order.seller_id == current_user.id
    if not is_seller:
        # Check if user is the farmer who owns the listing
        if order.listing_id:
            listing = session.get(Listing, order.listing_id)
            if listing and listing.owner_id == current_user.id:
                is_seller = True
    
    if not is_seller:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller can schedule pickup"
        )
    
    # Check order status
    if order.status not in ["confirmed", "processing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot schedule pickup for order with status: {order.status}"
        )
    
    # Get farmer info for defaults
    farmer = session.exec(
        select(Farmer).where(Farmer.user_id == current_user.id)
    ).first()
    
    pickup_address = request.pickup_address
    if not pickup_address and farmer:
        pickup_address = f"{farmer.village or ''}, {farmer.district or ''}, {farmer.state or ''}".strip(", ")
    
    contact_name = request.contact_name or (farmer.name if farmer else current_user.name)
    contact_phone = request.contact_phone or current_user.phone
    
    # Parse date
    try:
        pickup_date = datetime.strptime(request.pickup_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Schedule pickup
    schedule = logistics_service.schedule_pickup(
        order_id=order_id,
        pickup_date=pickup_date,
        pickup_time_slot=request.pickup_time_slot,
        pickup_address=pickup_address or "",
        contact_name=contact_name or "",
        contact_phone=contact_phone or "",
        notes=request.notes,
    )
    
    # Create shipment
    buyer = session.get(User, order.buyer_id)
    destination = order.shipping_address or (buyer.name if buyer else "")
    
    shipment = logistics_service.create_shipment(
        order_id=order_id,
        origin_address=pickup_address or "",
        destination_address=destination,
        weight_kg=order.qty_kg,
        pickup_schedule_id=schedule.id,
    )
    
    # Update order
    order.tracking_number = shipment.tracking_number
    order.logistics_status = "pickup_scheduled"
    order.status = "processing"
    order.updated_at = utc_now()
    session.add(order)
    session.commit()
    
    # Notify buyer
    if buyer:
        try:
            send_notification_sms(
                to=buyer.phone,
                template_key="ORDER_PICKUP_SCHEDULED",
                params={
                    "order_id": order_id[:8],
                    "tracking": shipment.tracking_number,
                },
                language=buyer.language
            )
        except Exception as e:
            logger.warning(f"Failed to send pickup notification: {e}")
    
    return {
        "success": True,
        "message": "Pickup scheduled successfully",
        "pickup": {
            "id": schedule.id,
            "date": request.pickup_date,
            "time_slot": request.pickup_time_slot,
            "address": pickup_address,
        },
        "shipment": {
            "id": shipment.id,
            "tracking_number": shipment.tracking_number,
            "carrier": shipment.carrier,
            "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
        }
    }


@router.get("/{order_id}/tracking")
async def get_order_tracking(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get shipment tracking details for an order.
    """
    from app.services.logistics import logistics_service
    
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check authorization
    is_buyer = order.buyer_id == current_user.id
    is_seller = order.seller_id == current_user.id
    
    if not is_buyer and not is_seller:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view tracking"
        )
    
    if not order.tracking_number:
        return {
            "order_id": order_id,
            "tracking": None,
            "message": "Shipment not yet created"
        }
    
    shipment = logistics_service.get_shipment_by_tracking(order.tracking_number)
    
    if not shipment:
        return {
            "order_id": order_id,
            "tracking_number": order.tracking_number,
            "status": order.logistics_status,
            "events": []
        }
    
    return {
        "order_id": order_id,
        "tracking_number": shipment.tracking_number,
        "carrier": shipment.carrier,
        "status": shipment.status.value,
        "origin": shipment.origin_address,
        "destination": shipment.destination_address,
        "weight_kg": shipment.weight_kg,
        "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
        "actual_delivery": shipment.actual_delivery.isoformat() if shipment.actual_delivery else None,
        "events": shipment.events,
        "mock_mode": logistics_service.mock_mode,
    }


@router.post("/estimate-delivery")
async def estimate_delivery_cost(
    request: DeliveryEstimateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Get delivery time and cost estimate.
    """
    from app.services.logistics import logistics_service
    
    estimate = logistics_service.estimate_delivery(
        origin_pincode=request.origin_pincode,
        destination_pincode=request.destination_pincode,
        weight_kg=request.weight_kg,
    )
    
    return {
        "origin_pincode": estimate.origin_pincode,
        "destination_pincode": estimate.destination_pincode,
        "weight_kg": estimate.weight_kg,
        "estimated_days": estimate.estimated_days,
        "estimated_cost": estimate.estimated_cost,
        "service_type": estimate.service_type,
        "mock_mode": logistics_service.mock_mode,
    }


@router.get("/pickup-slots")
async def get_pickup_time_slots(
    date: str = Query(..., description="Date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
):
    """
    Get available pickup time slots for a date.
    """
    from app.services.logistics import logistics_service
    
    try:
        pickup_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    slots = logistics_service.get_available_time_slots(pickup_date)
    
    return {
        "date": date,
        "available_slots": slots,
    }


@router.post("/{order_id}/simulate-progress")
async def simulate_shipment_progress(
    order_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Simulate shipment progress (for testing/demo only).
    Moves shipment to next logical status.
    """
    from app.services.logistics import logistics_service
    
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if not order.tracking_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No shipment found for this order"
        )
    
    shipment = logistics_service.get_shipment_by_tracking(order.tracking_number)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    # Simulate progress
    updated_shipment = logistics_service.simulate_progress(shipment.id)
    
    if updated_shipment:
        # Update order logistics status
        order.logistics_status = updated_shipment.status.value
        if updated_shipment.status.value == "delivered":
            order.status = "delivered"
            order.delivery_date = utc_now()
        session.add(order)
        session.commit()
    
    return {
        "success": True,
        "message": f"Shipment progressed to: {updated_shipment.status.value if updated_shipment else 'unknown'}",
        "shipment": {
            "tracking_number": order.tracking_number,
            "status": updated_shipment.status.value if updated_shipment else None,
            "events": updated_shipment.events if updated_shipment else [],
        }
    }
