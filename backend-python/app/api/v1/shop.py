"""
Shree Anna Backend - Shop API Routes
B2C Consumer marketplace endpoints.
"""

from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from loguru import logger

from app.core.security import get_current_user
from app.core.utils import success_response, utc_now
from app.db import get_session, User, Listing, CartItem, Order
from app.services.sms import send_notification_sms


router = APIRouter(prefix="/shop", tags=["Shop (B2C)"])


# =============================================================================
# Request/Response Models
# =============================================================================

class AddToCartRequest(BaseModel):
    """Add item to cart."""
    listing_id: str = Field(..., description="Listing to add")
    qty_kg: float = Field(..., gt=0, description="Quantity in kg")


class UpdateCartRequest(BaseModel):
    """Update cart item quantity."""
    qty_kg: float = Field(..., gt=0, description="New quantity in kg")


class CheckoutRequest(BaseModel):
    """Checkout cart."""
    shipping_address: str = Field(..., min_length=10, description="Delivery address")
    phone: Optional[str] = Field(None, description="Contact phone")
    notes: Optional[str] = Field(None, description="Delivery notes")


class CartItemResponse(BaseModel):
    """Cart item response."""
    id: str
    listing_id: str
    crop: str
    variety: Optional[str] = None
    qty_kg: float
    price_per_kg: float
    total_price: float
    seller_name: Optional[str] = None
    photo_url: Optional[str] = None
    available_qty: float
    is_available: bool


# =============================================================================
# Public Shop Endpoints (No Auth Required)
# =============================================================================

@router.get("/products")
async def browse_products(
    crop: Optional[str] = Query(None, description="Filter by crop type"),
    category: Optional[str] = Query(None, description="Product category (raw, processed)"),
    district: Optional[str] = Query(None, description="Filter by district"),
    min_price: Optional[float] = Query(None, description="Minimum price per kg"),
    max_price: Optional[float] = Query(None, description="Maximum price per kg"),
    is_organic: Optional[bool] = Query(None, description="Filter organic only"),
    sort_by: str = Query("newest", description="Sort: newest, price_low, price_high, popular"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    session: Session = Depends(get_session)
):
    """
    Browse retail products.
    Public endpoint - no authentication required.
    """
    offset = (page - 1) * limit
    
    # Base query - only retail listings that are active
    statement = select(Listing).where(
        Listing.is_retail == True,
        Listing.status == "active",
        Listing.qty_kg > 0
    )
    
    # Apply filters
    if crop:
        statement = statement.where(Listing.crop.ilike(f"%{crop}%"))
    
    if category == "processed":
        statement = statement.where(Listing.is_processed == True)
    elif category == "raw":
        statement = statement.where(Listing.is_processed == False)
    
    if district:
        statement = statement.where(Listing.district.ilike(f"%{district}%"))
    
    if is_organic:
        statement = statement.where(Listing.is_organic == True)
    
    if min_price:
        statement = statement.where(Listing.retail_price_per_kg >= min_price)
    
    if max_price:
        statement = statement.where(Listing.retail_price_per_kg <= max_price)
    
    # Apply sorting
    if sort_by == "price_low":
        statement = statement.order_by(Listing.retail_price_per_kg.asc())
    elif sort_by == "price_high":
        statement = statement.order_by(Listing.retail_price_per_kg.desc())
    else:  # newest
        statement = statement.order_by(Listing.created_at.desc())
    
    statement = statement.offset(offset).limit(limit)
    listings = session.exec(statement).all()
    
    # Build response
    products = []
    for listing in listings:
        seller = session.get(User, listing.owner_id)
        photos = []
        try:
            import json
            photos = json.loads(listing.photos) if listing.photos else []
        except:
            pass
        
        products.append({
            "id": listing.id,
            "crop": listing.crop,
            "variety": listing.variety,
            "description": listing.description,
            "qty_available_kg": listing.qty_kg,
            "price_per_kg": listing.retail_price_per_kg or (listing.min_price_per_qtl / 100),
            "min_order_kg": listing.min_order_kg,
            "max_order_kg": listing.max_order_kg,
            "is_organic": listing.is_organic,
            "is_processed": listing.is_processed,
            "product_type": listing.product_type,
            "quality_grade": listing.quality_grade,
            "district": listing.district,
            "state": listing.state,
            "seller_name": seller.name if seller else None,
            "photo_url": photos[0] if photos else None,
            "photos": photos,
            "shelf_life_days": listing.shelf_life_days,
            "packaging_size_grams": listing.packaging_size_grams,
            "created_at": listing.created_at.isoformat() if listing.created_at else None
        })
    
    return {
        "products": products,
        "page": page,
        "limit": limit,
        "total": len(products)
    }


@router.get("/products/{product_id}")
async def get_product_details(
    product_id: str,
    session: Session = Depends(get_session)
):
    """
    Get detailed product information.
    Public endpoint - no authentication required.
    """
    listing = session.get(Listing, product_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not listing.is_retail or listing.status != "active":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not available for retail purchase"
        )
    
    seller = session.get(User, listing.owner_id)
    
    # Parse photos
    photos = []
    try:
        import json
        photos = json.loads(listing.photos) if listing.photos else []
    except:
        pass
    
    # Parse nutritional info
    nutritional_info = None
    if listing.nutritional_info:
        try:
            import json
            nutritional_info = json.loads(listing.nutritional_info)
        except:
            pass
    
    return {
        "id": listing.id,
        "crop": listing.crop,
        "variety": listing.variety,
        "description": listing.description,
        "qty_available_kg": listing.qty_kg,
        "price_per_kg": listing.retail_price_per_kg or (listing.min_price_per_qtl / 100),
        "min_order_kg": listing.min_order_kg,
        "max_order_kg": listing.max_order_kg,
        "is_organic": listing.is_organic,
        "organic_cert_url": listing.organic_cert_url,
        "is_processed": listing.is_processed,
        "product_type": listing.product_type,
        "quality_grade": listing.quality_grade,
        "moisture_level": listing.moisture_level,
        "harvest_date": listing.harvest_date.isoformat() if listing.harvest_date else None,
        "district": listing.district,
        "state": listing.state,
        "seller": {
            "id": seller.id if seller else None,
            "name": seller.name if seller else None,
            "district": seller.district if seller else None
        },
        "photos": photos,
        "shelf_life_days": listing.shelf_life_days,
        "packaging_type": listing.packaging_type,
        "packaging_size_grams": listing.packaging_size_grams,
        "fssai_license": listing.fssai_license,
        "nutritional_info": nutritional_info,
        "source_batch_id": listing.source_batch_id,
        "created_at": listing.created_at.isoformat() if listing.created_at else None
    }


@router.get("/categories")
async def get_product_categories(
    session: Session = Depends(get_session)
):
    """
    Get available product categories and crops.
    Public endpoint.
    """
    # Get distinct crops from retail listings
    statement = select(Listing.crop).where(
        Listing.is_retail == True,
        Listing.status == "active"
    ).distinct()
    
    crops = session.exec(statement).all()
    
    # Get product types for processed items
    statement = select(Listing.product_type).where(
        Listing.is_retail == True,
        Listing.is_processed == True,
        Listing.status == "active",
        Listing.product_type != None
    ).distinct()
    
    product_types = [pt for pt in session.exec(statement).all() if pt]
    
    return {
        "crops": sorted([c for c in crops if c]),
        "product_types": sorted(product_types),
        "categories": [
            {"id": "raw", "name": "Raw Millets", "description": "Whole grains and raw millets"},
            {"id": "processed", "name": "Processed Products", "description": "Ready-to-cook and ready-to-eat products"}
        ]
    }


# =============================================================================
# Cart Endpoints (Auth Required)
# =============================================================================

@router.get("/cart")
async def get_cart(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's shopping cart."""
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    cart_items = session.exec(statement).all()
    
    items = []
    total_amount = 0.0
    
    for item in cart_items:
        listing = session.get(Listing, item.listing_id)
        if not listing:
            # Remove orphaned cart item
            session.delete(item)
            continue
        
        seller = session.get(User, listing.owner_id)
        photos = []
        try:
            import json
            photos = json.loads(listing.photos) if listing.photos else []
        except:
            pass
        
        item_total = item.qty_kg * item.price_per_kg
        is_available = listing.status == "active" and listing.qty_kg >= item.qty_kg
        
        items.append({
            "id": item.id,
            "listing_id": item.listing_id,
            "crop": listing.crop,
            "variety": listing.variety,
            "qty_kg": item.qty_kg,
            "price_per_kg": item.price_per_kg,
            "total_price": item_total,
            "seller_name": seller.name if seller else None,
            "photo_url": photos[0] if photos else None,
            "available_qty": listing.qty_kg,
            "is_available": is_available
        })
        
        if is_available:
            total_amount += item_total
    
    session.commit()
    
    return {
        "items": items,
        "item_count": len(items),
        "total_amount": round(total_amount, 2)
    }


@router.post("/cart")
async def add_to_cart(
    request: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Add item to cart."""
    listing = session.get(Listing, request.listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not listing.is_retail or listing.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product not available for retail purchase"
        )
    
    # Validate quantity
    if request.qty_kg < listing.min_order_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum order quantity is {listing.min_order_kg} kg"
        )
    
    if listing.max_order_kg and request.qty_kg > listing.max_order_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum order quantity is {listing.max_order_kg} kg"
        )
    
    if request.qty_kg > listing.qty_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {listing.qty_kg} kg available"
        )
    
    # Check if already in cart
    statement = select(CartItem).where(
        CartItem.user_id == current_user.id,
        CartItem.listing_id == request.listing_id
    )
    existing = session.exec(statement).first()
    
    price_per_kg = listing.retail_price_per_kg or (listing.min_price_per_qtl / 100)
    
    if existing:
        # Update existing cart item
        new_qty = existing.qty_kg + request.qty_kg
        if new_qty > listing.qty_kg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add more. Only {listing.qty_kg} kg available"
            )
        existing.qty_kg = new_qty
        existing.price_per_kg = price_per_kg
        existing.updated_at = utc_now()
        session.add(existing)
    else:
        # Create new cart item
        cart_item = CartItem(
            user_id=current_user.id,
            listing_id=request.listing_id,
            qty_kg=request.qty_kg,
            price_per_kg=price_per_kg
        )
        session.add(cart_item)
    
    session.commit()
    
    logger.info(f"User {current_user.id} added {request.qty_kg}kg of {listing.crop} to cart")
    
    return {
        "success": True,
        "message": f"Added {request.qty_kg} kg to cart"
    }


@router.patch("/cart/{item_id}")
async def update_cart_item(
    item_id: str,
    request: UpdateCartRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update cart item quantity."""
    cart_item = session.get(CartItem, item_id)
    
    if not cart_item or cart_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    listing = session.get(Listing, cart_item.listing_id)
    if not listing:
        session.delete(cart_item)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product no longer available"
        )
    
    # Validate new quantity
    if request.qty_kg < listing.min_order_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum order quantity is {listing.min_order_kg} kg"
        )
    
    if listing.max_order_kg and request.qty_kg > listing.max_order_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum order quantity is {listing.max_order_kg} kg"
        )
    
    if request.qty_kg > listing.qty_kg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {listing.qty_kg} kg available"
        )
    
    cart_item.qty_kg = request.qty_kg
    cart_item.updated_at = utc_now()
    session.add(cart_item)
    session.commit()
    
    return {
        "success": True,
        "message": "Cart updated"
    }


@router.delete("/cart/{item_id}")
async def remove_from_cart(
    item_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Remove item from cart."""
    cart_item = session.get(CartItem, item_id)
    
    if not cart_item or cart_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    session.delete(cart_item)
    session.commit()
    
    return {"success": True, "message": "Removed from cart"}


@router.delete("/cart")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Clear all items from cart."""
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    cart_items = session.exec(statement).all()
    
    for item in cart_items:
        session.delete(item)
    
    session.commit()
    
    return {"success": True, "message": "Cart cleared"}


# =============================================================================
# Checkout Endpoint
# =============================================================================

@router.post("/checkout")
async def checkout(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Checkout cart and create orders.
    Creates separate orders for each seller.
    """
    import uuid
    
    # Get cart items
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    cart_items = session.exec(statement).all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Group items by seller
    seller_items: dict[str, list] = {}
    
    for cart_item in cart_items:
        listing = session.get(Listing, cart_item.listing_id)
        if not listing:
            continue
        
        # Validate availability
        if listing.status != "active" or listing.qty_kg < cart_item.qty_kg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{listing.crop}' is no longer available in requested quantity"
            )
        
        seller_id = listing.owner_id
        if seller_id not in seller_items:
            seller_items[seller_id] = []
        seller_items[seller_id].append((cart_item, listing))
    
    # Create orders for each seller
    created_orders = []
    
    for seller_id, items in seller_items.items():
        total_amount = sum(item[0].qty_kg * item[0].price_per_kg for item in items)
        total_qty = sum(item[0].qty_kg for item in items)
        
        # Get first listing for reference
        first_listing = items[0][1]
        
        order = Order(
            id=str(uuid.uuid4()),
            buyer_id=current_user.id,
            seller_id=seller_id,
            listing_id=first_listing.id if len(items) == 1 else None,
            offer_id=None,
            qty_kg=total_qty,
            price_per_qtl=total_amount / total_qty * 100,  # Convert back to per quintal
            total_amount=total_amount,
            status="created",
            payment_status="pending",
            logistics_status="pending",
            shipping_address=request.shipping_address,
            notes=request.notes or f"Retail order: {len(items)} item(s)",
            created_at=utc_now(),
            updated_at=utc_now()
        )
        
        session.add(order)
        
        # Update listing quantities
        for cart_item, listing in items:
            listing.qty_kg -= cart_item.qty_kg
            if listing.qty_kg <= 0:
                listing.status = "sold"
            listing.updated_at = utc_now()
            session.add(listing)
            
            # Remove from cart
            session.delete(cart_item)
        
        created_orders.append({
            "order_id": order.id,
            "seller_id": seller_id,
            "total_amount": total_amount,
            "total_qty_kg": total_qty,
            "item_count": len(items)
        })
        
        # Notify seller
        seller = session.get(User, seller_id)
        if seller:
            try:
                send_notification_sms(
                    to=seller.phone,
                    template_key="NEW_ORDER",
                    params={
                        "crop": "Multiple items" if len(items) > 1 else first_listing.crop,
                        "qty": total_qty,
                        "amount": total_amount,
                        "buyer": current_user.name or "Consumer"
                    },
                    language=seller.language
                )
            except Exception as e:
                logger.warning(f"Failed to send order notification: {e}")
    
    session.commit()
    
    logger.info(f"Checkout complete: {len(created_orders)} orders created for user {current_user.id}")
    
    return {
        "success": True,
        "message": f"Created {len(created_orders)} order(s)",
        "orders": created_orders,
        "total_amount": sum(o["total_amount"] for o in created_orders)
    }
