"""
Shree Anna Backend - Mock Logistics Service
Simulates logistics provider integration for development.
"""

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from dataclasses import dataclass, field
from enum import Enum
from loguru import logger


class LogisticsStatus(str, Enum):
    """Logistics shipment statuses."""
    PENDING = "pending"
    PICKUP_SCHEDULED = "pickup_scheduled"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETURNED = "returned"


@dataclass
class PickupSchedule:
    """Pickup schedule details."""
    id: str
    order_id: str
    pickup_date: datetime
    pickup_time_slot: str  # e.g., "9:00 AM - 12:00 PM"
    pickup_address: str
    contact_name: str
    contact_phone: str
    notes: Optional[str] = None
    status: str = "scheduled"
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Shipment:
    """Shipment tracking information."""
    id: str
    order_id: str
    tracking_number: str
    carrier: str = "ShreeAnna Logistics"
    status: LogisticsStatus = LogisticsStatus.PENDING
    origin_address: str = ""
    destination_address: str = ""
    weight_kg: float = 0.0
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    events: List[dict] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class DeliveryEstimate:
    """Delivery time and cost estimate."""
    origin_pincode: str
    destination_pincode: str
    weight_kg: float
    estimated_days: int
    estimated_cost: float
    service_type: str  # standard, express


class LogisticsService:
    """
    Mock logistics service for Shree Anna.
    In production, this would integrate with actual logistics providers like:
    - Delhivery
    - Shiprocket
    - Ecom Express
    - India Post
    """
    
    def __init__(self):
        self._schedules: dict[str, PickupSchedule] = {}
        self._shipments: dict[str, Shipment] = {}
        self._tracking_to_shipment: dict[str, str] = {}  # tracking_number -> shipment_id
        
        # Check for real logistics API keys
        self.delhivery_token = os.getenv("DELHIVERY_API_TOKEN")
        self.shiprocket_email = os.getenv("SHIPROCKET_EMAIL")
        self.shiprocket_password = os.getenv("SHIPROCKET_PASSWORD")
        
        self.mock_mode = not (self.delhivery_token or self.shiprocket_email)
        
        if self.mock_mode:
            logger.warning("Logistics running in MOCK mode - no real shipments")
        else:
            logger.info("Logistics service initialized with real provider")
    
    def _generate_tracking_number(self) -> str:
        """Generate a mock tracking number."""
        return f"SA{secrets.token_hex(6).upper()}"
    
    def _generate_id(self) -> str:
        """Generate a unique ID."""
        return f"log_{secrets.token_hex(8)}"
    
    def schedule_pickup(
        self,
        order_id: str,
        pickup_date: datetime,
        pickup_time_slot: str,
        pickup_address: str,
        contact_name: str,
        contact_phone: str,
        notes: Optional[str] = None,
    ) -> PickupSchedule:
        """
        Schedule a pickup for an order.
        """
        schedule = PickupSchedule(
            id=self._generate_id(),
            order_id=order_id,
            pickup_date=pickup_date,
            pickup_time_slot=pickup_time_slot,
            pickup_address=pickup_address,
            contact_name=contact_name,
            contact_phone=contact_phone,
            notes=notes,
            status="scheduled",
        )
        
        self._schedules[schedule.id] = schedule
        logger.info(f"Pickup scheduled: {schedule.id} for order {order_id}")
        
        return schedule
    
    def create_shipment(
        self,
        order_id: str,
        origin_address: str,
        destination_address: str,
        weight_kg: float,
        pickup_schedule_id: Optional[str] = None,
    ) -> Shipment:
        """
        Create a shipment and generate tracking number.
        """
        tracking_number = self._generate_tracking_number()
        
        # Estimate delivery based on mock distance calculation
        estimated_days = self._estimate_delivery_days(origin_address, destination_address)
        estimated_delivery = datetime.utcnow() + timedelta(days=estimated_days)
        
        shipment = Shipment(
            id=self._generate_id(),
            order_id=order_id,
            tracking_number=tracking_number,
            carrier="ShreeAnna Logistics",
            status=LogisticsStatus.PICKUP_SCHEDULED,
            origin_address=origin_address,
            destination_address=destination_address,
            weight_kg=weight_kg,
            estimated_delivery=estimated_delivery,
            events=[{
                "status": LogisticsStatus.PICKUP_SCHEDULED.value,
                "message": "Shipment created, pickup scheduled",
                "timestamp": datetime.utcnow().isoformat(),
                "location": origin_address[:50],
            }],
        )
        
        self._shipments[shipment.id] = shipment
        self._tracking_to_shipment[tracking_number] = shipment.id
        
        logger.info(f"Shipment created: {shipment.id} with tracking {tracking_number}")
        
        return shipment
    
    def _estimate_delivery_days(self, origin: str, destination: str) -> int:
        """Estimate delivery days based on addresses (mock)."""
        # In reality, this would use distance APIs
        # For mock, use simple heuristics
        origin_lower = origin.lower() if origin else ""
        dest_lower = destination.lower() if destination else ""
        
        # Same state = 2-3 days
        # Different state = 4-7 days
        # Check for common state indicators
        states = ["karnataka", "maharashtra", "telangana", "andhra", "tamil", "kerala", "gujarat", "rajasthan"]
        
        origin_state = None
        dest_state = None
        
        for state in states:
            if state in origin_lower:
                origin_state = state
            if state in dest_lower:
                dest_state = state
        
        if origin_state and dest_state and origin_state == dest_state:
            return 3  # Same state
        elif origin_state and dest_state:
            return 5  # Different state
        else:
            return 4  # Default
    
    def update_shipment_status(
        self,
        shipment_id: str,
        status: LogisticsStatus,
        message: str,
        location: Optional[str] = None,
    ) -> Optional[Shipment]:
        """
        Update shipment status with a new event.
        """
        shipment = self._shipments.get(shipment_id)
        if not shipment:
            return None
        
        shipment.status = status
        shipment.events.append({
            "status": status.value,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "location": location or "",
        })
        
        if status == LogisticsStatus.DELIVERED:
            shipment.actual_delivery = datetime.utcnow()
        
        logger.info(f"Shipment {shipment_id} updated to {status.value}")
        
        return shipment
    
    def get_shipment(self, shipment_id: str) -> Optional[Shipment]:
        """Get shipment by ID."""
        return self._shipments.get(shipment_id)
    
    def get_shipment_by_tracking(self, tracking_number: str) -> Optional[Shipment]:
        """Get shipment by tracking number."""
        shipment_id = self._tracking_to_shipment.get(tracking_number)
        if shipment_id:
            return self._shipments.get(shipment_id)
        return None
    
    def get_shipment_by_order(self, order_id: str) -> Optional[Shipment]:
        """Get shipment for an order."""
        for shipment in self._shipments.values():
            if shipment.order_id == order_id:
                return shipment
        return None
    
    def estimate_delivery(
        self,
        origin_pincode: str,
        destination_pincode: str,
        weight_kg: float,
    ) -> DeliveryEstimate:
        """
        Get delivery time and cost estimate.
        """
        # Mock estimation
        # In reality, this would call logistics provider APIs
        
        days = 4  # Default
        
        # Same first 2 digits = same zone = faster
        if origin_pincode[:2] == destination_pincode[:2]:
            days = 2
        elif origin_pincode[:1] == destination_pincode[:1]:
            days = 3
        
        # Cost calculation (mock)
        # Base rate + per kg rate
        base_rate = 50.0
        per_kg_rate = 15.0
        cost = base_rate + (weight_kg * per_kg_rate)
        
        # Express option
        express_cost = cost * 1.5
        express_days = max(1, days - 1)
        
        return DeliveryEstimate(
            origin_pincode=origin_pincode,
            destination_pincode=destination_pincode,
            weight_kg=weight_kg,
            estimated_days=days,
            estimated_cost=round(cost, 2),
            service_type="standard",
        )
    
    def get_available_time_slots(self, date: datetime) -> List[str]:
        """Get available pickup time slots for a date."""
        # Mock time slots
        return [
            "9:00 AM - 12:00 PM",
            "12:00 PM - 3:00 PM",
            "3:00 PM - 6:00 PM",
        ]
    
    def cancel_pickup(self, schedule_id: str) -> bool:
        """Cancel a scheduled pickup."""
        schedule = self._schedules.get(schedule_id)
        if schedule and schedule.status == "scheduled":
            schedule.status = "cancelled"
            return True
        return False
    
    def simulate_progress(self, shipment_id: str) -> Optional[Shipment]:
        """
        Simulate shipment progress (for testing).
        Moves shipment to next logical status.
        """
        shipment = self._shipments.get(shipment_id)
        if not shipment:
            return None
        
        status_flow = [
            (LogisticsStatus.PICKUP_SCHEDULED, LogisticsStatus.PICKED_UP, "Package picked up from seller"),
            (LogisticsStatus.PICKED_UP, LogisticsStatus.IN_TRANSIT, "Package in transit to destination hub"),
            (LogisticsStatus.IN_TRANSIT, LogisticsStatus.OUT_FOR_DELIVERY, "Out for delivery"),
            (LogisticsStatus.OUT_FOR_DELIVERY, LogisticsStatus.DELIVERED, "Package delivered successfully"),
        ]
        
        for current, next_status, message in status_flow:
            if shipment.status == current:
                return self.update_shipment_status(shipment_id, next_status, message)
        
        return shipment


# Singleton instance
logistics_service = LogisticsService()
