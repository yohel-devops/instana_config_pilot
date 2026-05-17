"""Validation models"""
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class ValidationLevel(str, Enum):
    """Validation issue severity levels"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class ValidationIssue(BaseModel):
    """Validation issue"""
    level: ValidationLevel
    field: str
    message: str
    suggestion: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "level": "error",
                "field": "poll_rate",
                "message": "poll_rate must be between 1 and 3600 seconds",
                "suggestion": "Set poll_rate to a value between 1 and 3600"
            }
        }


class ValidationResult(BaseModel):
    """Validation result"""
    is_valid: bool
    issues: List[ValidationIssue] = Field(default_factory=list)
    sensor_id: str

    @property
    def has_errors(self) -> bool:
        """Check if there are any errors"""
        return any(issue.level == ValidationLevel.ERROR for issue in self.issues)

    @property
    def has_warnings(self) -> bool:
        """Check if there are any warnings"""
        return any(issue.level == ValidationLevel.WARNING for issue in self.issues)

    class Config:
        json_schema_extra = {
            "example": {
                "is_valid": False,
                "issues": [
                    {
                        "level": "error",
                        "field": "poll_rate",
                        "message": "poll_rate must be between 1 and 3600 seconds"
                    }
                ],
                "sensor_id": "com_instana_plugin_mysql"
            }
        }

# Made with Bob
