"""
Notifications API routes - SMS templates, push notifications.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.db.init_db import get_session
from app.db.models import SmsTemplate, User
from app.core.security import get_current_user, RoleChecker
from app.core.utils import get_fallback_store, utc_now
from app.services.sms import SMSService

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Initialize services
sms_service = SMSService()


class SendSMSRequest(BaseModel):
    phone: str
    template_key: str
    variables: dict = {}


class SendNotificationRequest(BaseModel):
    user_id: str
    template_key: str
    variables: dict = {}


class BulkNotificationRequest(BaseModel):
    role: str
    template_key: str
    variables: dict = {}


class CreateTemplateRequest(BaseModel):
    key: str
    lang: str = "en"
    template: str
    description: Optional[str] = None


class UpdateTemplateRequest(BaseModel):
    template: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


# =============================================================================
# USER NOTIFICATION INBOX
# =============================================================================

@router.get("/")
@router.get("")
async def get_my_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Get current user's notifications inbox.
    """
    store = get_fallback_store("user_notifications")
    all_notifs = store.get_all()
    
    # Filter by user
    user_notifs = [
        n for n in all_notifs
        if n.get("user_id") == current_user.id
    ]
    
    # Filter unread only
    if unread_only:
        user_notifs = [n for n in user_notifs if not n.get("read")]
    
    # Sort by timestamp descending
    user_notifs.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Paginate
    paginated = user_notifs[skip:skip + limit]
    
    return {
        "notifications": paginated,
        "total": len(user_notifs),
        "unread_count": sum(1 for n in user_notifs if not n.get("read")),
        "skip": skip,
        "limit": limit
    }


@router.put("/read-all")
async def mark_all_read(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Mark all notifications as read for current user.
    """
    store = get_fallback_store("user_notifications")
    all_notifs = store.read_all()
    
    updated_count = 0
    for notif in all_notifs:
        if notif.get("user_id") == current_user.id and not notif.get("read"):
            notif["read"] = True
            notif["read_at"] = utc_now().isoformat()
            updated_count += 1
    
    # Update store
    store.write_all(all_notifs)
    
    return {
        "message": "All notifications marked as read",
        "updated_count": updated_count
    }


@router.post("/send")
async def send_user_notification(
    request: SendNotificationRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin", "fpo"]))
) -> dict:
    """
    Send a notification to a specific user.
    """
    import uuid
    
    # Get target user
    target_user = db.exec(select(User).where(User.id == request.user_id)).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get template
    template = db.exec(
        select(SmsTemplate)
        .where(SmsTemplate.key == request.template_key)
        .where(SmsTemplate.is_active == True)
    ).first()
    
    message = request.template_key  # Default to template key
    if template:
        try:
            message = template.template.format(**request.variables)
        except KeyError:
            pass
    
    # Store notification
    store = get_fallback_store("user_notifications")
    notif = {
        "id": str(uuid.uuid4()),
        "user_id": request.user_id,
        "template_key": request.template_key,
        "message": message,
        "variables": request.variables,
        "read": False,
        "created_at": utc_now().isoformat()
    }
    store.append(notif)
    
    return {
        "success": True,
        "notification_id": notif["id"],
        "message": "Notification sent"
    }


@router.post("/bulk")
async def send_bulk_notification(
    request: BulkNotificationRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Send notification to all users with a specific role.
    """
    import uuid
    
    # Get users by role
    users = db.exec(
        select(User).where(User.roles.contains(request.role))
    ).all()
    
    if not users:
        return {
            "success": True,
            "sent_count": 0,
            "message": f"No users found with role '{request.role}'"
        }
    
    # Get template
    template = db.exec(
        select(SmsTemplate)
        .where(SmsTemplate.key == request.template_key)
        .where(SmsTemplate.is_active == True)
    ).first()
    
    message = request.template_key
    if template:
        try:
            message = template.template.format(**request.variables)
        except KeyError:
            pass
    
    # Send to all users
    store = get_fallback_store("user_notifications")
    sent_count = 0
    
    for user in users:
        notif = {
            "id": str(uuid.uuid4()),
            "user_id": user.id,
            "template_key": request.template_key,
            "message": message,
            "variables": request.variables,
            "read": False,
            "created_at": utc_now().isoformat(),
            "bulk": True,
            "role": request.role
        }
        store.append(notif)
        sent_count += 1
    
    return {
        "success": True,
        "sent_count": sent_count,
        "role": request.role,
        "message": f"Notification sent to {sent_count} users"
    }


@router.get("/templates")
async def list_templates(
    lang: Optional[str] = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    List all SMS templates (admin only).
    """
    query = select(SmsTemplate)
    if lang:
        query = query.where(SmsTemplate.lang == lang)
    
    templates = db.exec(query).all()
    
    return {
        "templates": [
            {
                "id": t.id,
                "key": t.key,
                "lang": t.lang,
                "template": t.template,
                "description": t.description,
                "is_active": t.is_active,
            }
            for t in templates
        ]
    }


@router.post("/templates")
async def create_template(
    request: CreateTemplateRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Create a new SMS template (admin only).
    """
    # Check if template with same key and lang exists
    existing = db.exec(
        select(SmsTemplate)
        .where(SmsTemplate.key == request.key)
        .where(SmsTemplate.lang == request.lang)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Template with key '{request.key}' and lang '{request.lang}' already exists"
        )
    
    template = SmsTemplate(
        key=request.key,
        lang=request.lang,
        template=request.template,
        description=request.description,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return {
        "message": "Template created successfully",
        "template": {
            "id": template.id,
            "key": template.key,
            "lang": template.lang,
        }
    }


@router.put("/templates/{template_id}")
async def update_template(
    template_id: str,
    request: UpdateTemplateRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Update an SMS template (admin only).
    """
    template = db.exec(
        select(SmsTemplate).where(SmsTemplate.id == template_id)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    if request.template is not None:
        template.template = request.template
    if request.description is not None:
        template.description = request.description
    if request.is_active is not None:
        template.is_active = request.is_active
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return {
        "message": "Template updated successfully",
        "template": {
            "id": template.id,
            "key": template.key,
            "template": template.template,
            "is_active": template.is_active,
        }
    }


@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Delete an SMS template (admin only).
    """
    template = db.exec(
        select(SmsTemplate).where(SmsTemplate.id == template_id)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    db.delete(template)
    db.commit()
    
    return {"message": "Template deleted successfully"}


@router.post("/send")
async def send_notification(
    request: SendSMSRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin", "fpo"]))
) -> dict:
    """
    Send an SMS notification using a template (admin/FPO only).
    """
    # Get template
    template = db.exec(
        select(SmsTemplate)
        .where(SmsTemplate.key == request.template_key)
        .where(SmsTemplate.is_active == True)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active template '{request.template_key}' not found"
        )
    
    # Render template
    try:
        message = template.template.format(**request.variables)
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing variable in template: {e}"
        )
    
    # Send SMS
    result = await sms_service.send_sms(request.phone, message)
    
    if result["success"]:
        return {
            "success": True,
            "message": "SMS sent successfully",
            "message_id": result.get("message_id"),
        }
    else:
        return {
            "success": False,
            "message": "Failed to send SMS",
            "error": result.get("error"),
        }


@router.post("/bulk-send")
async def bulk_send_notifications(
    phones: list[str],
    template_key: str,
    variables: dict = {},
    db: Session = Depends(get_session),
    current_user: User = Depends(RoleChecker(["admin"]))
) -> dict:
    """
    Send SMS to multiple recipients (admin only).
    """
    # Get template
    template = db.exec(
        select(SmsTemplate)
        .where(SmsTemplate.key == template_key)
        .where(SmsTemplate.is_active == True)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active template '{template_key}' not found"
        )
    
    # Render template
    try:
        message = template.template.format(**variables)
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing variable in template: {e}"
        )
    
    # Send SMS to all phones
    results = {
        "total": len(phones),
        "success": 0,
        "failed": 0,
        "details": []
    }
    
    for phone in phones:
        result = await sms_service.send_sms(phone, message)
        if result["success"]:
            results["success"] += 1
        else:
            results["failed"] += 1
        results["details"].append({
            "phone": phone,
            "success": result["success"],
            "error": result.get("error"),
        })
    
    return results
