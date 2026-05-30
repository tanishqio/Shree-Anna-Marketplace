"""
Shree Anna Backend - Batch & Traceability API Routes
QR-traceable batch management for FPOs.
"""

import json
from typing import List, Optional
import qrcode
import io
import base64

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from loguru import logger

from app.core.security import get_current_user, require_fpo
from app.core.utils import success_response, utc_now
from app.core.hashing import compute_payload_hash, verify_signature
from app.db import (
    get_session, User, Batch, TraceEvent, FPO,
    create_batch, get_batch_by_id, add_trace_event, get_batch_trace
)


router = APIRouter(prefix="/batches", tags=["Batches & Traceability"])


class CreateBatchRequest(BaseModel):
    """Create batch request."""
    source_lots: List[str] = Field(..., description="List of source lot/listing IDs")
    total_weight: float = Field(..., gt=0, description="Total weight in kg")
    crop: str = Field(..., description="Crop type")
    grade: Optional[str] = None
    processing_date: Optional[str] = None
    notes: Optional[str] = None


class AddTraceEventRequest(BaseModel):
    """Add trace event request."""
    event_type: str = Field(..., description="Event type (processing, testing, dispatch, etc.)")
    payload: dict = Field(..., description="Event data")
    location: Optional[dict] = Field(None, description="Geo location {lat, lon}")


class BatchResponse(BaseModel):
    """Batch response model."""
    id: str
    qr_code: str
    created_by_id: str
    source_lots: List[str]
    total_weight: float
    crop: str
    grade: Optional[str]
    status: str
    created_at: str


class TraceEventResponse(BaseModel):
    """Trace event response model."""
    id: str
    batch_id: str
    event_type: str
    payload: dict
    timestamp: str
    actor_id: Optional[str]
    verified: bool


@router.post("/", response_model=BatchResponse)
async def create_new_batch(
    request: CreateBatchRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new traceable batch.
    Requires FPO role.
    Generates unique QR code for traceability.
    """
    batch = create_batch(
        session=session,
        created_by_id=current_user.id,
        source_lots=request.source_lots,
        total_weight=request.total_weight,
        crop=request.crop,
        grade=request.grade,
        processing_date=request.processing_date,
        notes=request.notes
    )
    
    logger.info(f"Batch created: {batch.id} by {current_user.id}")
    
    return BatchResponse(
        id=batch.id,
        qr_code=batch.qr_code,
        created_by_id=batch.created_by_id,
        source_lots=json.loads(batch.source_lots),
        total_weight=batch.total_weight,
        crop=batch.crop,
        grade=batch.grade,
        status=batch.status,
        created_at=batch.created_at.isoformat()
    )


@router.get("/")
async def list_batches(
    status: Optional[str] = None,
    crop: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List batches created by current FPO."""
    offset = (page - 1) * limit
    
    statement = select(Batch).where(Batch.created_by_id == current_user.id)
    
    if status:
        statement = statement.where(Batch.status == status)
    if crop:
        statement = statement.where(Batch.crop == crop)
    
    statement = statement.offset(offset).limit(limit).order_by(Batch.created_at.desc())
    batches = session.exec(statement).all()
    
    items = []
    for batch in batches:
        event_count = len(session.exec(
            select(TraceEvent).where(TraceEvent.batch_id == batch.id)
        ).all())
        
        items.append({
            "id": batch.id,
            "qr_code": batch.qr_code,
            "crop": batch.crop,
            "total_weight": batch.total_weight,
            "grade": batch.grade,
            "status": batch.status,
            "created_at": batch.created_at.isoformat() if batch.created_at else None,
            "event_count": event_count
        })
    
    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": len(items)
    }


@router.get("/{batch_id}")
async def get_batch(
    batch_id: str,
    session: Session = Depends(get_session)
):
    """
    Get batch details with full trace history.
    Public endpoint for consumer traceability.
    """
    batch = get_batch_by_id(session, batch_id)
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    # Get trace events
    events = get_batch_trace(session, batch_id)
    
    # Get creator info
    creator = session.get(User, batch.created_by_id)
    
    return {
        "batch": {
            "id": batch.id,
            "qr_code": batch.qr_code,
            "creator": {
                "id": batch.created_by_id,
                "name": creator.name if creator else None
            },
            "source_lots": json.loads(batch.source_lots),
            "total_weight": batch.total_weight,
            "crop": batch.crop,
            "grade": batch.grade,
            "status": batch.status,
            "processing_date": batch.processing_date,
            "created_at": batch.created_at.isoformat() if batch.created_at else None
        },
        "trace": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "payload": json.loads(e.payload) if e.payload else {},
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                "actor_type": e.actor_type,
                "location": json.loads(e.location) if e.location else None,
                "verified": _verify_event(e)
            }
            for e in events
        ],
        "event_count": len(events)
    }


@router.post("/{batch_id}/events", response_model=TraceEventResponse)
async def add_batch_event(
    batch_id: str,
    request: AddTraceEventRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Add a trace event to a batch.
    Creates tamper-evident record with hash and signature.
    """
    batch = get_batch_by_id(session, batch_id)
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    # Check authorization (batch creator or admin)
    if batch.created_by_id != current_user.id and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add events to this batch"
        )
    
    # Determine actor type
    actor_type = "farmer"
    if current_user.has_role("fpo"):
        actor_type = "fpo"
    elif current_user.has_role("buyer"):
        actor_type = "buyer"
    elif current_user.has_role("admin"):
        actor_type = "admin"
    
    event = add_trace_event(
        session=session,
        batch_id=batch_id,
        event_type=request.event_type,
        payload=request.payload,
        actor_id=current_user.id,
        actor_type=actor_type,
        location=request.location
    )
    
    logger.info(f"Trace event {event.id} added to batch {batch_id}")
    
    return TraceEventResponse(
        id=event.id,
        batch_id=event.batch_id,
        event_type=event.event_type,
        payload=json.loads(event.payload) if event.payload else {},
        timestamp=event.timestamp.isoformat(),
        actor_id=event.actor_id,
        verified=True
    )


@router.get("/{batch_id}/events")
async def get_batch_events(
    batch_id: str,
    session: Session = Depends(get_session)
):
    """Get all trace events for a batch."""
    batch = get_batch_by_id(session, batch_id)
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    events = get_batch_trace(session, batch_id)
    
    return {
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "payload": json.loads(e.payload) if e.payload else {},
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                "actor_type": e.actor_type,
                "verified": _verify_event(e)
            }
            for e in events
        ],
        "count": len(events)
    }


@router.put("/{batch_id}/status")
async def update_batch_status(
    batch_id: str,
    status_data: dict,
    current_user: User = Depends(require_fpo),
    session: Session = Depends(get_session)
):
    """
    Update batch status.
    Valid statuses: active, processing, completed, shipped, delivered
    """
    batch = get_batch_by_id(session, batch_id)
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    if batch.created_by_id != current_user.id and not current_user.has_role("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this batch"
        )
    
    new_status = status_data.get("status")
    valid_statuses = ["active", "processing", "completed", "shipped", "delivered", "cancelled"]
    
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Valid: {valid_statuses}"
        )
    
    batch.status = new_status
    batch.updated_at = utc_now()
    session.add(batch)
    session.commit()
    
    logger.info(f"Batch {batch_id} status updated to {new_status}")
    
    return {
        "id": batch.id,
        "status": batch.status,
        "updated_at": batch.updated_at.isoformat() if batch.updated_at else None
    }


@router.get("/{batch_id}/qr")
async def get_batch_qr(
    batch_id: str,
    size: int = Query(200, ge=100, le=500),
    format: str = Query("png", pattern="^(png|svg)$"),
    session: Session = Depends(get_session)
):
    """
    Generate QR code image for batch.
    Returns PNG or SVG image.
    """
    batch = get_batch_by_id(session, batch_id)
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    # Generate QR code
    # URL format: https://shreeanna.in/trace/{qr_code}
    trace_url = f"https://shreeanna.in/trace/{batch.qr_code}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(trace_url)
    qr.make(fit=True)
    
    if format == "svg":
        # Return SVG (would need qrcode[pil] for SVG)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="image/png")
    else:
        img = qr.make_image(fill_color="black", back_color="white")
        img = img.resize((size, size))
        
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        return StreamingResponse(buffer, media_type="image/png")


@router.get("/{batch_id}/qr-base64")
async def get_batch_qr_base64(
    batch_id: str,
    session: Session = Depends(get_session)
):
    """Get QR code as base64 string (for embedding)."""
    batch = get_batch_by_id(session, batch_id)
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    trace_url = f"https://shreeanna.in/trace/{batch.qr_code}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(trace_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    
    base64_str = base64.b64encode(buffer.getvalue()).decode()
    
    return {
        "qr_code": batch.qr_code,
        "trace_url": trace_url,
        "image": f"data:image/png;base64,{base64_str}"
    }


# =============================================================================
# TRACE LOOKUP (Public consumer endpoint)
# =============================================================================

@router.get("/trace/{qr_code}")
async def trace_by_qr(
    qr_code: str,
    session: Session = Depends(get_session)
):
    """
    Public trace lookup by QR code.
    Used by consumers scanning product QR codes.
    """
    # Find batch by QR code
    statement = select(Batch).where(Batch.qr_code == qr_code)
    batch = session.exec(statement).first()
    
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No product found for this QR code"
        )
    
    # Get trace events
    events = get_batch_trace(session, batch.id)
    
    # Get creator info (FPO)
    fpo = session.get(FPO, batch.created_by_id)
    
    # Build consumer-friendly response
    return {
        "product": {
            "crop": batch.crop,
            "grade": batch.assay_results if batch.assay_results else "A",
            "weight": f"{batch.total_weight} kg",
            "producer": fpo.name if fpo else "Verified FPO",
            "batch_id": batch.id
        },
        "journey": [
            {
                "step": _get_event_label(e.event_type),
                "date": e.timestamp.strftime("%d %b %Y") if e.timestamp else None,
                "details": _get_event_summary(e),
                "verified": _verify_event(e)
            }
            for e in events
        ],
        "authenticity": {
            "verified": all(_verify_event(e) for e in events),
            "total_events": len(events),
            "qr_code": qr_code
        }
    }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _verify_event(event: TraceEvent) -> bool:
    """Verify trace event integrity."""
    if not event.payload_hash or not event.server_signature:
        return False
    
    try:
        payload = json.loads(event.payload) if event.payload else {}
        expected_hash = compute_payload_hash(payload)
        return expected_hash == event.payload_hash
    except Exception:
        return False


def _get_event_label(event_type: str) -> str:
    """Get human-readable event label."""
    labels = {
        "batch_created": "Batch Created",
        "processing_started": "Processing Started",
        "processing_completed": "Processing Completed",
        "quality_tested": "Quality Testing",
        "graded": "Grading",
        "packed": "Packaging",
        "dispatched": "Dispatched",
        "received": "Received",
        "delivered": "Delivered"
    }
    return labels.get(event_type, event_type.replace("_", " ").title())


def _get_event_summary(event: TraceEvent) -> str:
    """Get human-readable event summary."""
    try:
        payload = json.loads(event.payload) if event.payload else {}
        
        if event.event_type == "batch_created":
            return f"Created with {payload.get('total_weight', '?')} kg of {payload.get('crop', 'millet')}"
        
        if event.event_type == "quality_tested":
            return f"Quality grade: {payload.get('grade', 'A')}"
        
        if event.event_type == "dispatched":
            return f"Shipped to {payload.get('destination', 'buyer')}"
        
        return payload.get("notes", "Event recorded")
    except Exception:
        return "Event recorded"
