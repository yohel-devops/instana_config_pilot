"""Sensor data models"""
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class SensorCategory(str, Enum):
    """Sensor categories"""
    CLOUD_AWS = "cloud_aws"
    CLOUD_AZURE = "cloud_azure"
    CLOUD_GCP = "cloud_gcp"
    CLOUD_IBM = "cloud_ibm"
    CLOUD_ALIBABA = "cloud_alibaba"
    DATABASE = "database"
    MESSAGING = "messaging"
    APPLICATION_SERVER = "application_server"
    MONITORING = "monitoring"
    CONTAINER = "container"
    TRACING = "tracing"
    CONFIGURATION = "configuration"
    ACTION = "action"
    OTHER = "other"


class SensorConfig(BaseModel):
    """Base sensor configuration"""
    enabled: Optional[bool] = True
    poll_rate: Optional[int] = Field(None, ge=1, le=3600)
    tags: Optional[List[str]] = None
    additional_config: Dict[str, Any] = Field(default_factory=dict)


class Sensor(BaseModel):
    """Sensor model"""
    id: str = Field(..., description="Unique sensor identifier")
    name: str = Field(..., description="Sensor name (e.g., com.instana.plugin.mysql)")
    display_name: str = Field(..., description="Human-readable name")
    category: SensorCategory
    enabled: bool = True
    config: Dict[str, Any] = Field(default_factory=dict)
    description: Optional[str] = None
    requires_credentials: bool = False
    env_variables: List[str] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "com_instana_plugin_mysql",
                "name": "com.instana.plugin.mysql",
                "display_name": "MySQL",
                "category": "database",
                "enabled": True,
                "config": {
                    "enabled": True,
                    "poll_rate": 30,
                    "user": "root",
                    "password": "secret",
                    "host": "localhost",
                    "port": 3306
                },
                "description": "MySQL database monitoring",
                "requires_credentials": True,
                "env_variables": ["COM_INSTANA_PLUGIN_MYSQL_PASSWORD"]
            }
        }


class SensorUpdate(BaseModel):
    """Sensor update model"""
    enabled: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None


class ParsedConfiguration(BaseModel):
    """Parsed configuration result"""
    sensors: List[Sensor]
    total_sensors: int
    enabled_sensors: int
    categories: Dict[str, int]
    has_vault_integration: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "sensors": [],
                "total_sensors": 184,
                "enabled_sensors": 12,
                "categories": {
                    "database": 20,
                    "cloud_aws": 25,
                    "messaging": 10
                },
                "has_vault_integration": False
            }
        }

# Made with Bob
