
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, select
from app.db.session import engine
from app.db.models import User, Farmer, Processor, Buyer, generate_uuid, FPO

def ensure_dev_users():
    with Session(engine) as session:
        print("Checking/Creating Developer Users...")
        
        # 1. Farmer (1111111111)
        farmer_phone = "+911111111111"
        user = session.exec(select(User).where(User.phone == farmer_phone)).first()
        if not user:
            print("Creating Dev Farmer...")
            user = User(
                id=generate_uuid(),
                phone=farmer_phone,
                name="Dev Farmer",
                roles="farmer",
                district="Pune",
                onboarded=True
            )
            session.add(user)
            session.flush()
            
            profile = Farmer(
                id=generate_uuid(),
                user_id=user.id,
                name="Dev Farmer",
                district="Pune",
                state="Maharashtra",
                village="Dev Village",
                land_holding_acres=10.0
            )
            session.add(profile)
            session.commit()
        else:
             print("Dev Farmer exists.")

        # 2. FPO (2222222222)
        fpo_phone = "+912222222222"
        user = session.exec(select(User).where(User.phone == fpo_phone)).first()
        if not user:
            print("Creating Dev FPO...")
            user = User(
                id=generate_uuid(),
                phone=fpo_phone,
                name="Dev FPO",
                roles="fpo",
                district="Nashik",
                onboarded=True
            )
            session.add(user)
            session.flush()
            
            profile = FPO(
                id=generate_uuid(),
                user_id=user.id,
                name="Dev FPO Representative",
                organization_name="Sahyadri FPO",
                district="Nashik",
                state="Maharashtra"
            )
            session.add(profile)
            session.commit()
        else:
             print("Dev FPO exists.")
             
        # 3. Processor (3333333333)
        proc_phone = "+913333333333"
        user = session.exec(select(User).where(User.phone == proc_phone)).first()
        if not user:
            print("Creating Dev Processor...")
            user = User(
                id=generate_uuid(),
                phone=proc_phone,
                name="Dev Processor",
                roles="processor",
                district="Aurangabad",
                onboarded=True
            )
            session.add(user)
            session.flush()
            
            profile = Processor(
                id=generate_uuid(),
                user_id=user.id,
                company_name="Dev Foods",
                district="Aurangabad",
                state="Maharashtra",
                fssai_license="DEV123456",
                unit_type="medium"
            )
            session.add(profile)
            session.commit()
        else:
             print("Dev Processor exists.")
             
        # 4. Buyer (4444444444)
        buyer_phone = "+914444444444"
        user = session.exec(select(User).where(User.phone == buyer_phone)).first()
        if not user:
            print("Creating Dev Buyer...")
            user = User(
                id=generate_uuid(),
                phone=buyer_phone,
                name="Dev Buyer",
                roles="buyer",
                district="Mumbai",
                onboarded=True
            )
            session.add(user)
            session.flush()
            
            profile = Buyer(
                id=generate_uuid(),
                user_id=user.id,
                name="Dev Buyer",
                company_name="Urban Retails",
                district="Mumbai",
                state="Maharashtra",
                buyer_type="retailer"
            )
            session.add(profile)
            session.commit()
        else:
             print("Dev Buyer exists.")
             
        # 5. Admin (5555555555)
        admin_phone = "+915555555555"
        user = session.exec(select(User).where(User.phone == admin_phone)).first()
        if not user:
             print("Creating Dev Admin...")
             user = User(
                id=generate_uuid(),
                phone=admin_phone,
                name="Dev Admin",
                roles="admin",
                district="Delhi",
                onboarded=True
            )
             session.add(user)
             session.commit()
        else:
             print("Dev Admin exists.")
        
        print("All dev users checked/created.")

if __name__ == "__main__":
    ensure_dev_users()
