"""
Shree Anna Backend - Seed Data Script
Populates database with sample data for demo/testing.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session
from loguru import logger

from app.db.init_db import engine, create_db_and_tables, init_database
from app.db.models import User, Farmer, FPO, Listing, Batch, TraceEvent
from app.db.crud import (
    create_user, create_farmer_profile, create_fpo_profile,
    create_listing, create_batch, add_trace_event, get_user_by_phone
)
from app.core.utils import normalize_phone


def seed_users(session: Session):
    """Seed sample users."""
    users = [
        {
            "phone": "+919876543210",
            "name": "राम किसान",
            "roles": "farmer",
            "language": "hi",
            "district": "tumkur"
        },
        {
            "phone": "+919876543211",
            "name": "सीता देवी",
            "roles": "farmer",
            "language": "hi",
            "district": "raichur"
        },
        {
            "phone": "+919876543212",
            "name": "FPO Tumkur",
            "roles": "fpo",
            "language": "en",
            "district": "tumkur"
        },
        {
            "phone": "+919876543213",
            "name": "Buyer Corp",
            "roles": "buyer",
            "language": "en",
            "district": "bangalore"
        },
        {
            "phone": "+919876543214",
            "name": "Admin User",
            "roles": "admin",
            "language": "en",
            "district": "bangalore"
        }
    ]
    
    created_users = []
    for user_data in users:
        # Check if user already exists
        existing = get_user_by_phone(session, user_data["phone"])
        if existing:
            created_users.append(existing)
            logger.info(f"User already exists: {existing.name} ({existing.phone})")
            continue
        user = create_user(session, **user_data)
        created_users.append(user)
        logger.info(f"Created user: {user.name} ({user.phone})")
    
    return created_users


def seed_farmer_profiles(session: Session, users: list):
    """Seed farmer profiles."""
    farmers = [u for u in users if u.has_role("farmer")]
    
    profiles = [
        {"land_size": 2.5, "geo": {"lat": 13.34, "lon": 77.10}, "crops": ["ragi", "bajra"]},
        {"land_size": 3.0, "geo": {"lat": 16.20, "lon": 77.35}, "crops": ["jowar", "kodo"]}
    ]
    
    for i, farmer in enumerate(farmers):
        if i < len(profiles):
            # Check if profile exists
            existing_profile = session.query(Farmer).filter(Farmer.user_id == farmer.id).first()
            if existing_profile:
                logger.info(f"Farmer profile already exists for: {farmer.name}")
                continue
                
            create_farmer_profile(
                session,
                user_id=farmer.id,
                **profiles[i]
            )
            logger.info(f"Created farmer profile for: {farmer.name}")


def seed_fpo_profiles(session: Session, users: list):
    """Seed FPO profiles."""
    fpos = [u for u in users if u.has_role("fpo")]
    
    for fpo in fpos:
        # Check if profile exists
        existing_profile = session.query(FPO).filter(FPO.user_id == fpo.id).first()
        if existing_profile:
            logger.info(f"FPO profile already exists for: {fpo.name}")
            continue

        create_fpo_profile(
            session,
            user_id=fpo.id,
            name="तुमकुर मिलेट FPO",
            registration_no="FPO/KA/2023/12345",
            address="Tumkur, Karnataka",
            district="tumkur"
        )
        logger.info(f"Created FPO profile for: {fpo.name}")


def seed_listings(session: Session, users: list):
    """Seed sample listings."""
    farmers = [u for u in users if u.has_role("farmer")]
    
    import json

    listings_data = [
        {
            "crop": "ragi",
            "qty_kg": 500,
            "min_price_per_qtl": 3200,
            "description": "High quality Finger Millet (Ragi). Freshly harvested.",
            "quality_grade": "A",
            "status": "active",
            "photos": json.dumps([
                "https://images.unsplash.com/photo-1631209121750-a9cb60696d58?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1662545936746-88062973167b?q=80&w=800&auto=format&fit=crop"
            ])
        },
        {
            "crop": "bajra",
            "qty_kg": 300,
            "min_price_per_qtl": 2800,
            "description": "Pearl Millet (Bajra) - Organic & Clean.",
            "quality_grade": "A",
            "status": "active",
            "photos": json.dumps([
                "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=800&auto=format&fit=crop"
            ])
        },
        {
            "crop": "jowar",
            "qty_kg": 400,
            "min_price_per_qtl": 3000,
            "description": "Sorghum (Jowar) - White variant, good for rotis.",
            "quality_grade": "B",
            "status": "active",
            "photos": json.dumps([
                "https://images.unsplash.com/photo-1471193945509-9adadd0974ce?q=80&w=800&auto=format&fit=crop"
            ])
        },
        {
            "crop": "kodo",
            "qty_kg": 200,
            "min_price_per_qtl": 3500,
            "description": "Kodo Millet - Premium quality for health conscious buyers.",
            "quality_grade": "A",
            "status": "active",
            "photos": json.dumps([
                "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=800&auto=format&fit=crop"
            ])
        },
        {
            "crop": "foxtail",
            "qty_kg": 150,
            "min_price_per_qtl": 4000,
            "description": "Organic Foxtail Millet.",
            "quality_grade": "A+",
            "status": "active",
            "photos": json.dumps([
                "https://plus.unsplash.com/premium_photo-1675237626068-bf0427b3724c?q=80&w=800&auto=format&fit=crop"
            ])
        }
    ]
    
    created_listings = []
    logger.info(f"Seeding listings for {len(farmers)} farmers...")
    
    for i, listing_data in enumerate(listings_data):
        farmer = farmers[i % len(farmers)]
        
        # Check if similar listing exists
        existing = session.query(Listing).filter(
            Listing.owner_id == farmer.id,
            Listing.crop == listing_data["crop"]
        ).first()
        
        if existing:
            # Update existing listing with photos and details
            existing.photos = listing_data["photos"]
            existing.description = listing_data["description"]
            existing.status = listing_data["status"]
            existing.min_price_per_qtl = listing_data["min_price_per_qtl"]
            session.add(existing)
            created_listings.append(existing)
            logger.info(f"Updated listing: {existing.crop} by {farmer.name}")
        else:
            # Create new
            listing = create_listing(
                session,
                owner_type="farmer",
                owner_id=farmer.id,
                district=farmer.district,
                **listing_data
            )
            created_listings.append(listing)
            logger.info(f"Created listing: {listing.crop} by {farmer.name}")
    
    return created_listings


def seed_batches(session: Session, users: list):
    """Seed sample batches with trace events."""
    fpo_users = [u for u in users if u.has_role("fpo")]
    
    if not fpo_users:
        logger.warning("No FPO users found, skipping batch seeding")
        return []
    
    fpo_user = fpo_users[0]
    
    # Get the FPO profile ID (not user ID) - Batch.created_by_id references fpos.id
    from app.db.models import FPO
    fpo_profile = session.query(FPO).filter(FPO.user_id == fpo_user.id).first()
    if not fpo_profile:
        logger.warning("No FPO profile found, skipping batch seeding")
        return []
    
    # Create a sample batch using FPO profile ID
    batch = create_batch(
        session,
        created_by_id=fpo_profile.id,  # Use FPO profile ID, not User ID
        source_lots=["LOT001", "LOT002", "LOT003"],
        total_weight=1500.0,
        crop="ragi",
        grade="A",
        processing_date="2024-01-15"
    )
    
    logger.info(f"Created batch: {batch.id} ({batch.qr_code})")
    
    # Add trace events
    events = [
        {
            "event_type": "processing_started",
            "payload": {"notes": "Cleaning and sorting started", "operator": "Ram"}
        },
        {
            "event_type": "quality_tested",
            "payload": {"grade": "A", "moisture": 12.5, "lab": "AgriLab Tumkur"}
        },
        {
            "event_type": "processing_completed",
            "payload": {"notes": "Hulling completed", "yield_percent": 68}
        },
        {
            "event_type": "packed",
            "payload": {"package_count": 30, "package_weight": 50, "bag_type": "Jute"}
        }
    ]
    
    for event in events:
        add_trace_event(
            session,
            batch_id=batch.id,
            event_type=event["event_type"],
            payload=event["payload"],
            actor_id=fpo_profile.id,
            actor_type="fpo"
        )
        logger.info(f"Added trace event: {event['event_type']}")
    
    return [batch]


def main():
    """Main seed function."""
    logger.info("🌾 Starting database seeding...")
    
    # Initialize database
    init_database()
    
    with Session(engine) as session:
        # Seed data
        users = seed_users(session)
        seed_farmer_profiles(session, users)
        seed_fpo_profiles(session, users)
        listings = seed_listings(session, users)
        batches = seed_batches(session, users)
        
        session.commit()
    
    logger.info("Database seeding complete!")
    logger.info(f"   - Users: {len(users)}")
    logger.info(f"   - Listings: {len(listings)}")
    logger.info(f"   - Batches: {len(batches)}")
    
    print("\n" + "="*50)
    print("Sample credentials for testing:")
    print("="*50)
    print("Farmer:  +919876543210")
    print("FPO:     +919876543212")
    print("Buyer:   +919876543213")
    print("Admin:   +919876543214")
    print("="*50)


if __name__ == "__main__":
    main()
