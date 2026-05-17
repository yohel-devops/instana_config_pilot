"""Sensors router for managing sensor configurations"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.sensor import Sensor, SensorUpdate
from app.models.validation import ValidationResult
from app.services.validator import SensorValidator

router = APIRouter(prefix="/api/sensors", tags=["sensors"])

# In-memory storage for demo (in production, use a database)
_sensors_store: Dict[str, Sensor] = {}


@router.post("/store")
async def store_sensors(sensors: List[Sensor]):
    """
    Store parsed sensors in memory
    
    Args:
        sensors: List of sensors to store
        
    Returns:
        Success message
    """
    global _sensors_store
    _sensors_store = {sensor.id: sensor for sensor in sensors}
    return {
        "message": "Sensors stored successfully",
        "count": len(sensors)
    }


@router.get("/", response_model=List[Sensor])
async def get_all_sensors():
    """
    Get all stored sensors
    
    Returns:
        List of all sensors
    """
    return list(_sensors_store.values())


@router.get("/{sensor_id}", response_model=Sensor)
async def get_sensor(sensor_id: str):
    """
    Get specific sensor by ID
    
    Args:
        sensor_id: Sensor identifier
        
    Returns:
        Sensor object
        
    Raises:
        HTTPException: If sensor not found
    """
    if sensor_id not in _sensors_store:
        raise HTTPException(
            status_code=404,
            detail=f"Sensor {sensor_id} not found"
        )
    
    return _sensors_store[sensor_id]


@router.put("/{sensor_id}", response_model=Sensor)
async def update_sensor(sensor_id: str, update: SensorUpdate):
    """
    Update sensor configuration
    
    Args:
        sensor_id: Sensor identifier
        update: Update data
        
    Returns:
        Updated sensor
        
    Raises:
        HTTPException: If sensor not found
    """
    if sensor_id not in _sensors_store:
        raise HTTPException(
            status_code=404,
            detail=f"Sensor {sensor_id} not found"
        )
    
    sensor = _sensors_store[sensor_id]
    
    # Update fields
    if update.enabled is not None:
        sensor.enabled = update.enabled
    
    if update.config is not None:
        sensor.config = update.config
    
    _sensors_store[sensor_id] = sensor
    
    return sensor


@router.post("/validate/{sensor_id}", response_model=ValidationResult)
async def validate_sensor(sensor_id: str):
    """
    Validate specific sensor configuration
    
    Args:
        sensor_id: Sensor identifier
        
    Returns:
        Validation result
        
    Raises:
        HTTPException: If sensor not found
    """
    if sensor_id not in _sensors_store:
        raise HTTPException(
            status_code=404,
            detail=f"Sensor {sensor_id} not found"
        )
    
    sensor = _sensors_store[sensor_id]
    validator = SensorValidator()
    result = validator.validate_sensor(sensor)
    
    return result


@router.get("/category/{category}", response_model=List[Sensor])
async def get_sensors_by_category(category: str):
    """
    Get all sensors in a specific category
    
    Args:
        category: Category name
        
    Returns:
        List of sensors in category
    """
    sensors = [
        sensor for sensor in _sensors_store.values()
        if sensor.category.value == category
    ]
    
    return sensors


@router.get("/search/{query}", response_model=List[Sensor])
async def search_sensors(query: str):
    """
    Search sensors by name or display name
    
    Args:
        query: Search query
        
    Returns:
        List of matching sensors
    """
    query_lower = query.lower()
    sensors = [
        sensor for sensor in _sensors_store.values()
        if query_lower in sensor.name.lower() or query_lower in sensor.display_name.lower()
    ]
    
    return sensors


@router.delete("/{sensor_id}")
async def delete_sensor(sensor_id: str):
    """
    Remove sensor from store
    
    Args:
        sensor_id: Sensor identifier
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If sensor not found
    """
    if sensor_id not in _sensors_store:
        raise HTTPException(
            status_code=404,
            detail=f"Sensor {sensor_id} not found"
        )
    
    del _sensors_store[sensor_id]
    
    return {"message": f"Sensor {sensor_id} deleted successfully"}


@router.post("/clear")
async def clear_sensors():
    """
    Clear all stored sensors
    
    Returns:
        Success message
    """
    global _sensors_store
    count = len(_sensors_store)
    _sensors_store = {}
    
    return {
        "message": "All sensors cleared",
        "count": count
    }

# Made with Bob
