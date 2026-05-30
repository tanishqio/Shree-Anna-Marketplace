
import sys
import os
import random
import uuid
from datetime import datetime, timedelta

# Add backend directory to path to import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, select
from app.db.session import engine
from app.db.models import Listing, User, Farmer, Processor, generate_uuid

# Image paths (relative to public folder)
RAW_IMAGES = [
    "/seed_images/raw_ragi.png",
    "/seed_images/raw_jowar.png",
    "/seed_images/raw_bajra.png"
]

PROCESSED_IMAGES = [
    "/seed_images/millet_flour.png",
    "/seed_images/millet_cookies.png",
    "/seed_images/millet_mix.png"
]

MILLET_TYPES = [
    {"id": "ragi", "name": "Ragi (Finger Millet)"},
    {"id": "jowar", "name": "Jowar (Sorghum)"},
    {"id": "bajra", "name": "Bajra (Pearl Millet)"},
    {"id": "foxtail", "name": "Foxtail Millet"},
]

DISTRICTS = ["Pune", "Nashik", "Aurangabad", "Nagpur", "Satara", "Kolhapur"]

def create_dummy_users(session: Session):
    print("Check/Create dummy users...")
    
    # 1. Farmer User
    try:
        farmer_user = session.exec(select(User).where(User.phone == "9999999999")).first()
        if not farmer_user:
            print("Creating Farmer User...")
            farmer_user = User(
                id=generate_uuid(),
                phone="9999999999",
                name="Ramesh Farmer",
                roles=["farmer"],
                district="Pune",
                onboarded=True
            )
            session.add(farmer_user)
            session.commit()
            print("  Created Farmer User.")
        else:
            print(f"  Farmer User exists: {farmer_user.id}")
            
        # Refresh to ensure we have the ID valid
        session.refresh(farmer_user)

        # 2. Farmer Profile
        farmer_profile = session.exec(select(Farmer).where(Farmer.user_id == farmer_user.id)).first()
        if not farmer_profile:
            print("Creating Farmer Profile...")
            farmer_profile = Farmer(
                id=generate_uuid(),
                user_id=farmer_user.id,
                name="Ramesh Farmer",
                district="Pune",
                state="Maharashtra",
                village="Mulshi",
                land_holding_acres=5.5
            )
            session.add(farmer_profile)
            session.commit()
            print("  Created Farmer Profile.")
        else:
            print(f"  Farmer Profile exists: {farmer_profile.id}")

    except Exception as e:
        print(f"Error creating farmer: {e}")
        session.rollback()
        # Try to recover farmer_user if it was committed but profile failed? 
        # For simple script, just re-fetch
        farmer_user = session.exec(select(User).where(User.phone == "9999999999")).first()

    # 3. Processor User
    try:
        processor_user = session.exec(select(User).where(User.phone == "8888888888")).first()
        if not processor_user:
            print("Creating Processor User...")
            processor_user = User(
                id=generate_uuid(),
                phone="8888888888",
                name="Suresh Processor",
                roles=["processor"],
                district="Nashik",
                onboarded=True
            )
            session.add(processor_user)
            session.commit()
            print("  Created Processor User.")
        else:
            print(f"  Processor User exists: {processor_user.id}")
            
        session.refresh(processor_user)

        # 4. Processor Profile
        processor_profile = session.exec(select(Processor).where(Processor.user_id == processor_user.id)).first()
        if not processor_profile:
            print("Creating Processor Profile...")
            processor_profile = Processor(
                id=generate_uuid(),
                user_id=processor_user.id,
                company_name="Suresh Foods",
                district="Nashik",
                state="Maharashtra",
                fssai_license="FSSAI123456789",
                unit_type="small"
            )
            session.add(processor_profile)
            session.commit()
            print("  Created Processor Profile.")
        else:
            print(f"  Processor Profile exists: {processor_profile.id}")

    except Exception as e:
        print(f"Error creating processor: {e}")
        session.rollback()
        processor_user = session.exec(select(User).where(User.phone == "8888888888")).first()
        
    return farmer_user, processor_user


def seed_listings(session: Session):
    print("Seeding listings...")
    
    # 1. Clear existing seed data (optional, but good for testing)
    # session.exec("DELETE FROM listings WHERE description LIKE '%Local%' OR description LIKE '%Freshly processed%'")
    # session.commit()

    farmers = session.exec(select(Farmer)).all()
    processors = session.exec(select(Processor)).all()
    
    if not farmers:
        print("Error: No farmers found.")
    if not processors:
        print("Error: No processors found.")
        
    if not farmers and not processors:
        return

    listings_created = 0

    try:
        # Seed 15 Raw Material Listings (Farmers)
        if farmers:
            print(f"Seeding Raw Materials using {len(farmers)} farmers...")
            for i in range(15):
                farmer = random.choice(farmers)
                millet = random.choice(MILLET_TYPES)
                
                # Pick unique image based on millet type mostly
                if "ragi" in millet["id"]: img = "/seed_images/raw_ragi.png"
                elif "jowar" in millet["id"]: img = "/seed_images/raw_jowar.png"
                elif "bajra" in millet["id"]: img = "/seed_images/raw_bajra.png"
                else: img = random.choice(RAW_IMAGES)

                listing = Listing(
                    id=generate_uuid(),
                    owner_type="farmer",
                    owner_id=farmer.id,
                    crop=millet["id"],
                    variety=f"Local {millet['name']} Variety",
                    qty_kg=random.randint(100, 1000),
                    min_price_per_qtl=random.randint(2000, 5000),
                    photos=f'["{img}"]',
                    status="active",
                    quality_grade=random.choice(["A", "B", "Premium"]),
                    is_organic=random.choice([True, False]),
                    district=random.choice(DISTRICTS),
                    state="Maharashtra",
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
                    is_processed=False
                )
                session.add(listing)
                listings_created += 1
        
        # Seed 15 Processed Product Listings (Processors)
        if processors:
            print(f"Seeding Processed Products using {len(processors)} processors...")
            products = [
                {"type": "flour", "name": "Millet Flour", "img": "/seed_images/millet_flour.png"},
                {"type": "cookies", "name": "Millet Cookies", "img": "/seed_images/millet_cookies.png"},
                {"type": "snacks", "name": "Millet Mix", "img": "/seed_images/millet_mix.png"}
            ]
            
            for i in range(15):
                processor = random.choice(processors)
                product = random.choice(products)
                millet = random.choice(MILLET_TYPES)
                
                listing = Listing(
                    id=generate_uuid(),
                    owner_type="processor",
                    owner_id=processor.id,
                    crop=millet["id"],
                    product_type=product["type"],
                    description=f"Freshly processed {product['name']} made from high quality {millet['name']}",
                    qty_kg=random.randint(10, 100),
                    min_price_per_qtl=random.randint(8000, 15000),
                    photos=f'["{product["img"]}"]',
                    status="active",
                    is_organic=random.choice([True, False]),
                    district=processor.district if processor.district else "Pune",
                    state="Maharashtra",
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
                    is_processed=True,
                    fssai_license=processor.fssai_license
                )
                session.add(listing)
                listings_created += 1

        session.commit()
        print(f"Successfully seeded {listings_created} listings!")
        
    except Exception as e:
        print(f"Error seeding listings: {e}")
        session.rollback()

def main():
    try:
        with Session(engine) as session:
            create_dummy_users(session)
            seed_listings(session)
    except Exception as e:
        print(f"Critical Error: {e}")


if __name__ == "__main__":
    main()
