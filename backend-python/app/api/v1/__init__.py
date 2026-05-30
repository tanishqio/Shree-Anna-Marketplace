"""
Shree Anna Backend - API Router
Combines all v1 API routes.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.admin import router as admin_router
from app.api.v1.schemes import router as schemes_router
from app.api.v1.offers import router as offers_router
from app.api.v1.orders import router as orders_router
from app.api.v1.speech import router as speech_router
from app.api.v1.listings import router as listings_router
from app.api.v1.trace import router as trace_router
from app.api.v1.batches import router as batches_router
from app.api.v1.fpo import router as fpo_router
from app.api.v1.payments import router as payments_router
from app.api.v1.weather import router as weather_router
from app.api.v1.sync import router as sync_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.voice import router as voice_router
from app.api.v1.shop import router as shop_router
from app.api.v1.kyc import router as kyc_router
from app.api.v1.qa import router as qa_router
from app.api.v1.developer import router as developer_router


api_router = APIRouter()

# Include all routes
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(admin_router)
api_router.include_router(schemes_router)
api_router.include_router(speech_router)
api_router.include_router(listings_router)
api_router.include_router(offers_router)
api_router.include_router(orders_router)
api_router.include_router(trace_router)
api_router.include_router(batches_router)
api_router.include_router(fpo_router)
api_router.include_router(payments_router)
api_router.include_router(weather_router)
api_router.include_router(sync_router)
api_router.include_router(notifications_router)
api_router.include_router(voice_router)
api_router.include_router(shop_router)
api_router.include_router(kyc_router)
api_router.include_router(qa_router)
api_router.include_router(developer_router)
