"""
Shree Anna Backend - Offline Sync API Routes
Push/pull sync for offline-first mobile app.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from loguru import logger

from app.core.security import get_current_user
from app.core.utils import success_response, utc_now
from app.db import (
    get_session, User, SyncQueue,
    add_to_sync_queue, get_pending_sync_items,
    Listing, Offer, Batch, TraceEvent
)


router = APIRouter(prefix="/sync", tags=["Offline Sync"])


class SyncPushItem(BaseModel):
    """Single item to push for sync."""
    type: str = Field(..., description="Entity type (listing, offer, trace_event)")
    action: str = Field(..., description="Action (create, update, delete)")
    client_temp_id: Optional[str] = Field(None, description="Client-side temp ID")
    client_ts: Optional[str] = Field(None, description="Client timestamp ISO format")
    data: Dict[str, Any] = Field(..., description="Entity data")


class SyncPushRequest(BaseModel):
    """Push request with multiple items."""
    items: List[SyncPushItem]
    device_id: Optional[str] = None
    last_sync_ts: Optional[str] = None


class SyncPushResponse(BaseModel):
    """Push response with results."""
    success: bool
    processed: int
    failed: int
    results: List[Dict]
    server_ts: str


class SyncPullRequest(BaseModel):
    """Pull request for getting updates."""
    since: Optional[str] = Field(None, description="Get updates since this timestamp")
    types: Optional[List[str]] = Field(None, description="Filter by entity types")
    device_id: Optional[str] = None


class SyncPullResponse(BaseModel):
    """Pull response with updates."""
    updates: List[Dict]
    conflicts: List[Dict]
    server_ts: str
    has_more: bool


@router.post("/push", response_model=SyncPushResponse)
async def sync_push(
    request: SyncPushRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Push offline changes to server.
    Processes items in order and returns results.
    """
    processed = 0
    failed = 0
    results = []
    
    for item in request.items:
        try:
            result = await _process_sync_item(
                session=session,
                user=current_user,
                item=item
            )
            results.append(result)
            
            if result.get("success"):
                processed += 1
            else:
                failed += 1
        
        except Exception as e:
            logger.error(f"Sync push error: {e}")
            failed += 1
            results.append({
                "client_temp_id": item.client_temp_id,
                "success": False,
                "error": str(e)
            })
    
    logger.info(
        f"Sync push - User: {current_user.id}, "
        f"Processed: {processed}, Failed: {failed}"
    )
    
    return SyncPushResponse(
        success=failed == 0,
        processed=processed,
        failed=failed,
        results=results,
        server_ts=utc_now().isoformat()
    )


@router.post("/pull", response_model=SyncPullResponse)
async def sync_pull(
    request: SyncPullRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Pull updates from server.
    Returns changes since last sync.
    """
    since = None
    if request.since:
        try:
            since = datetime.fromisoformat(request.since.replace("Z", "+00:00"))
        except Exception:
            pass
    
    updates = []
    conflicts = []
    
    # Get user's listings
    if not request.types or "listing" in request.types:
        listing_updates = await _get_listing_updates(session, current_user.id, since)
        updates.extend(listing_updates)
    
    # Get offers on user's listings
    if not request.types or "offer" in request.types:
        offer_updates = await _get_offer_updates(session, current_user.id, since)
        updates.extend(offer_updates)
    
    # Get pending sync items (conflicts)
    pending = get_pending_sync_items(session, current_user.id, since)
    for item in pending:
        if item.status == "conflict":
            conflicts.append({
                "id": item.id,
                "type": item.type,
                "client_temp_id": item.client_temp_id,
                "payload": json.loads(item.payload) if item.payload else {},
                "created_at": item.created_at.isoformat() if item.created_at else None
            })
    
    logger.info(
        f"Sync pull - User: {current_user.id}, "
        f"Updates: {len(updates)}, Conflicts: {len(conflicts)}"
    )
    
    return SyncPullResponse(
        updates=updates,
        conflicts=conflicts,
        server_ts=utc_now().isoformat(),
        has_more=False  # For pagination in future
    )


@router.get("/status")
@router.get("/state")
async def sync_status(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get current sync status/state for user.
    Shows pending items and conflicts.
    """
    pending = session.exec(
        select(SyncQueue).where(
            SyncQueue.user_id == current_user.id,
            SyncQueue.status.in_(["pending", "conflict"])
        )
    ).all()
    
    pending_count = sum(1 for p in pending if p.status == "pending")
    conflict_count = sum(1 for p in pending if p.status == "conflict")
    
    return {
        "user_id": current_user.id,
        "pending_items": pending_count,
        "conflicts": conflict_count,
        "last_sync": None,  # Would track in user profile
        "server_ts": utc_now().isoformat()
    }


class ConflictCheckRequest(BaseModel):
    """Conflict detection request."""
    entity_type: str
    entity_id: str
    client_version: int


@router.post("/conflicts")
async def check_conflicts(
    request: ConflictCheckRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Check for conflicts on a specific entity.
    """
    conflicts = []
    
    # Check sync queue for conflicts
    pending = session.exec(
        select(SyncQueue).where(
            SyncQueue.user_id == current_user.id,
            SyncQueue.type == request.entity_type,
            SyncQueue.status == "conflict"
        )
    ).all()
    
    for item in pending:
        payload = json.loads(item.payload) if item.payload else {}
        if payload.get("id") == request.entity_id:
            conflicts.append({
                "id": item.id,
                "type": item.type,
                "client_temp_id": item.client_temp_id,
                "payload": payload,
                "created_at": item.created_at.isoformat() if item.created_at else None
            })
    
    return {
        "entity_type": request.entity_type,
        "entity_id": request.entity_id,
        "has_conflicts": len(conflicts) > 0,
        "conflicts": conflicts,
        "server_ts": utc_now().isoformat()
    }


@router.post("/resolve-conflict/{item_id}")
async def resolve_conflict(
    item_id: str,
    resolution: str,  # "keep_server", "keep_client", "merge"
    merged_data: Optional[Dict] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Resolve a sync conflict.
    """
    item = session.get(SyncQueue, item_id)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conflict item not found"
        )
    
    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if resolution == "keep_server":
        # Discard client changes
        item.status = "resolved"
        item.resolution = "server"
    
    elif resolution == "keep_client":
        # Apply client changes
        await _apply_sync_item(session, current_user, item)
        item.status = "synced"
        item.resolution = "client"
    
    elif resolution == "merge":
        if not merged_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Merged data required for merge resolution"
            )
        # Apply merged data
        item.payload = json.dumps(merged_data)
        await _apply_sync_item(session, current_user, item)
        item.status = "synced"
        item.resolution = "merged"
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resolution. Use: keep_server, keep_client, merge"
        )
    
    item.processed_at = utc_now()
    session.add(item)
    session.commit()
    
    return success_response(
        message=f"Conflict resolved: {resolution}",
        data={"item_id": item_id}
    )


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

async def _process_sync_item(
    session: Session,
    user: User,
    item: SyncPushItem
) -> Dict:
    """Process a single sync item."""
    result = {
        "client_temp_id": item.client_temp_id,
        "type": item.type,
        "action": item.action,
        "success": False
    }
    
    try:
        # Parse client timestamp
        client_ts = None
        if item.client_ts:
            try:
                client_ts = datetime.fromisoformat(item.client_ts.replace("Z", "+00:00"))
            except Exception:
                pass
        
        # Process based on type and action
        if item.type == "listing":
            server_id = await _process_listing_sync(
                session, user, item.action, item.data, client_ts
            )
            result["server_id"] = server_id
            result["success"] = True
        
        elif item.type == "offer":
            server_id = await _process_offer_sync(
                session, user, item.action, item.data, client_ts
            )
            result["server_id"] = server_id
            result["success"] = True
        
        elif item.type == "trace_event":
            server_id = await _process_trace_sync(
                session, user, item.action, item.data, client_ts
            )
            result["server_id"] = server_id
            result["success"] = True
        
        else:
            result["error"] = f"Unknown type: {item.type}"
    
    except Exception as e:
        result["error"] = str(e)
        
        # Add to sync queue for retry/conflict resolution
        add_to_sync_queue(
            session=session,
            user_id=user.id,
            type=item.type,
            payload=item.data,
            client_temp_id=item.client_temp_id,
            client_ts=client_ts
        )
    
    return result


async def _process_listing_sync(
    session: Session,
    user: User,
    action: str,
    data: Dict,
    client_ts: Optional[datetime]
) -> str:
    """Process listing sync item."""
    from app.db import create_listing, get_listing_by_id
    
    if action == "create":
        listing = create_listing(
            session=session,
            owner_type="farmer" if user.has_role("farmer") else "fpo",
            owner_id=user.id,
            crop=data.get("crop"),
            qty_kg=data.get("qty_kg"),
            min_price_per_qtl=data.get("min_price_per_qtl"),
            description=data.get("description"),
            district=data.get("district") or user.district
        )
        return listing.id
    
    elif action == "update":
        listing_id = data.get("id")
        listing = get_listing_by_id(session, listing_id)
        
        if not listing:
            raise Exception("Listing not found")
        
        if listing.owner_id != user.id:
            raise Exception("Not authorized")
        
        # Check for conflicts (server modified after client)
        if client_ts and listing.updated_at and listing.updated_at > client_ts:
            raise Exception("Conflict: server has newer version")
        
        for key in ["qty_kg", "min_price_per_qtl", "description", "status"]:
            if key in data:
                setattr(listing, key, data[key])
        
        listing.updated_at = utc_now()
        session.add(listing)
        session.commit()
        
        return listing.id
    
    raise Exception(f"Unknown action: {action}")


async def _process_offer_sync(
    session: Session,
    user: User,
    action: str,
    data: Dict,
    client_ts: Optional[datetime]
) -> str:
    """Process offer sync item."""
    from app.db import create_offer
    
    if action == "create":
        offer = create_offer(
            session=session,
            listing_id=data.get("listing_id"),
            buyer_id=user.id,
            price_per_qtl=data.get("price_per_qtl"),
            qty_kg=data.get("qty_kg"),
            message=data.get("message")
        )
        return offer.id
    
    raise Exception(f"Unknown action: {action}")


async def _process_trace_sync(
    session: Session,
    user: User,
    action: str,
    data: Dict,
    client_ts: Optional[datetime]
) -> str:
    """Process trace event sync item."""
    from app.db import add_trace_event
    
    if action == "create":
        event = add_trace_event(
            session=session,
            batch_id=data.get("batch_id"),
            event_type=data.get("event_type"),
            payload=data.get("payload", {}),
            actor_id=user.id,
            location=data.get("location")
        )
        return event.id
    
    raise Exception(f"Unknown action: {action}")


async def _apply_sync_item(
    session: Session,
    user: User,
    item: SyncQueue
) -> None:
    """Apply a queued sync item."""
    data = json.loads(item.payload) if item.payload else {}
    
    if item.type == "listing":
        await _process_listing_sync(session, user, "update", data, item.client_ts)
    elif item.type == "offer":
        await _process_offer_sync(session, user, "update", data, item.client_ts)


async def _get_listing_updates(
    session: Session,
    user_id: str,
    since: Optional[datetime]
) -> List[Dict]:
    """Get listing updates for user."""
    statement = select(Listing).where(Listing.owner_id == user_id)
    
    if since:
        statement = statement.where(Listing.updated_at > since)
    
    listings = session.exec(statement).all()
    
    return [
        {
            "type": "listing",
            "id": l.id,
            "data": {
                "crop": l.crop,
                "qty_kg": l.qty_kg,
                "min_price_per_qtl": l.min_price_per_qtl,
                "status": l.status,
                "description": l.description
            },
            "updated_at": l.updated_at.isoformat() if l.updated_at else None
        }
        for l in listings
    ]


async def _get_offer_updates(
    session: Session,
    user_id: str,
    since: Optional[datetime]
) -> List[Dict]:
    """Get offer updates for user's listings."""
    # Get user's listing IDs
    user_listings = session.exec(
        select(Listing.id).where(Listing.owner_id == user_id)
    ).all()
    
    if not user_listings:
        return []
    
    statement = select(Offer).where(Offer.listing_id.in_(user_listings))
    
    if since:
        statement = statement.where(Offer.updated_at > since)
    
    offers = session.exec(statement).all()
    
    return [
        {
            "type": "offer",
            "id": o.id,
            "data": {
                "listing_id": o.listing_id,
                "buyer_id": o.buyer_id,
                "price_per_qtl": o.price_per_qtl,
                "qty_kg": o.qty_kg,
                "status": o.status
            },
            "updated_at": o.updated_at.isoformat() if o.updated_at else None
        }
        for o in offers
    ]
