"""
Shree Anna Backend - Quality Assayer API Routes
Quality inspection and lab report endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.core.security import get_current_user, RoleChecker
from app.db import get_session, User, Batch
from app.services.quality_assayer import qa_service


router = APIRouter(prefix="/qa", tags=["Quality Assayer"])


class RequestInspectionRequest(BaseModel):
    """Request quality inspection."""
    batch_id: str = Field(..., description="Batch ID to inspect")
    location: str = Field(..., description="Inspection location")
    preferred_date: Optional[str] = Field(None, description="Preferred date (YYYY-MM-DD)")
    notes: Optional[str] = Field(None, description="Additional notes")


class CompleteInspectionRequest(BaseModel):
    """Complete inspection with results (admin/QA only)."""
    grade: str = Field(..., description="Quality grade (A, B, C, D)")
    moisture_level: float = Field(..., ge=0, le=25, description="Moisture %")
    foreign_matter: float = Field(..., ge=0, le=10, description="Foreign matter %")
    is_organic: bool = Field(default=False)
    notes: Optional[str] = None


@router.post("/request")
async def request_inspection(
    request: RequestInspectionRequest,
    current_user: User = Depends(RoleChecker(["farmer", "fpo"])),
    session: Session = Depends(get_session)
):
    """
    Request a quality inspection for a batch.
    Available to farmers and FPOs.
    """
    # Verify batch exists
    batch = session.get(Batch, request.batch_id)
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found"
        )
    
    # Check authorization (must own the batch)
    if batch.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to request inspection for this batch"
        )
    
    # Determine requester type
    requester_type = "fpo" if "fpo" in current_user.get_roles() else "farmer"
    
    result = qa_service.request_inspection(
        batch_id=request.batch_id,
        requester_id=current_user.id,
        requester_type=requester_type,
        crop_type=batch.crop,
        quantity_kg=batch.total_weight or 0,
        location=request.location,
        preferred_date=request.preferred_date,
        notes=request.notes
    )
    
    return result


@router.get("/inspections")
async def list_my_inspections(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List inspections for current user.
    """
    inspections = qa_service.list_inspections(requester_id=current_user.id, status=status_filter)
    
    return {
        "inspections": inspections,
        "total": len(inspections)
    }


@router.get("/inspections/{inspection_id}")
async def get_inspection(
    inspection_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get inspection details.
    """
    inspection = qa_service.get_inspection(inspection_id)
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found"
        )
    
    # Check authorization
    if inspection["requester_id"] != current_user.id and "admin" not in current_user.get_roles():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this inspection"
        )
    
    return inspection


@router.post("/inspections/{inspection_id}/complete")
async def complete_inspection(
    inspection_id: str,
    request: CompleteInspectionRequest,
    current_user: User = Depends(RoleChecker(["admin"])),
    session: Session = Depends(get_session)
):
    """
    Complete an inspection and generate lab report.
    Admin/QA only.
    """
    result = qa_service.complete_inspection(
        inspection_id=inspection_id,
        grade=request.grade,
        moisture_level=request.moisture_level,
        foreign_matter=request.foreign_matter,
        is_organic=request.is_organic,
        notes=request.notes
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to complete inspection")
        )
    
    # Update batch grade if available
    inspection = qa_service.get_inspection(inspection_id)
    if inspection:
        batch = session.get(Batch, inspection["batch_id"])
        if batch:
            batch.grade = request.grade
            session.add(batch)
            session.commit()
    
    return result


@router.post("/inspections/{inspection_id}/cancel")
async def cancel_inspection(
    inspection_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Cancel a scheduled inspection.
    """
    inspection = qa_service.get_inspection(inspection_id)
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found"
        )
    
    # Check authorization
    if inspection["requester_id"] != current_user.id and "admin" not in current_user.get_roles():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this inspection"
        )
    
    result = qa_service.cancel_inspection(inspection_id, reason)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to cancel inspection")
        )
    
    return result


@router.get("/reports/{report_id}")
async def get_lab_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get lab report by ID.
    """
    report = qa_service.get_lab_report(report_id)
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab report not found"
        )
    
    return report


@router.get("/batch/{batch_id}/report")
async def get_batch_lab_report(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get lab report for a specific batch.
    """
    report = qa_service.get_lab_report_by_batch(batch_id)
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No lab report found for this batch"
        )
    
    return report
