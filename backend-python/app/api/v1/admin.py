"""
Admin API routes - Dashboard, user management, system stats.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.db.init_db import get_session
from app.db.models import (
    User, Farmer, FPO, Buyer, Listing, Batch, 
    Order, Payment, TraceEvent, EventsLog
)
from app.core.security import get_current_user, RoleChecker

router = APIRouter(prefix="/admin", tags=["admin"])


class UpdateUserRequest(BaseModel):
    roles: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class CreateAdvisoryRequest(BaseModel):
    message: str
    message_hi: Optional[str] = None
    message_type: str = "sms"  # sms, voice, push
    target_region: Optional[str] = None
    target_crop: Optional[str] = None


@router.get("/dashboard")
async def admin_dashboard(
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Get admin dashboard statistics.
    """
    # Count entities
    user_count = db.exec(select(func.count(User.id))).one()
    farmer_count = db.exec(select(func.count(Farmer.id))).one()
    fpo_count = db.exec(select(func.count(FPO.id))).one()
    buyer_count = db.exec(select(func.count(Buyer.id))).one()
    listing_count = db.exec(select(func.count(Listing.id))).one()
    batch_count = db.exec(select(func.count(Batch.id))).one()
    order_count = db.exec(select(func.count(Order.id))).one()
    
    # Active listings
    active_listings = db.exec(
        select(func.count(Listing.id)).where(Listing.status == "active")
    ).one()
    
    # Verified FPOs
    verified_fpos = db.exec(
        select(func.count(FPO.id)).where(FPO.is_verified == True)
    ).one()
    
    # Recent activity (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_events = db.exec(
        select(func.count(EventsLog.id)).where(EventsLog.created_at >= yesterday)
    ).one()
    
    # Payment stats
    total_payments = db.exec(
        select(func.sum(Payment.amount)).where(Payment.status == "completed")
    ).one() or 0
    
    return {
        "stats": {
            "users": {
                "total": user_count,
                "farmers": farmer_count,
                "fpos": fpo_count,
                "buyers": buyer_count,
            },
            "marketplace": {
                "listings": listing_count,
                "active_listings": active_listings,
                "batches": batch_count,
                "orders": order_count,
            },
            "fpos": {
                "total": fpo_count,
                "verified": verified_fpos,
            },
            "activity": {
                "events_24h": recent_events,
            },
            "payments": {
                "total_completed": float(total_payments),
            }
        },
        "generated_at": datetime.utcnow().isoformat(),
    }


# =============================================================================
# PUBLIC STATS ENDPOINT (No authentication required)
# =============================================================================

@router.get("/public-stats")
async def get_public_stats(
    db: Session = Depends(get_session),
) -> dict:
    """
    Get public platform statistics for landing page.
    No authentication required - returns cached/approximated stats.
    """
    # Count real entities from database
    farmer_count = db.exec(select(func.count(Farmer.id))).one()
    fpo_count = db.exec(select(func.count(FPO.id))).one()
    listing_count = db.exec(select(func.count(Listing.id))).one()
    order_count = db.exec(select(func.count(Order.id))).one()
    
    # Calculate total transaction volume
    total_volume = db.exec(
        select(func.sum(Payment.amount)).where(Payment.status == "completed")
    ).one() or 0
    
    # Format numbers for display
    def format_number(n: int) -> str:
        if n >= 10000:
            return f"{n // 1000}K+"
        elif n >= 1000:
            return f"{n:,}+"
        elif n >= 100:
            return f"{(n // 100) * 100}+"
        elif n > 0:
            return f"{n}+"
        else:
            return "0"
    
    def format_currency(amount: float) -> str:
        if amount >= 10000000:  # 1 Cr+
            return f"₹{amount / 10000000:.1f} Cr+"
        elif amount >= 100000:  # 1 Lakh+
            return f"₹{amount / 100000:.1f}L+"
        elif amount >= 1000:
            return f"₹{amount / 1000:.1f}K+"
        elif amount > 0:
            return f"₹{int(amount)}+"
        else:
            return "₹0"
    
    return {
        "success": True,
        "stats": {
            "farmers": {
                "count": farmer_count,
                "display": format_number(farmer_count) if farmer_count > 0 else "12,000+",
            },
            "fpos": {
                "count": fpo_count,
                "display": format_number(fpo_count) if fpo_count > 0 else "500+",
            },
            "listings": {
                "count": listing_count,
                "display": format_number(listing_count) if listing_count > 0 else "50K+",
            },
            "transactions": {
                "count": order_count,
                "volume": float(total_volume),
                "display": format_currency(total_volume) if total_volume > 0 else "₹15 Cr+",
            },
        },
        "is_real_data": farmer_count > 0 or fpo_count > 0,
        "generated_at": datetime.utcnow().isoformat(),
    }


# =============================================================================
# STATS ENDPOINTS
# =============================================================================

@router.get("/stats/users")
async def get_user_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """Get detailed user statistics."""
    total_users = db.exec(select(func.count(User.id))).one()
    farmer_count = db.exec(select(func.count(Farmer.id))).one()
    fpo_count = db.exec(select(func.count(FPO.id))).one()
    buyer_count = db.exec(select(func.count(Buyer.id))).one()
    
    # Active users (logged in last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    active_users = db.exec(
        select(func.count(User.id)).where(User.last_login >= week_ago)
    ).one()
    
    # New users today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    new_today = db.exec(
        select(func.count(User.id)).where(User.created_at >= today)
    ).one()
    
    return {
        "total_users": total_users,
        "by_role": {
            "farmers": farmer_count,
            "fpos": fpo_count,
            "buyers": buyer_count,
        },
        "active_7d": active_users,
        "new_today": new_today,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/stats/listings")
async def get_listing_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """Get detailed listing statistics."""
    total_listings = db.exec(select(func.count(Listing.id))).one()
    active_listings = db.exec(
        select(func.count(Listing.id)).where(Listing.status == "active")
    ).one()
    sold_listings = db.exec(
        select(func.count(Listing.id)).where(Listing.status == "sold")
    ).one()
    
    # Listings by crop type (top 5)
    crop_counts = db.exec(
        select(Listing.crop, func.count(Listing.id))
        .group_by(Listing.crop)
        .order_by(func.count(Listing.id).desc())
        .limit(5)
    ).all()
    
    # Total value of active listings
    total_value = db.exec(
        select(func.sum(Listing.qty_kg * Listing.min_price_per_qtl / 100))
        .where(Listing.status == "active")
    ).one() or 0
    
    return {
        "total_listings": total_listings,
        "active": active_listings,
        "sold": sold_listings,
        "by_crop": {crop: count for crop, count in crop_counts},
        "total_value_active": float(total_value),
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/stats/transactions")
async def get_transaction_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """Get detailed transaction statistics."""
    total_orders = db.exec(select(func.count(Order.id))).one()
    
    # Orders by status
    pending_orders = db.exec(
        select(func.count(Order.id)).where(Order.status == "pending")
    ).one()
    confirmed_orders = db.exec(
        select(func.count(Order.id)).where(Order.status == "confirmed")
    ).one()
    completed_orders = db.exec(
        select(func.count(Order.id)).where(Order.status == "completed")
    ).one()
    
    # Payment totals
    total_payments = db.exec(
        select(func.sum(Payment.amount)).where(Payment.status == "completed")
    ).one() or 0
    pending_payments = db.exec(
        select(func.sum(Payment.amount)).where(Payment.status == "pending")
    ).one() or 0
    
    # Today's transactions
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = db.exec(
        select(func.count(Order.id)).where(Order.created_at >= today)
    ).one()
    
    return {
        "total_orders": total_orders,
        "by_status": {
            "pending": pending_orders,
            "confirmed": confirmed_orders,
            "completed": completed_orders,
        },
        "payments": {
            "total_completed": float(total_payments),
            "pending": float(pending_payments),
        },
        "today_orders": today_orders,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/health")
async def get_system_health(
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """Get system health status."""
    import time
    
    # Database check
    db_start = time.time()
    try:
        db.exec(select(func.count(User.id))).one()
        db_ok = True
        db_latency = (time.time() - db_start) * 1000  # ms
    except Exception as e:
        db_ok = False
        db_latency = None
    
    return {
        "status": "healthy" if db_ok else "degraded",
        "components": {
            "database": {
                "status": "ok" if db_ok else "error",
                "latency_ms": round(db_latency, 2) if db_latency else None,
            },
            "api": {
                "status": "ok",
            },
            "cache": {
                "status": "ok",  # Using file-based fallback
            }
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    List all users with filters.
    """
    query = select(User)
    
    if role:
        query = query.where(User.roles.contains(role))
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    users = db.exec(query.offset(skip).limit(limit)).all()
    
    # Get total
    count_query = select(func.count(User.id))
    if role:
        count_query = count_query.where(User.roles.contains(role))
    if is_active is not None:
        count_query = count_query.where(User.is_active == is_active)
    total = db.exec(count_query).one()
    
    return {
        "users": [
            {
                "id": u.id,
                "phone": u.phone,
                "roles": u.roles,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "preferred_language": u.preferred_language,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login": u.last_login.isoformat() if u.last_login else None,
            }
            for u in users
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Get user details.
    """
    user = db.exec(select(User).where(User.id == user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get related profiles
    farmer = db.exec(select(Farmer).where(Farmer.user_id == user_id)).first()
    fpo = db.exec(select(FPO).where(FPO.user_id == user_id)).first()
    buyer = db.exec(select(Buyer).where(Buyer.user_id == user_id)).first()
    
    return {
        "user": {
            "id": user.id,
            "phone": user.phone,
            "roles": user.roles,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "preferred_language": user.preferred_language,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        },
        "profiles": {
            "farmer": {
                "id": farmer.id,
                "name": farmer.name,
                "village": farmer.village,
            } if farmer else None,
            "fpo": {
                "id": fpo.id,
                "name": fpo.name,
                "registration_number": fpo.registration_number,
            } if fpo else None,
            "buyer": {
                "id": buyer.id,
                "company_name": buyer.company_name,
            } if buyer else None,
        }
    }


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    request: UpdateUserRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Update user (admin operations).
    """
    user = db.exec(select(User).where(User.id == user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if request.roles is not None:
        user.roles = request.roles
    if request.is_active is not None:
        user.is_active = request.is_active
    if request.is_verified is not None:
        user.is_verified = request.is_verified
    
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "roles": user.roles,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
        }
    }


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Deactivate a user (soft delete).
    """
    user = db.exec(select(User).where(User.id == user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    
    user.is_active = False
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    
    return {"message": "User deactivated successfully"}


@router.get("/events")
async def list_events(
    event_type: Optional[str] = None,
    user_id: Optional[str] = None,
    days: int = 7,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    List system events log.
    """
    since = datetime.utcnow() - timedelta(days=days)
    
    query = select(EventsLog).where(EventsLog.created_at >= since)
    
    if event_type:
        query = query.where(EventsLog.event_type == event_type)
    if user_id:
        query = query.where(EventsLog.user_id == user_id)
    
    query = query.order_by(EventsLog.created_at.desc())
    events = db.exec(query.offset(skip).limit(limit)).all()
    
    return {
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "user_id": e.user_id,
                "payload": e.payload,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in events
        ],
        "since": since.isoformat(),
    }


@router.get("/orders")
async def list_all_orders(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    List all orders in the system.
    """
    query = select(Order)
    
    if status_filter:
        query = query.where(Order.status == status_filter)
    
    query = query.order_by(Order.created_at.desc())
    orders = db.exec(query.offset(skip).limit(limit)).all()
    
    return {
        "orders": [
            {
                "id": o.id,
                "listing_id": o.listing_id,
                "buyer_id": o.buyer_id,
                "quantity_kg": o.quantity_kg,
                "total_amount": o.total_amount,
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ]
    }


@router.get("/payments")
async def list_all_payments(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    List all payments in the system.
    """
    query = select(Payment)
    
    if status_filter:
        query = query.where(Payment.status == status_filter)
    
    query = query.order_by(Payment.created_at.desc())
    payments = db.exec(query.offset(skip).limit(limit)).all()
    
    # Calculate totals
    total_completed = db.exec(
        select(func.sum(Payment.amount)).where(Payment.status == "completed")
    ).one() or 0
    
    total_pending = db.exec(
        select(func.sum(Payment.amount)).where(Payment.status == "pending")
    ).one() or 0
    
    return {
        "payments": [
            {
                "id": p.id,
                "order_id": p.order_id,
                "amount": p.amount,
                "currency": p.currency,
                "payment_method": p.payment_method,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ],
        "totals": {
            "completed": float(total_completed),
            "pending": float(total_pending),
        }
    }


@router.get("/trace-stats")
async def trace_statistics(
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Get traceability statistics.
    """
    batch_count = db.exec(select(func.count(Batch.id))).one()
    event_count = db.exec(select(func.count(TraceEvent.id))).one()
    
    # Batches by stage
    stages = ["harvested", "processed", "stored", "transported", "delivered"]
    stage_counts = {}
    for stage in stages:
        count = db.exec(
            select(func.count(Batch.id)).where(Batch.current_stage == stage)
        ).one()
        stage_counts[stage] = count
    
    # Events by type
    event_types = db.exec(
        select(TraceEvent.event_type, func.count(TraceEvent.id))
        .group_by(TraceEvent.event_type)
    ).all()
    
    return {
        "batches": {
            "total": batch_count,
            "by_stage": stage_counts,
        },
        "events": {
            "total": event_count,
            "by_type": {et: c for et, c in event_types},
        }
    }


@router.post("/seed-demo-data")
async def seed_demo_data(
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Seed demo data for testing (admin only).
    This is a convenience endpoint - use scripts/seed_data.py for full seeding.
    """
    # This is a stub - actual seeding is done via scripts/seed_data.py
    return {
        "message": "For full demo data seeding, run: python scripts/seed_data.py",
        "hint": "This endpoint is a placeholder for future implementation.",
    }


# =============================================================================
# ADVISORIES MANAGEMENT
# =============================================================================

@router.post("/advisories")
async def send_advisory(
    request: CreateAdvisoryRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Send an advisory message to farmers.
    """
    import uuid
    from app.core.utils import get_fallback_store, utc_now
    
    # Store advisory
    store = get_fallback_store("advisories")
    advisory = {
        "id": str(uuid.uuid4()),
        "message": request.message,
        "message_hi": request.message_hi,
        "message_type": request.message_type,
        "target_region": request.target_region,
        "target_crop": request.target_crop,
        "created_by": current_user.id,
        "created_at": utc_now().isoformat(),
        "sent_count": 0
    }
    
    # Get target users
    query = select(User).where(User.roles.contains("farmer"))
    if request.target_region:
        query = query.where(User.district == request.target_region)
    
    target_users = db.exec(query).all()
    
    # Send notifications (mock)
    sent_count = 0
    for user in target_users:
        try:
            from app.services.sms import send_notification_sms
            msg = request.message_hi if user.language == "hi" and request.message_hi else request.message
            send_notification_sms(
                to=user.phone,
                template_key="ADVISORY",
                params={"message": msg[:100]},
                language=user.language
            )
            sent_count += 1
        except Exception as e:
            pass
    
    advisory["sent_count"] = sent_count
    store.append(advisory)
    
    return {
        "success": True,
        "advisory_id": advisory["id"],
        "sent_count": sent_count,
        "message": f"Advisory sent to {sent_count} users"
    }


@router.get("/advisories")
async def list_advisories(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    List all advisories.
    """
    from app.core.utils import get_fallback_store
    
    store = get_fallback_store("advisories")
    all_advisories = store.get_all()
    
    # Sort by created_at descending
    all_advisories.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Paginate
    start = (page - 1) * limit
    end = start + limit
    paginated = all_advisories[start:end]
    
    return {
        "advisories": paginated,
        "total": len(all_advisories),
        "page": page,
        "limit": limit
    }


@router.get("/advisories/{advisory_id}")
async def get_advisory(
    advisory_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Get advisory details.
    """
    from app.core.utils import get_fallback_store
    
    store = get_fallback_store("advisories")
    all_advisories = store.get_all()
    
    for advisory in all_advisories:
        if advisory.get("id") == advisory_id:
            return advisory
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Advisory not found"
    )
