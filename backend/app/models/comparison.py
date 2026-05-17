"""Comparison models"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum


class ChangeType(str, Enum):
    """Type of change in comparison"""
    ADDED = "added"
    REMOVED = "removed"
    MODIFIED = "modified"
    UNCHANGED = "unchanged"


class SensorDiff(BaseModel):
    """Difference in sensor configuration"""
    sensor_id: str
    sensor_name: str
    change_type: ChangeType
    original_config: Optional[Dict[str, Any]] = None
    modified_config: Optional[Dict[str, Any]] = None
    field_changes: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        json_schema_extra = {
            "example": {
                "sensor_id": "com_instana_plugin_mysql",
                "sensor_name": "com.instana.plugin.mysql",
                "change_type": "modified",
                "original_config": {"enabled": False, "poll_rate": 60},
                "modified_config": {"enabled": True, "poll_rate": 30},
                "field_changes": {
                    "enabled": {"old": False, "new": True},
                    "poll_rate": {"old": 60, "new": 30}
                }
            }
        }


class DiffStats(BaseModel):
    """Statistics about the comparison"""
    total_sensors: int
    added: int
    removed: int
    modified: int
    unchanged: int

    class Config:
        json_schema_extra = {
            "example": {
                "total_sensors": 184,
                "added": 5,
                "removed": 2,
                "modified": 10,
                "unchanged": 167
            }
        }


class ComparisonResult(BaseModel):
    """Result of comparing two configuration files"""
    added_sensors: List[str]
    removed_sensors: List[str]
    modified_sensors: List[SensorDiff]
    stats: DiffStats
    diff_text: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "added_sensors": ["com.instana.plugin.redis"],
                "removed_sensors": ["com.instana.plugin.old"],
                "modified_sensors": [],
                "stats": {
                    "total_sensors": 184,
                    "added": 1,
                    "removed": 1,
                    "modified": 0,
                    "unchanged": 182
                },
                "diff_text": "--- original\n+++ modified\n..."
            }
        }

# Made with Bob
