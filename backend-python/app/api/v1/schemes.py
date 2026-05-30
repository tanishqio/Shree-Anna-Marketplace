"""
Shree Anna Backend - Government Schemes API Routes
Information about millet-related government schemes and eligibility.
"""

from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlmodel import Session
from loguru import logger

from app.core.security import get_current_user, get_optional_user
from app.db import get_session, User


router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


# =============================================================================
# SCHEME DATA (In production, this would be in database)
# =============================================================================

GOVERNMENT_SCHEMES = [
    {
        "id": "scheme_001",
        "name": "PM-Kisan Samman Nidhi",
        "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
        "description": "Direct income support of ₹6,000 per year to farmer families",
        "description_hi": "किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता",
        "benefit_amount": 6000,
        "benefit_frequency": "annual",
        "applicable_crops": ["all"],
        "eligibility": {
            "land_holding_max_acres": 5,
            "roles": ["farmer"],
            "organic_preference": False
        },
        "documents_required": ["Aadhaar", "Land Records", "Bank Account"],
        "apply_url": "https://pmkisan.gov.in",
        "status": "active"
    },
    {
        "id": "scheme_002",
        "name": "National Mission on Natural Farming (NMNF)",
        "name_hi": "राष्ट्रीय प्राकृतिक कृषि मिशन",
        "description": "Support for organic and natural farming practices with focus on millets",
        "description_hi": "बाजरे पर ध्यान देने के साथ जैविक और प्राकृतिक कृषि पद्धतियों के लिए सहायता",
        "benefit_amount": 15000,
        "benefit_frequency": "one_time",
        "applicable_crops": ["ragi", "bajra", "jowar", "kodo", "kutki", "foxtail"],
        "eligibility": {
            "land_holding_min_acres": 0.5,
            "roles": ["farmer"],
            "organic_preference": True
        },
        "documents_required": ["Aadhaar", "Land Records", "Organic Certification"],
        "apply_url": "https://naturalfarming.gov.in",
        "status": "active"
    },
    {
        "id": "scheme_003",
        "name": "Millet Mission - Shree Anna Yojana",
        "name_hi": "मिलेट मिशन - श्री अन्न योजना",
        "description": "Special incentive for millet cultivation under International Year of Millets",
        "description_hi": "अंतर्राष्ट्रीय मिलेट वर्ष के तहत बाजरा खेती के लिए विशेष प्रोत्साहन",
        "benefit_amount": 10000,
        "benefit_frequency": "per_hectare",
        "applicable_crops": ["ragi", "bajra", "jowar", "kodo", "kutki", "foxtail", "barnyard", "proso", "little", "browntop"],
        "eligibility": {
            "land_holding_min_acres": 0.25,
            "roles": ["farmer", "fpo"],
            "organic_preference": False
        },
        "documents_required": ["Aadhaar", "Land Records", "Crop Declaration"],
        "apply_url": "https://shreeanna.gov.in",
        "status": "active"
    },
    {
        "id": "scheme_004",
        "name": "FPO Promotion Scheme",
        "name_hi": "एफपीओ प्रोत्साहन योजना",
        "description": "Financial support for forming and running Farmer Producer Organizations",
        "description_hi": "किसान उत्पादक संगठनों के गठन और संचालन के लिए वित्तीय सहायता",
        "benefit_amount": 1500000,
        "benefit_frequency": "one_time",
        "applicable_crops": ["all"],
        "eligibility": {
            "roles": ["fpo"],
            "min_members": 100,
            "registration_required": True
        },
        "documents_required": ["FPO Registration", "Member List", "Bank Account"],
        "apply_url": "https://sfac.gov.in",
        "status": "active"
    },
    {
        "id": "scheme_005",
        "name": "Pradhan Mantri Fasal Bima Yojana",
        "name_hi": "प्रधानमंत्री फसल बीमा योजना",
        "description": "Crop insurance scheme with premium subsidy for farmers",
        "description_hi": "किसानों के लिए प्रीमियम सब्सिडी के साथ फसल बीमा योजना",
        "benefit_amount": None,
        "benefit_frequency": "as_needed",
        "applicable_crops": ["all"],
        "eligibility": {
            "roles": ["farmer"],
            "land_records_required": True
        },
        "documents_required": ["Aadhaar", "Land Records", "Sowing Certificate"],
        "apply_url": "https://pmfby.gov.in",
        "status": "active"
    },
    {
        "id": "scheme_006",
        "name": "Agriculture Infrastructure Fund",
        "name_hi": "कृषि अवसंरचना कोष",
        "description": "Interest subvention for post-harvest management infrastructure",
        "description_hi": "कटाई के बाद प्रबंधन बुनियादी ढांचे के लिए ब्याज सबवेंशन",
        "benefit_amount": None,
        "benefit_frequency": "loan",
        "applicable_crops": ["all"],
        "eligibility": {
            "roles": ["farmer", "fpo", "buyer"],
            "for_processing": True
        },
        "documents_required": ["Project Report", "Land/Lease Document", "Bank Account"],
        "apply_url": "https://agriinfra.dac.gov.in",
        "status": "active"
    }
]


class SchemeResponse(BaseModel):
    """Scheme response model."""
    id: str
    name: str
    name_hi: Optional[str]
    description: str
    description_hi: Optional[str]
    benefit_amount: Optional[float]
    benefit_frequency: Optional[str]
    applicable_crops: List[str]
    apply_url: Optional[str]
    status: str


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/")
@router.get("")
async def list_schemes(
    crop: Optional[str] = Query(None, description="Filter by applicable crop"),
    role: Optional[str] = Query(None, description="Filter by eligible role"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    lang: str = Query("en", description="Language for response (en, hi)"),
    current_user: Optional[User] = Depends(get_optional_user),
    session: Session = Depends(get_session)
):
    """
    List all government schemes with optional filters.
    """
    schemes = GOVERNMENT_SCHEMES.copy()
    
    # Filter by crop
    if crop:
        schemes = [
            s for s in schemes
            if "all" in s["applicable_crops"] or crop.lower() in [c.lower() for c in s["applicable_crops"]]
        ]
    
    # Filter by role
    if role:
        schemes = [
            s for s in schemes
            if role.lower() in [r.lower() for r in s["eligibility"].get("roles", [])]
        ]
    
    # Filter by status
    if status_filter:
        schemes = [s for s in schemes if s["status"] == status_filter]
    
    # Format response - include all localized fields for client-side switching
    result = []
    for scheme in schemes:
        item = {
            "id": scheme["id"],
            "name": scheme["name"],
            "name_hi": scheme.get("name_hi"),
            "description": scheme["description"],
            "description_hi": scheme.get("description_hi"),
            "benefit_amount": scheme["benefit_amount"],
            "benefit_frequency": scheme["benefit_frequency"],
            "applicable_crops": scheme["applicable_crops"],
            "apply_url": scheme["apply_url"],
            "status": scheme["status"]
        }
        result.append(item)
    
    return {
        "schemes": result,
        "total": len(result),
        "filters": {
            "crop": crop,
            "role": role,
            "status": status_filter
        }
    }


@router.get("/eligibility")
async def check_eligibility(
    scheme_id: Optional[str] = Query(None, description="Check eligibility for specific scheme"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Check user's eligibility for government schemes.
    Returns list of schemes user is eligible for.
    """
    from app.db import get_farmer_by_user_id, get_fpo_by_user_id
    
    user_roles = current_user.get_roles()
    farmer_profile = get_farmer_by_user_id(session, current_user.id)
    fpo_profile = get_fpo_by_user_id(session, current_user.id)
    
    eligible_schemes = []
    ineligible_schemes = []
    
    schemes_to_check = GOVERNMENT_SCHEMES
    if scheme_id:
        schemes_to_check = [s for s in GOVERNMENT_SCHEMES if s["id"] == scheme_id]
    
    for scheme in schemes_to_check:
        eligibility = scheme["eligibility"]
        reasons = []
        is_eligible = True
        
        # Check role eligibility
        eligible_roles = eligibility.get("roles", [])
        if not any(role in user_roles for role in eligible_roles):
            is_eligible = False
            reasons.append(f"Requires one of roles: {', '.join(eligible_roles)}")
        
        # Check land holding (if farmer and criteria exists)
        if farmer_profile:
            import json
            land_size = farmer_profile.land_size or 0
            
            if eligibility.get("land_holding_max_acres") and land_size > eligibility["land_holding_max_acres"]:
                is_eligible = False
                reasons.append(f"Land holding exceeds {eligibility['land_holding_max_acres']} acres limit")
            
            if eligibility.get("land_holding_min_acres") and land_size < eligibility["land_holding_min_acres"]:
                is_eligible = False
                reasons.append(f"Land holding below {eligibility['land_holding_min_acres']} acres minimum")
            
            # Check organic certification preference
            if eligibility.get("organic_preference"):
                geo = json.loads(farmer_profile.geo) if farmer_profile.geo else {}
                if not geo.get("organic_certified"):
                    reasons.append("Organic certification preferred (not required)")
        
        # Check FPO specific criteria
        if "fpo" in eligible_roles and fpo_profile:
            if eligibility.get("registration_required") and not fpo_profile.registration_no:
                is_eligible = False
                reasons.append("FPO registration required")
        
        result = {
            "scheme_id": scheme["id"],
            "scheme_name": scheme["name"],
            "eligible": is_eligible,
            "reasons": reasons if not is_eligible else [],
            "documents_required": scheme["documents_required"],
            "apply_url": scheme["apply_url"]
        }
        
        if is_eligible:
            eligible_schemes.append(result)
        else:
            ineligible_schemes.append(result)
    
    return {
        "user_id": current_user.id,
        "user_roles": user_roles,
        "eligible_schemes": eligible_schemes,
        "ineligible_schemes": ineligible_schemes,
        "total_eligible": len(eligible_schemes)
    }


@router.get("/{scheme_id}")
async def get_scheme_details(
    scheme_id: str,
    lang: str = Query("en", description="Language for response (en, hi)"),
    session: Session = Depends(get_session)
):
    """
    Get detailed information about a specific scheme.
    """
    scheme = next((s for s in GOVERNMENT_SCHEMES if s["id"] == scheme_id), None)
    
    if not scheme:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found"
        )
    
    return {
        "id": scheme["id"],
        "name": scheme["name_hi"] if lang == "hi" and scheme.get("name_hi") else scheme["name"],
        "description": scheme["description_hi"] if lang == "hi" and scheme.get("description_hi") else scheme["description"],
        "benefit_amount": scheme["benefit_amount"],
        "benefit_frequency": scheme["benefit_frequency"],
        "applicable_crops": scheme["applicable_crops"],
        "eligibility_criteria": scheme["eligibility"],
        "documents_required": scheme["documents_required"],
        "apply_url": scheme["apply_url"],
        "status": scheme["status"]
    }
