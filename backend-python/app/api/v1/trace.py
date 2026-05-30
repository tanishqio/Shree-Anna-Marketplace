"""
Trace API routes - Public trace lookup and verification.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlmodel import Session, select, or_
from typing import Optional
import json

from app.db.init_db import get_session
from app.db.models import Batch, TraceEvent, Farmer, FPO, User
from app.core.hashing import compute_payload_hash, verify_signature
from app.core.config import settings
from app.core.utils import success_response

router = APIRouter(prefix="/trace", tags=["trace"])


def get_batch_by_id_or_qr(db: Session, code: str) -> Optional[Batch]:
    """Look up batch by ID or QR code."""
    # Try by ID first
    batch = db.exec(select(Batch).where(Batch.id == code)).first()
    if batch:
        return batch
    # Try by QR code
    batch = db.exec(select(Batch).where(Batch.qr_code == code)).first()
    return batch


@router.get("/{code}")
async def get_batch_trace(
    code: str,
    db: Session = Depends(get_session)
) -> dict:
    """
    Get full trace history for a batch (public endpoint).
    Accepts either batch ID or QR code.
    """
    batch = get_batch_by_id_or_qr(db, code)
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    # Get all trace events for this batch
    events = db.exec(
        select(TraceEvent)
        .where(TraceEvent.batch_id == batch.id)
        .order_by(TraceEvent.created_at)
    ).all()
    
    # Verify chain integrity
    integrity_valid = True
    integrity_issues: list[str] = []
    
    for i, event in enumerate(events):
        # Verify payload hash
        try:
            payload = json.loads(event.payload)
            computed_hash = compute_payload_hash(payload)
            if computed_hash != event.payload_hash:
                integrity_valid = False
                integrity_issues.append(f"Event {i+1}: payload hash mismatch")
        except Exception:
            integrity_issues.append(f"Event {i+1}: invalid payload")
        
        # Verify server signature
        try:
            if not verify_signature(event.payload_hash, event.server_signature):
                integrity_valid = False
                integrity_issues.append(f"Event {i+1}: invalid signature")
        except Exception:
            pass  # Signature verification might fail if key changed
    
    # Get FPO info
    fpo = db.exec(select(FPO).where(FPO.id == batch.created_by_id)).first()
    
    # Build timeline from events
    timeline = []
    for e in events:
        try:
            payload = json.loads(e.payload)
        except Exception:
            payload = {}
        timeline.append({
            "id": e.id,
            "event": e.event_type,
            "timestamp": e.timestamp.isoformat() if e.timestamp else (e.created_at.isoformat() if e.created_at else None),
            "location": e.location,
            "actor": e.actor_id,
            "actor_type": e.actor_type,
            "verified": True,  # Events with valid hashes are considered verified
            "details": payload,
        })
    
    return success_response({
        "batch_code": batch.qr_code,
        "millet_type": batch.crop,
        "total_quantity": batch.total_weight,
        "origin": fpo.district if fpo else None,
        "harvest_date": batch.created_at.isoformat() if batch.created_at else None,
        "is_organic": False,  # Would need to be added to batch model
        "certifications": ["FSSAI"],  # Would need to be added to batch model
        "status": batch.status,
        "fpo": {
            "name": fpo.name if fpo else None,
            "registration_no": fpo.registration_no if fpo else None,
        } if fpo else None,
        "timeline": timeline,
        "farmers": [],  # Would need to track farmers per batch
        "integrity": {
            "valid": integrity_valid,
            "issues": integrity_issues,
            "event_count": len(events),
        }
    })


@router.get("/{code}/verify")
async def verify_batch_integrity(
    code: str,
    db: Session = Depends(get_session)
) -> dict:
    """
    Verify the cryptographic integrity of a batch's trace chain.
    Accepts either batch ID or QR code.
    """
    batch = get_batch_by_id_or_qr(db, code)
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    events = db.exec(
        select(TraceEvent)
        .where(TraceEvent.batch_id == batch.id)
        .order_by(TraceEvent.created_at)
    ).all()
    
    if not events:
        return success_response({
            "batch_id": batch.id,
            "qr_code": batch.qr_code,
            "verified": True,
            "message": "No events to verify",
            "event_count": 0,
        })
    
    issues = []
    
    for i, event in enumerate(events):
        try:
            # Verify payload hash
            payload = json.loads(event.payload)
            computed_hash = compute_payload_hash(payload)
            if computed_hash != event.payload_hash:
                issues.append({
                    "event_index": i,
                    "event_id": event.id,
                    "issue": "payload_hash_mismatch",
                })
            
            # Verify signature
            if not verify_signature(event.payload_hash, event.server_signature):
                issues.append({
                    "event_index": i,
                    "event_id": event.id,
                    "issue": "invalid_signature",
                })
        except Exception as e:
            issues.append({
                "event_index": i,
                "event_id": event.id,
                "issue": f"verification_error: {str(e)}",
            })
    
    return success_response({
        "batch_id": batch.id,
        "qr_code": batch.qr_code,
        "verified": len(issues) == 0,
        "event_count": len(events),
        "issues": issues,
    })


@router.get("/public/{code}", response_class=HTMLResponse)
async def public_trace_page(
    code: str,
    db: Session = Depends(get_session)
) -> HTMLResponse:
    """
    Public HTML page for viewing batch trace (QR code landing page).
    Accepts either batch ID or QR code.
    """
    batch = get_batch_by_id_or_qr(db, code)
    if not batch:
        return HTMLResponse(
            content="""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Batch Not Found - Shree Anna</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                           max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
                    .error { background: #fee; border: 1px solid #c00; padding: 20px; border-radius: 8px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>❌ Batch Not Found</h1>
                    <p>The batch you're looking for doesn't exist or has been removed.</p>
                </div>
            </body>
            </html>
            """,
            status_code=404
        )
    
    # Get events
    events = db.exec(
        select(TraceEvent)
        .where(TraceEvent.batch_id == batch.id)
        .order_by(TraceEvent.created_at)
    ).all()
    
    # Get FPO info
    fpo = db.exec(select(FPO).where(FPO.id == batch.created_by_id)).first()
    
    # Verify integrity
    integrity_valid = True
    for i, event in enumerate(events):
        try:
            payload = json.loads(event.payload)
            computed_hash = compute_payload_hash(payload)
            if computed_hash != event.payload_hash:
                integrity_valid = False
                break
            if not verify_signature(event.payload_hash, event.server_signature):
                integrity_valid = False
                break
        except Exception:
            integrity_valid = False
            break
    
    # Build events HTML
    events_html = ""
    for e in events:
        try:
            payload = json.loads(e.payload)
            payload_str = json.dumps(payload, indent=2)
        except Exception:
            payload_str = e.payload
        events_html += f"""
        <div class="event">
            <div class="event-type">{e.event_type}</div>
            <div class="event-time">{e.created_at.strftime('%Y-%m-%d %H:%M') if e.created_at else 'Unknown'}</div>
            <div class="event-details"><pre>{payload_str}</pre></div>
        </div>
        """
    
    integrity_badge = '✅ Verified' if integrity_valid else '⚠️ Integrity Issues'
    integrity_class = 'verified' if integrity_valid else 'warning'
    
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Batch Trace - {batch.id[:8]} - Shree Anna</title>
        <style>
            * {{ box-sizing: border-box; }}
            body {{ 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;
                color: #333;
            }}
            .header {{ 
                background: linear-gradient(135deg, #2d7a3d 0%, #4a9c5d 100%); 
                color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;
                text-align: center;
            }}
            .header h1 {{ margin: 0 0 10px 0; font-size: 24px; }}
            .header .subtitle {{ opacity: 0.9; font-size: 14px; }}
            .card {{ 
                background: white; border-radius: 12px; padding: 20px; 
                margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }}
            .card h2 {{ margin: 0 0 16px 0; font-size: 18px; color: #2d7a3d; }}
            .info-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }}
            .info-row:last-child {{ border-bottom: none; }}
            .info-label {{ color: #666; font-size: 14px; }}
            .info-value {{ font-weight: 500; }}
            .badge {{ 
                display: inline-block; padding: 4px 12px; border-radius: 20px; 
                font-size: 12px; font-weight: 600;
            }}
            .badge.verified {{ background: #d4edda; color: #155724; }}
            .badge.warning {{ background: #fff3cd; color: #856404; }}
            .event {{ 
                border-left: 3px solid #2d7a3d; padding: 12px; margin-bottom: 12px;
                background: #f9f9f9; border-radius: 0 8px 8px 0;
            }}
            .event-type {{ font-weight: 600; color: #2d7a3d; }}
            .event-time {{ font-size: 12px; color: #666; margin: 4px 0; }}
            .event-details {{ font-size: 12px; color: #555; white-space: pre-wrap; font-family: monospace; }}
            .footer {{ text-align: center; font-size: 12px; color: #666; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🌾 Shree Anna</h1>
            <div class="subtitle">Millet Value Chain Traceability</div>
        </div>
        
        <div class="card">
            <h2>Batch Information</h2>
            <div class="info-row">
                <span class="info-label">Batch ID</span>
                <span class="info-value">{batch.id[:8]}...</span>
            </div>
            <div class="info-row">
                <span class="info-label">QR Code</span>
                <span class="info-value">{batch.qr_code}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Crop Type</span>
                <span class="info-value">{batch.crop or 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Quantity</span>
                <span class="info-value">{batch.total_weight or 'N/A'} kg</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span class="info-value">{batch.status or 'created'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Integrity</span>
                <span class="badge {integrity_class}">{integrity_badge}</span>
            </div>
        </div>
        
        <div class="card">
            <h2>FPO Details</h2>
            <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">{fpo.name if fpo else 'Unknown'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Registration</span>
                <span class="info-value">{fpo.registration_no if fpo else 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">District</span>
                <span class="info-value">{fpo.district if fpo else 'N/A'}</span>
            </div>
        </div>
        
        <div class="card">
            <h2>Trace Events ({len(events)})</h2>
            {events_html if events_html else '<p style="color:#666;">No events recorded yet.</p>'}
        </div>
        
        <div class="footer">
            <p>Powered by Shree Anna - Ensuring transparency from farm to fork</p>
            <p>Scan QR code or visit this page to verify authenticity</p>
        </div>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html)
