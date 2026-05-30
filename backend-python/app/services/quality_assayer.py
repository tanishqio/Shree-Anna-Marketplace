"""
Shree Anna Backend - Quality Assayer Service
Mock quality inspection and lab report service.
"""

import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from loguru import logger


class QualityAssayerService:
    """Mock Quality Assayer service for inspection scheduling and lab reports."""
    
    def __init__(self):
        # In-memory storage for inspection requests
        self._inspections: Dict[str, dict] = {}
        self._lab_reports: Dict[str, dict] = {}
    
    def request_inspection(
        self,
        batch_id: str,
        requester_id: str,
        requester_type: str,  # farmer, fpo
        crop_type: str,
        quantity_kg: float,
        location: str,
        preferred_date: Optional[str] = None,
        notes: Optional[str] = None
    ) -> dict:
        """
        Request a quality inspection for a batch.
        """
        inspection_id = f"INS-{secrets.token_urlsafe(8).upper()}"
        
        # Generate scheduled date (2-3 days from now)
        if preferred_date:
            scheduled_date = preferred_date
        else:
            scheduled_date = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
        
        inspection = {
            "id": inspection_id,
            "batch_id": batch_id,
            "requester_id": requester_id,
            "requester_type": requester_type,
            "crop_type": crop_type,
            "quantity_kg": quantity_kg,
            "location": location,
            "scheduled_date": scheduled_date,
            "status": "scheduled",  # scheduled, in_progress, completed, cancelled
            "notes": notes,
            "assayer_name": "Dr. Ramesh Kumar",  # Mock assayer
            "assayer_phone": "+91 98765 43210",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        self._inspections[inspection_id] = inspection
        
        logger.info(f"[MOCK QA] Inspection scheduled: {inspection_id} for batch {batch_id}")
        
        return {
            "success": True,
            "inspection_id": inspection_id,
            "batch_id": batch_id,
            "scheduled_date": scheduled_date,
            "assayer_name": inspection["assayer_name"],
            "assayer_phone": inspection["assayer_phone"],
            "message": f"Inspection scheduled for {scheduled_date}"
        }
    
    def get_inspection(self, inspection_id: str) -> Optional[dict]:
        """Get inspection details."""
        return self._inspections.get(inspection_id)
    
    def list_inspections(
        self,
        requester_id: Optional[str] = None,
        batch_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[dict]:
        """List inspections with optional filters."""
        results = []
        for inspection in self._inspections.values():
            if requester_id and inspection["requester_id"] != requester_id:
                continue
            if batch_id and inspection["batch_id"] != batch_id:
                continue
            if status and inspection["status"] != status:
                continue
            results.append(inspection)
        return results
    
    def complete_inspection(
        self,
        inspection_id: str,
        grade: str,  # A, B, C, D
        moisture_level: float,
        foreign_matter: float,
        is_organic: bool = False,
        notes: Optional[str] = None
    ) -> dict:
        """
        Complete an inspection and generate lab report.
        """
        if inspection_id not in self._inspections:
            return {"success": False, "error": "Inspection not found"}
        
        inspection = self._inspections[inspection_id]
        
        if inspection["status"] == "completed":
            return {"success": False, "error": "Inspection already completed"}
        
        # Update inspection status
        inspection["status"] = "completed"
        inspection["completed_at"] = datetime.utcnow().isoformat()
        inspection["updated_at"] = datetime.utcnow().isoformat()
        
        # Generate lab report
        report_id = f"LAB-{secrets.token_urlsafe(8).upper()}"
        
        # Calculate quality score (mock)
        quality_score = 100
        if grade == "B":
            quality_score = 80
        elif grade == "C":
            quality_score = 60
        elif grade == "D":
            quality_score = 40
        
        # Adjust for moisture and foreign matter
        if moisture_level > 14:
            quality_score -= (moisture_level - 14) * 2
        if foreign_matter > 1:
            quality_score -= (foreign_matter - 1) * 5
        
        quality_score = max(0, min(100, quality_score))
        
        lab_report = {
            "id": report_id,
            "inspection_id": inspection_id,
            "batch_id": inspection["batch_id"],
            "crop_type": inspection["crop_type"],
            "grade": grade,
            "quality_score": round(quality_score, 1),
            "moisture_level": moisture_level,
            "foreign_matter": foreign_matter,
            "is_organic": is_organic,
            "parameters": {
                "moisture": {"value": moisture_level, "unit": "%", "max_allowed": 14},
                "foreign_matter": {"value": foreign_matter, "unit": "%", "max_allowed": 2},
                "broken_grains": {"value": round(secrets.randbelow(50) / 10, 1), "unit": "%", "max_allowed": 5},
                "damaged_grains": {"value": round(secrets.randbelow(30) / 10, 1), "unit": "%", "max_allowed": 3},
                "weevilled_grains": {"value": round(secrets.randbelow(20) / 10, 1), "unit": "%", "max_allowed": 2},
            },
            "assayer_name": inspection["assayer_name"],
            "assayer_license": "FSSAI/QA/2024/12345",
            "notes": notes,
            "report_url": f"https://storage.example.com/reports/{report_id}.pdf",
            "issued_at": datetime.utcnow().isoformat(),
            "valid_until": (datetime.utcnow() + timedelta(days=90)).isoformat()
        }
        
        self._lab_reports[report_id] = lab_report
        
        logger.info(f"[MOCK QA] Lab report generated: {report_id} for batch {inspection['batch_id']}")
        
        return {
            "success": True,
            "report_id": report_id,
            "grade": grade,
            "quality_score": quality_score,
            "lab_report": lab_report
        }
    
    def get_lab_report(self, report_id: str) -> Optional[dict]:
        """Get lab report by ID."""
        return self._lab_reports.get(report_id)
    
    def get_lab_report_by_batch(self, batch_id: str) -> Optional[dict]:
        """Get lab report for a batch."""
        for report in self._lab_reports.values():
            if report["batch_id"] == batch_id:
                return report
        return None
    
    def cancel_inspection(self, inspection_id: str, reason: Optional[str] = None) -> dict:
        """Cancel a scheduled inspection."""
        if inspection_id not in self._inspections:
            return {"success": False, "error": "Inspection not found"}
        
        inspection = self._inspections[inspection_id]
        
        if inspection["status"] in ["completed", "cancelled"]:
            return {"success": False, "error": f"Cannot cancel {inspection['status']} inspection"}
        
        inspection["status"] = "cancelled"
        inspection["cancelled_at"] = datetime.utcnow().isoformat()
        inspection["cancel_reason"] = reason
        inspection["updated_at"] = datetime.utcnow().isoformat()
        
        logger.info(f"[MOCK QA] Inspection cancelled: {inspection_id}")
        
        return {"success": True, "message": "Inspection cancelled"}


# Singleton instance
qa_service = QualityAssayerService()
